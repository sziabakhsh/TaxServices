using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using System.Text;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Clients;
using TaxServices.Infrastructure.Configuration;
using TaxServices.Infrastructure.Services;

namespace TaxServices.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly IEmployeeAccountStatusService _employeeAccountStatusService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IOptions<JwtOptions> _jwtOptions;
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly IOptions<PublicSiteOptions> _publicSiteOptions;
        private readonly IAccountEmailService _accountEmailService;

        // We are using Guid.Empty as the Default Tenant.
        // In the future, when we have a real Tenant, we will use the actual TenantId.
        // private static readonly Guid DefaultTenantId = Guid.Empty;

        public AuthService(
            UserManager<AppUser> userManager,
            IEmailService emailService,
            IEmployeeAccountStatusService employeeAccountStatusService,
            IJwtTokenService jwtTokenService,
            IOptions<JwtOptions> jwtOptions,
            ITaxServicesDbContext context,
            ITenantContext tenantContext,
            IOptions<PublicSiteOptions> publicSiteOptions,
            IAccountEmailService accountEmailService)
        {
            _userManager = userManager;
            _emailService = emailService;
            _employeeAccountStatusService = employeeAccountStatusService;
            _jwtTokenService = jwtTokenService;
            _jwtOptions = jwtOptions;
            _context = context;
            _tenantContext = tenantContext;
            _publicSiteOptions = publicSiteOptions;
            _accountEmailService = accountEmailService;
        }

        public async Task<AuthResponse> RegisterAsync(
            RegisterRequest request)
        {
            var email = request.Email.Trim();

            var tenantId = _publicSiteOptions.Value.TenantId;

            if (tenantId == Guid.Empty)
            {
                throw new InvalidOperationException("Public site TenantId is not configured.");
            }

            var existingUser =
                await _userManager.FindByEmailAsync(email);

            if (existingUser is not null)
            {
                throw new DuplicateUserException("User already exists.");
            }

            await using var transaction = await _context.BeginTransactionAsync();

            try
            {
                var user = new AppUser
                {
                    UserName = email,
                    Email = email,
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    TenantId = tenantId
                };

                var result =
                    await _userManager.CreateAsync(
                        user,
                        request.Password);

                if (!result.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        result.Errors.Select(
                            e => e.Description));

                    throw new ValidationException(errors);
                }

                var roleResult =
                    await _userManager.AddToRoleAsync(
                        user,
                        "Client");

                if (!roleResult.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        roleResult.Errors.Select(
                            e => e.Description));

                    throw new InvalidOperationException(
                        errors);
                }

                var client = new Client
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber =
                        request.PhoneNumber.Trim(),
                    IsActive = true
                };

                await _context.Clients.AddAsync(client);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var token =
                    await _jwtTokenService
                        .GenerateTokenAsync(user.Id);

                return new AuthResponse
                {
                    AccessToken = token,
                    ExpiresAt =
                        DateTime.UtcNow.AddMinutes(
                            _jwtOptions.Value
                                .ExpirationInMinutes)
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(
                request.Email.Trim());

            if (user is null)
                throw new InvalidCredentialsException();

            var passwordValid = await _userManager.CheckPasswordAsync(
                user,
                request.Password);

            if (!passwordValid)
                throw new InvalidCredentialsException();

            var employeeIsActive =
                await _employeeAccountStatusService
                    .GetActiveStatusAsync(user.Id);

            if (employeeIsActive == false)
                throw new InactiveAccountException();

            if (user.TwoFactorEnabled)
            {
                var code = await _userManager.GenerateTwoFactorTokenAsync(
                    user,
                    TokenOptions.DefaultEmailProvider);

                await _emailService.SendAsync(
                    user.Email!,
                    "Your verification code",
                    $"""
                    <h2>Two-Factor Authentication</h2>
                    <p>Your verification code is:</p>
                    <h1>{code}</h1>
                    <p>If you did not try to sign in, you can ignore this email.</p>
                    """);

                return new AuthResponse
                {
                    RequiresTwoFactor = true
                };
            }

            var token = await _jwtTokenService
                .GenerateTokenAsync(user.Id);

            return new AuthResponse
            {
                AccessToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(
                    _jwtOptions.Value.ExpirationInMinutes),
                RequiresTwoFactor = false
            };
        }

        public async Task<AuthResponse> VerifyTwoFactorAsync(
            VerifyTwoFactorRequest request)
        {
            var user = await _userManager.FindByEmailAsync(
                request.Email.Trim());

            if (user is null)
                throw new InvalidCredentialsException();

            if (!user.TwoFactorEnabled)
                throw new InvalidCredentialsException();

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider,
                request.Code.Trim());

            if (!isValid)
                throw new InvalidTwoFactorCodeException();

            var employeeIsActive =
                await _employeeAccountStatusService
                    .GetActiveStatusAsync(user.Id);

            if (employeeIsActive == false)
                throw new InactiveAccountException();

            var token = await _jwtTokenService
                .GenerateTokenAsync(user.Id);

            return new AuthResponse
            {
                AccessToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(
                    _jwtOptions.Value.ExpirationInMinutes),
                RequiresTwoFactor = false
            };
        }

        public async Task<CurrentUserResponse> GetCurrentUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException(
                    "User not found.");

            var roles = await _userManager.GetRolesAsync(user);

            return new CurrentUserResponse
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roles.ToArray()
            };
        }

        public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException(
                    "User not found.");

            var result = await _userManager.ChangePasswordAsync(
                user,
                request.CurrentPassword,
                request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new ValidationException(errors);
            }
        }

        public async Task<UserCreatedResponse> CreateUserAsync(NewUserRequestInApp request, CancellationToken cancellationToken = default)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);

            if (existingUser is not null)
                throw new DuplicateUserException("User already exists.");

            var user = new AppUser
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                TenantId = _tenantContext.TenantId
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));

                throw new ValidationException(errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, request.Role);

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }

            return new UserCreatedResponse
            {
                UserId = user.Id
            };
        }

        public async Task UpdateUserAsync(UpdatedUserRequestInApp request, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            user.Email = request.Email.Trim();
            user.UserName = request.Email.Trim();
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));

                throw new ValidationException(errors);
            }
        }

        public async Task<string> GeneratePasswordSetupTokenAsync(string userId, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task SetPasswordAsync(SetPasswordRequest request, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var user = await _userManager.FindByEmailAsync(request.Email.Trim());

            if (user is null)
                throw new InvalidOperationException("Invalid password setup request.");

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.Password);

            //var result = await _userManager.ResetPasswordAsync(
            //    user,
            //    request.Token,
            //    request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new ValidationException(errors);
            }
        }

        public async Task<bool> HasPasswordAsync(string userId, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            return await _userManager.HasPasswordAsync(user);
        }

        public async Task RequestPasswordResetAsync(
    string email,
    CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var normalizedEmail = email.Trim();

            var user = await _userManager.FindByEmailAsync(
                normalizedEmail);

            // Do not reveal whether the account exists.
            if (user is null ||
                string.IsNullOrWhiteSpace(user.Email))
            {
                return;
            }

            var passwordResetToken =
                await _userManager.GeneratePasswordResetTokenAsync(
                    user);

            await _accountEmailService.SendPasswordResetAsync(
                user.Email,
                passwordResetToken,
                cancellationToken);
        }

        public async Task<TwoFactorStatusResponse> GetTwoFactorStatusAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            return new TwoFactorStatusResponse
            {
                IsEnabled = user.TwoFactorEnabled
            };
        }

        public async Task RequestEnableTwoFactorAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            if (user.TwoFactorEnabled)
                return;

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new InvalidOperationException("User does not have an email address.");

            var code = await _userManager.GenerateTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider);

            await _emailService.SendAsync(
                user.Email,
                "Enable two-factor authentication",
                $"""
                <h2>Enable Two-Factor Authentication</h2>
                <p>Your verification code is:</p>
                <h1>{code}</h1>
                <p>Enter this code to enable two-factor authentication on your account.</p>
                """);
        }

        public async Task ConfirmEnableTwoFactorAsync(string userId, TwoFactorCodeRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            if (user.TwoFactorEnabled)
                return;

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider,
                request.Code.Trim());

            if (!isValid)
                throw new InvalidTwoFactorCodeException();

            var result = await _userManager.SetTwoFactorEnabledAsync(user, true);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }
        }

        public async Task RequestDisableTwoFactorAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            if (!user.TwoFactorEnabled)
                return;

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new InvalidOperationException(
                    "User does not have an email address.");

            var code = await _userManager.GenerateTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider);

            await _emailService.SendAsync(
                user.Email,
                "Disable two-factor authentication",
                $"""
        <h2>Disable Two-Factor Authentication</h2>
        <p>Your verification code is:</p>
        <h1>{code}</h1>
        <p>Enter this code to disable two-factor authentication on your account.</p>
        """);
        }

        public async Task ConfirmDisableTwoFactorAsync(string userId, TwoFactorCodeRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            if (!user.TwoFactorEnabled)
                return;

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider,
                request.Code.Trim());

            if (!isValid)
                throw new InvalidTwoFactorCodeException();

            var result = await _userManager.SetTwoFactorEnabledAsync(
                user,
                false);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }
        }


        //private static string GenerateTemporaryPassword()
        //{
        //    return $"Ts!{Guid.NewGuid():N}aA1";
        //}
    }
}

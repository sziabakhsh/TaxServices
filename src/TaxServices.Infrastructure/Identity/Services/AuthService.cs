using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Clients;

namespace TaxServices.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IOptions<JwtOptions> _jwtOptions;
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        // We are using Guid.Empty as the Default Tenant.
        // In the future, when we have a real Tenant, we will use the actual TenantId.
        // private static readonly Guid DefaultTenantId = Guid.Empty;

        public AuthService(
            UserManager<AppUser> userManager,
            IJwtTokenService jwtTokenService,
            IOptions<JwtOptions> jwtOptions,
            ITaxServicesDbContext context,
            ITenantContext tenantContext)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _jwtOptions = jwtOptions;
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);

            if (existingUser is not null)
                throw new DuplicateUserException(
                    "User already exists.");

            var user = new AppUser
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                TenantId = _tenantContext.TenantId
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));

                throw new ValidationException(errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "Client");

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }

            var client = new Client
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantContext.TenantId,
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = string.Empty,
                IsActive = true
            };

            await _context.Clients.AddAsync(client);

            await _context.SaveChangesAsync();

            var token = await _jwtTokenService.GenerateTokenAsync(user.Id);

            return new AuthResponse
            {
                AccessToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(
                    _jwtOptions.Value.ExpirationInMinutes)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user is null)
                throw new InvalidOperationException("Invalid email or password.");

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);

            if (!passwordValid)
                throw new InvalidOperationException("Invalid email or password.");

            var token = await _jwtTokenService.GenerateTokenAsync(user.Id);

            return new AuthResponse
            {
                AccessToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.Value.ExpirationInMinutes)
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

            var temporaryPassword = GenerateTemporaryPassword();

            var result = await _userManager.CreateAsync(
                user,
                temporaryPassword);

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

            var token = await _jwtTokenService.GenerateTokenAsync(user.Id);

            return new UserCreatedResponse
            {
                UserId = user.Id,
                TemporaryPassword = temporaryPassword
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

        private static string GenerateTemporaryPassword()
        {
            return $"Ts!{Guid.NewGuid():N}aA1";
        }
    }
}

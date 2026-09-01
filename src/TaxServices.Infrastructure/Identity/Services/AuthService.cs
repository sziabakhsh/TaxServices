using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;

namespace TaxServices.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IOptions<JwtOptions> _jwtOptions;

        public AuthService(
            UserManager<AppUser> userManager,
            IJwtTokenService jwtTokenService,
            IOptions<JwtOptions> jwtOptions)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _jwtOptions = jwtOptions;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);

            if (existingUser is not null)
                throw new DuplicateUserException("User already exists.");

            var user = new AppUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await _userManager.CreateAsync(
                user,
                request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "Client");

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    roleResult.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }

            var token = await _jwtTokenService.GenerateTokenAsync(user.Id);

            return new AuthResponse
            {
                AccessToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.Value.ExpirationInMinutes)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user is null)
                throw new InvalidOperationException("Invalid email or password.");

            var passwordValid = await _userManager.CheckPasswordAsync(
                user,
                request.Password);

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
                throw new InvalidOperationException("User not found.");

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

        public async Task ChangePasswordAsync(
    string userId,
    ChangePasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
                throw new InvalidOperationException("User not found.");

            var result = await _userManager.ChangePasswordAsync(
                user,
                request.CurrentPassword,
                request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }
        }
    }
}

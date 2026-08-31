using Microsoft.AspNetCore.Identity;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;

namespace TaxServices.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(
            UserManager<AppUser> userManager,
            IJwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
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

            var token = await _jwtTokenService.GenerateTokenAsync(user.Id);

            return new AuthResponse
            {
                AccessToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60)
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
                ExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }
    }
}

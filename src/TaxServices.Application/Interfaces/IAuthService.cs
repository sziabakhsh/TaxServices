
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.DTOs.Employees;

namespace TaxServices.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<CurrentUserResponse> GetCurrentUserAsync(string userId);
        Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
        Task<UserCreatedResponse> CreateUserAsync(NewUserRequestInApp request, CancellationToken cancellationToken = default);
        Task UpdateUserAsync(UpdatedUserRequestInApp request, CancellationToken cancellationToken = default);
        Task<string> GeneratePasswordSetupTokenAsync(string userId, CancellationToken cancellationToken = default);
        Task SetPasswordAsync(SetPasswordRequest request, CancellationToken cancellationToken = default);
        Task<bool> HasPasswordAsync(string userId, CancellationToken cancellationToken = default);
    }
}

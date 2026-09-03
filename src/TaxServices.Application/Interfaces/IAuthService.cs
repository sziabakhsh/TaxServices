
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
    }
}

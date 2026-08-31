
namespace TaxServices.Application.DTOs.Authentication
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}

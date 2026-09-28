namespace TaxServices.Application.DTOs.Authentication
{
    public class AuthResponse
    {
        public string? AccessToken { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool RequiresTwoFactor { get; set; }
    }
}
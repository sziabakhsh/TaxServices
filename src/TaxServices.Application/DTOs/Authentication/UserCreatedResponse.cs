namespace TaxServices.Application.DTOs.Authentication
{
    public class UserCreatedResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string TemporaryPassword { get; set; } = string.Empty;
    }
}

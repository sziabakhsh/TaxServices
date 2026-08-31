namespace TaxServices.Application.Interfaces
{
    public interface IJwtTokenService
    {
        Task<string> GenerateTokenAsync(string userId);
    }
}

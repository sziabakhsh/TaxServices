
namespace TaxServices.Application.DTOs.Clients
{
    public class ClientCreatedResponse
    {
        public ClientDto Client { get; set; } = null!;
        public string TemporaryPassword { get; set; } = string.Empty;
    }
}

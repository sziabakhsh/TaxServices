
namespace TaxServices.Application.DTOs.Services
{
    public class ServiceResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public bool IsActive { get; set; }
    }
}


using TaxServices.Application.DTOs.Services;

namespace TaxServices.Application.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceResponse>> GetAllAsync();
        Task<ServiceResponse?> GetByIdAsync(Guid id);
        Task<ServiceResponse> CreateAsync(CreateServiceRequest request);
        Task<ServiceResponse> UpdateAsync(Guid id, UpdateServiceRequest request);
        Task DeactivateAsync(Guid id);
        Task ActivateAsync(Guid id);
    }
}

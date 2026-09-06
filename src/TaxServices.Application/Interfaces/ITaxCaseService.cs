using TaxServices.Application.DTOs.Cases;

namespace TaxServices.Application.Interfaces
{
    public interface ITaxCaseService
    {
        Task<IEnumerable<TaxCaseResponse>> GetAllAsync();
        Task<TaxCaseResponse?> GetByIdAsync(Guid id);
        Task<TaxCaseResponse> CreateAsync(CreateTaxCaseRequest request);
        Task<TaxCaseResponse> UpdateAsync(Guid id, UpdateTaxCaseRequest request);
    }
}
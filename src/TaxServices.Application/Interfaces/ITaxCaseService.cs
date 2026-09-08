using TaxServices.Application.DTOs.Cases;

namespace TaxServices.Application.Interfaces
{
    public interface ITaxCaseService
    {
        Task<IEnumerable<TaxCaseResponse>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<TaxCaseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<TaxCaseResponse> CreateAsync(CreateTaxCaseRequest request, CancellationToken cancellationToken = default);

        Task<TaxCaseResponse> UpdateAsync(Guid id, UpdateTaxCaseRequest request, CancellationToken cancellationToken = default);

        Task<IEnumerable<TaxCaseResponse>> GetMineAsync(string userId, CancellationToken cancellationToken = default);
    }
}
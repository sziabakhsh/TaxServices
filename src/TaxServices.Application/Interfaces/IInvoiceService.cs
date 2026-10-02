
using TaxServices.Application.DTOs.Invoices;

namespace TaxServices.Application.Interfaces
{
    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceResponse>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<InvoiceResponse?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<InvoiceResponse>> GetByClientIdAsync(
            Guid clientId,
            CancellationToken cancellationToken = default);

        Task<InvoiceResponse> CreateAsync(
            CreateInvoiceRequest request,
            CancellationToken cancellationToken = default);

        Task<InvoiceResponse> UpdateAsync(
            Guid id,
            UpdateInvoiceRequest request,
            CancellationToken cancellationToken = default);

        Task<InvoiceResponse> IssueAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<InvoiceResponse> CancelAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<InvoiceResponse>> GetMineAsync(
            string userId,
            CancellationToken cancellationToken = default);

        Task<InvoiceResponse?> GetMineByIdAsync(
            string userId,
            Guid id,
            CancellationToken cancellationToken = default);
    }
}

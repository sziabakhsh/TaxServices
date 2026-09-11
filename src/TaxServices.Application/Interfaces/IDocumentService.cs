using TaxServices.Application.DTOs.Documents;

namespace TaxServices.Application.Interfaces
{
    public interface IDocumentService
    {
        Task<DocumentResponse> UploadAsync(UploadDocumentRequest request, CancellationToken cancellationToken = default);

        Task<IEnumerable<DocumentResponse>> GetByClientAsync(Guid clientId, CancellationToken cancellationToken = default);

        Task<DocumentResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<Stream?> DownloadAsync(Guid id, CancellationToken cancellationToken = default);

        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
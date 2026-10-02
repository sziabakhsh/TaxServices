using System.Text;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Documents;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Tests.Infrastructure;

/// <summary>
/// A test implementation of the IDocumentService interface for integration tests.
/// </summary>
public class TestDocumentService : IDocumentService
{
    private static readonly byte[] DocumentContent =
        Encoding.UTF8.GetBytes(
            "TaxServices digital signature integration test document.");

    public Task<DocumentResponse> UploadAsync(
        UploadDocumentRequest request,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<DocumentResponse>> GetByClientAsync(
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<DocumentResponse>> GetByTaxCaseAsync(
        Guid taxCaseId,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task<DocumentResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task<Stream?> DownloadAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        Stream stream = new MemoryStream(
            DocumentContent,
            writable: false);

        return Task.FromResult<Stream?>(stream);
    }

    public Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task<IEnumerable<DocumentResponse>> GetByClientIdAsync(
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task<PagedResult<DocumentResponse>> GetAllAsync(
        DocumentQueryParameters parameters,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }

    public Task AssignToCaseAsync(
        Guid documentId,
        Guid? taxCaseId,
        CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException();
    }
}
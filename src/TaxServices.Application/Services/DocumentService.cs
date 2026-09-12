using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Documents;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Documents;

namespace TaxServices.Application.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly IFileStorageService _fileStorageService;
        private readonly ITenantContext _tenantContext;

        public DocumentService(
            ITaxServicesDbContext context,
            IFileStorageService fileStorageService,
            ITenantContext tenantContext)
        {
            _context = context;
            _fileStorageService = fileStorageService;
            _tenantContext = tenantContext;
        }

        public async Task<DocumentResponse> UploadAsync(UploadDocumentRequest request, CancellationToken cancellationToken = default)
        {

            UploadFileException.CheckFileValidation(request);

            var clientExists = await _context.Clients
                .AsNoTracking()
                .AnyAsync(
                    c => c.Id == request.ClientId &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (!clientExists)
                throw new ArgumentException("Client does not exist.");

            if (request.TaxCaseId.HasValue)
            {
                var taxCaseExists = await _context.TaxCases
                    .AsNoTracking()
                    .AnyAsync(
                        tc => tc.Id == request.TaxCaseId.Value &&
                              tc.ClientId == request.ClientId &&
                              tc.TenantId == _tenantContext.TenantId,
                        cancellationToken);

                if (!taxCaseExists)
                    throw new ArgumentException(
                        "Tax case does not exist or does not belong to this client.");
            }

            var extension = Path.GetExtension(request.FileName);

            var storedFileName = $"{Guid.NewGuid()}{extension}";

            var storagePath = $"{_tenantContext.TenantId}/{request.ClientId}/{storedFileName}";

            await _fileStorageService.UploadAsync(
                request.Content,
                storagePath,
                request.ContentType,
                cancellationToken);

            var document = new Document
            {
                TenantId = _tenantContext.TenantId,
                ClientId = request.ClientId,
                TaxCaseId = request.TaxCaseId,
                OriginalFileName = request.FileName,
                StoredFileName = storedFileName,
                StoragePath = storagePath,
                ContentType = request.ContentType,
                FileSize = request.FileSize,
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);

            await _context.SaveChangesAsync(cancellationToken);

            return MapToResponse(document);
        }

        public async Task<IEnumerable<DocumentResponse>> GetByClientAsync(Guid clientId, CancellationToken cancellationToken = default)
        {
            return await _context.Documents
                .AsNoTracking()
                .Where(d =>
                    d.ClientId == clientId &&
                    d.TenantId == _tenantContext.TenantId)
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new DocumentResponse
                {
                    Id = d.Id,
                    ClientId = d.ClientId,
                    TaxCaseId = d.TaxCaseId,
                    FileName = d.OriginalFileName,
                    ContentType = d.ContentType,
                    FileSize = d.FileSize,
                    UploadedAt = d.UploadedAt
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<DocumentResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var document = await _context.Documents
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    d => d.Id == id &&
                         d.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            return document == null ? null : MapToResponse(document);
        }

        public async Task<Stream?> DownloadAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var document = await _context.Documents
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    d => d.Id == id &&
                         d.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (document == null)
                return null;

            return await _fileStorageService.DownloadAsync(document.StoragePath, cancellationToken);
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(
                    d => d.Id == id &&
                         d.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (document == null)
                return;

            await _fileStorageService.DeleteAsync(
                document.StoragePath,
                cancellationToken);

            _context.Documents.Remove(document);

            await _context.SaveChangesAsync(cancellationToken);
        }

        private static DocumentResponse MapToResponse(Document document)
        {
            return new DocumentResponse
            {
                Id = document.Id,
                ClientId = document.ClientId,
                TaxCaseId = document.TaxCaseId,
                FileName = document.OriginalFileName,
                ContentType = document.ContentType,
                FileSize = document.FileSize,
                UploadedAt = document.UploadedAt
            };
        }

        public async Task<IEnumerable<DocumentResponse>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
        {
            var clientExists = await _context.Clients
                .AsNoTracking()
                .AnyAsync(
                    c => c.Id == clientId && c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (!clientExists)
                throw new ArgumentException("Client does not exist.");

            return await _context.Documents
                .AsNoTracking()
                .Where(d =>
                    d.ClientId == clientId &&
                    d.TenantId == _tenantContext.TenantId)
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new DocumentResponse
                {
                    Id = d.Id,
                    ClientId = d.ClientId,
                    TaxCaseId = d.TaxCaseId,
                    FileName = d.OriginalFileName,
                    ContentType = d.ContentType,
                    FileSize = d.FileSize,
                    UploadedAt = d.UploadedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}
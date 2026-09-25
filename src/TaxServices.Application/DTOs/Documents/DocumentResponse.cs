using TaxServices.Domain.Cases;

namespace TaxServices.Application.DTOs.Documents
{
    public class DocumentResponse
    {
        public Guid Id { get; set; }

        public Guid ClientId { get; set; }

        public string ClientName { get; set; } = string.Empty;

        public string? ServiceName { get; set; }

        public Guid? TaxCaseId { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; }

        public int? TaxYear { get; set; }

        public CaseStatus? CaseStatus { get; set; }
    }
}
namespace TaxServices.Application.DTOs.Documents
{
    public class UploadDocumentRequest
    {
        public Guid ClientId { get; set; }

        public Guid? TaxCaseId { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public Stream Content { get; set; } = Stream.Null;
    }
}
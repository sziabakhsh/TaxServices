using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Documents
{
    public class Document : Entity
    {
        public Guid ClientId { get; set; }

        public Guid? TaxCaseId { get; set; }

        [Required]
        [MaxLength(255)]
        public string OriginalFileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string StoredFileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        [Required]
        [MaxLength(500)]
        public string StoragePath { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }

        public Client Client { get; set; } = null!;
    }
}
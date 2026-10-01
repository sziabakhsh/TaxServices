using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Documents
{
    public class DocumentSignature : Entity
    {
        public Guid DocumentId { get; set; }

        public Guid ClientId { get; set; }

        public SignatureStatus Status { get; set; }
            = SignatureStatus.Pending;

        public DateTime RequestedAt { get; set; }

        public DateTime? SignedAt { get; set; }

        public DateTime? DeclinedAt { get; set; }

        public DateTime? CancelledAt { get; set; }

        [MaxLength(500)]
        public string? DeclineReason { get; set; }

        [ForeignKey(nameof(DocumentId))]
        public Document Document { get; set; } = null!;

        [ForeignKey(nameof(ClientId))]
        public Client Client { get; set; } = null!;
    }
}
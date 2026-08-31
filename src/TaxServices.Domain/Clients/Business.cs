using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class Business : Entity
    {
        [Required]
        [MaxLength(200)]
        public string LegalName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string BusinessNumber { get; set; } = string.Empty;

        [MaxLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        public ICollection<ClientBusinessRelationship> ClientRelationships { get; set; }
            = new List<ClientBusinessRelationship>();
    }
}
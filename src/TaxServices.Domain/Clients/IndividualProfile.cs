using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class IndividualProfile : Entity
    {
        public Guid ClientId { get; set; }

        [Required]
        [MaxLength(9)]
        public string SIN { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        public Client Client { get; set; } = null!;
    }
}

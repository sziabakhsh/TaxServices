using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class Client : Entity
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MaxLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; }
        public string? UserId { get; set; }
        public IndividualProfile? IndividualProfile { get; set; } 

        public ICollection<ClientBusinessRelationship> BusinessRelationships { get; set; }
            = new List<ClientBusinessRelationship>();

        public ICollection<TaxCase> TaxCases { get; set; }
            = new List<TaxCase>();
    }
}
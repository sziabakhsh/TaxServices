using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Employees
{
    public class Employee : Entity
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

        [MaxLength(100)]
        public string JobTitle { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public ICollection<TaxCase> TaxCases { get; set; }
            = new List<TaxCase>();
    }
}
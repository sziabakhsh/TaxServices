using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Cases
{
    public class CreateTaxCaseRequest
    {
        public Guid ClientId { get; set; }

        public Guid ServiceId { get; set; }

        public Guid? EmployeeId { get; set; }

        [Range(2000, 2100)]
        public int TaxYear { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
    }
}
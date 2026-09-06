using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Cases
{
    public class UpdateTaxCaseRequest
    {
        public Guid? EmployeeId { get; set; }

        [Range(2000, 2100)]
        public int TaxYear { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
    }
}
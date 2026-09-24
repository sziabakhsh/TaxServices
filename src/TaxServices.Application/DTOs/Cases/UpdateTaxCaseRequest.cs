using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Cases;

namespace TaxServices.Application.DTOs.Cases
{
    public class UpdateTaxCaseRequest
    {
        public Guid ServiceId { get; set; }

        public Guid? EmployeeId { get; set; }

        [Range(2000, 2100)]
        public int TaxYear { get; set; }

        public CaseStatus Status { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
    }
}
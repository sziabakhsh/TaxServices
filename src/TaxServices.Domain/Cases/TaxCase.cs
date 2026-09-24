using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Common;
using TaxServices.Domain.Employees;
using TaxServices.Domain.Services;

namespace TaxServices.Domain.Cases
{
    public class TaxCase : Entity
    {
        public Guid ClientId { get; set; }

        public Guid ServiceId { get; set; }

        public Guid? EmployeeId { get; set; }

        [Range(1900, 2100)]
        public int TaxYear { get; set; }

        public CaseStatus Status { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public DateTime OpenedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        public Client Client { get; set; } = null!;

        public Service Service { get; set; } = null!;

        public Employee? Employee { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Common;
using TaxServices.Domain.Employees;

namespace TaxServices.Domain.Cases
{
    public class TaxCase : Entity
    {
        public Guid ClientId { get; set; }

        public Guid? EmployeeId { get; set; }

        public int TaxYear { get; set; }

        public CaseStatus Status { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        public DateTime OpenedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        public Client Client { get; set; } = null!;
        public Employee? Employee { get; set; }
    }
}
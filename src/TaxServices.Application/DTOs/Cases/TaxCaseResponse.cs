using TaxServices.Domain.Cases;

namespace TaxServices.Application.DTOs.Cases
{
    public class TaxCaseResponse
    {
        public Guid Id { get; set; }

        public Guid ClientId { get; set; }

        public string ClientName { get; set; } = string.Empty;

        public Guid ServiceId { get; set; }

        public string ServiceName { get; set; } = string.Empty;

        public Guid? EmployeeId { get; set; }

        public int TaxYear { get; set; }

        public CaseStatus Status { get; set; }

        public string Description { get; set; } = string.Empty;

        public DateTime OpenedAt { get; set; }

        public DateTime? ClosedAt { get; set; }
    }
}
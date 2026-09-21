using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Documents
{
    public class DocumentQueryParameters
    {
        [Range(1, int.MaxValue)]
        public int PageNumber { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;

        public string? Search { get; set; }

        public Guid? ClientId { get; set; }

        public Guid? TaxCaseId { get; set; }

        public int? TaxYear { get; set; }
    }
}
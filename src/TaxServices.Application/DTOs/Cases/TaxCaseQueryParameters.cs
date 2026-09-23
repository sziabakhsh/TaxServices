
using TaxServices.Application.Common.Pagination;

namespace TaxServices.Application.DTOs.Cases
{
    public class TaxCaseQueryParameters: PaginationQueryParameters
    {
        public string? Status { get; set; }
    }
}

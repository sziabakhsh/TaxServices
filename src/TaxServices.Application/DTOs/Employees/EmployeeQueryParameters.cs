using TaxServices.Application.Common.Pagination;

namespace TaxServices.Application.DTOs.Employees
{
    public class EmployeeQueryParameters : PaginationQueryParameters
    {
        public bool? IsActive { get; set; }
    }
}

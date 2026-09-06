
namespace TaxServices.Application.DTOs.Employees
{
    public class EmployeeCreatedResponse
    {
        public EmployeeDto Employee { get; set; } = null!;
        public string TemporaryPassword { get; set; } = string.Empty;
    }
}

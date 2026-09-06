using TaxServices.Application.DTOs.Employees;

namespace TaxServices.Application.Interfaces
{
    public interface IEmployeeService
    {
        Task<EmployeeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<EmployeeDto>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<EmployeeCreatedResponse> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken = default);

        Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeRequest request, CancellationToken cancellationToken = default);

        Task<bool> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    }
}
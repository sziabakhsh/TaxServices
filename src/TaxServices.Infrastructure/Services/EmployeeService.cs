using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.DTOs.Employees;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Employees;

namespace TaxServices.Infrastructure.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly IAuthService _authService;
        private readonly IEmployeeInvitationService _employeeInvitationService;

        public EmployeeService(
            ITaxServicesDbContext context,
            ITenantContext tenantContext,
            IAuthService authService,
            IEmployeeInvitationService employeeInvitationService)
        {
            _context = context;
            _tenantContext = tenantContext;
            _authService = authService;
            _employeeInvitationService = employeeInvitationService;

        }

        public async Task<PagedResult<EmployeeDto>> GetAllAsync(EmployeeQueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var query = _context.Employees
                .AsNoTracking()
                .Where(e => e.TenantId == _tenantContext.TenantId);

            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var search = parameters.Search.Trim();

                query = query.Where(e =>
                    e.FirstName.Contains(search) ||
                    e.LastName.Contains(search) ||
                    e.Email.Contains(search) ||
                    e.JobTitle.Contains(search));
            }

            if (parameters.IsActive.HasValue)
            {
                query = query.Where(
                    e => e.IsActive == parameters.IsActive.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var employees = await query
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync(cancellationToken);

            var items = employees
                .Select(MapToDto)
                .ToList();

            return new PagedResult<EmployeeDto>
            {
                Items = items,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<IReadOnlyList<EmployeeDto>> GetOptionsAsync(CancellationToken cancellationToken = default)
        {
            var employees = await _context.Employees
                .AsNoTracking()
                .Where(e =>
                    e.TenantId == _tenantContext.TenantId &&
                    e.IsActive)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync(cancellationToken);

            return employees
                .Select(MapToDto)
                .ToList();
        }

        public async Task<EmployeeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var employee = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    e => e.Id == id &&
                         e.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            return employee is null
                ? null
                : MapToDto(employee);
        }

        public async Task<EmployeeCreatedResponse> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken = default)
        {
            var email = request.Email.Trim();

            var emailExists = await _context.Employees
                .AnyAsync(
                    e => e.TenantId == _tenantContext.TenantId &&
                         e.Email == email,
                    cancellationToken);

            if (emailExists)
                throw new InvalidOperationException(
                    "An employee with this email already exists.");

            var newUser = new NewUserRequestInApp
            {
                Email = email,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Role = "Employee"
            };

            UserCreatedResponse userCreatedResponse;
            Employee employee;

            await using var transaction =
                await _context.BeginTransactionAsync(cancellationToken);

            try
            {
                userCreatedResponse =
                    await _authService.CreateUserAsync(
                        newUser,
                        cancellationToken);

                employee = new Employee
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantContext.TenantId,
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Email = email,
                    PhoneNumber = request.PhoneNumber.Trim(),
                    JobTitle = request.JobTitle.Trim(),
                    IsActive = true,
                    UserId = userCreatedResponse.UserId
                };

                await _context.Employees.AddAsync(
                    employee,
                    cancellationToken);

                await _context.SaveChangesAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }

            await _employeeInvitationService.SendInvitationAsync(
                userCreatedResponse.UserId,
                employee.FirstName,
                employee.Email,
                cancellationToken);

            return new EmployeeCreatedResponse
            {
                Employee = MapToDto(employee)
            };
        }

        public async Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeRequest request, CancellationToken cancellationToken = default)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == _tenantContext.TenantId, cancellationToken);

            if (employee is null)
                return null;

            var email = request.Email.Trim();

            var emailExists = await _context.Employees
                .AnyAsync(e => e.TenantId == _tenantContext.TenantId && e.Email == email && e.Id != id,
                    cancellationToken);

            if (emailExists)
                throw new InvalidOperationException(
                    "An employee with this email already exists.");

            await using var transaction =
                await _context.BeginTransactionAsync(cancellationToken);

            try
            {
                if (!string.IsNullOrWhiteSpace(employee.UserId))
                {
                    var updatedUser = new UpdatedUserRequestInApp
                    {
                        UserId = employee.UserId,
                        Email = email,
                        FirstName = request.FirstName,
                        LastName = request.LastName
                    };

                    await _authService.UpdateUserAsync(updatedUser, cancellationToken);
                }

                employee.FirstName = request.FirstName.Trim();
                employee.LastName = request.LastName.Trim();
                employee.Email = email;
                employee.PhoneNumber = request.PhoneNumber.Trim();
                employee.JobTitle = request.JobTitle.Trim();

                await _context.SaveChangesAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);

                return MapToDto(employee);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        public async Task<bool> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(
                    e => e.Id == id &&
                         e.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (employee is null)
                return false;

            employee.IsActive = false;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(
                    e => e.Id == id &&
                         e.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (employee is null)
                return false;

            employee.IsActive = true;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> ResendInvitationAsync(Guid employeeId, CancellationToken cancellationToken = default)
        {
            var employee = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    e => e.Id == employeeId &&
                         e.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (employee is null)
                return false;

            if (string.IsNullOrWhiteSpace(employee.UserId))
                throw new InvalidOperationException("This employee does not have a user account.");

            var hasPassword = await _authService.HasPasswordAsync(employee.UserId, cancellationToken);

            if (hasPassword)
                throw new InvitationNotAllowedException("This employee has already set a password.");

            await _employeeInvitationService.SendInvitationAsync(
                employee.UserId,
                employee.FirstName,
                employee.Email,
                cancellationToken);

            return true;
        }

        private static EmployeeDto MapToDto(Employee employee)
        {
            return new EmployeeDto
            {
                Id = employee.Id,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                PhoneNumber = employee.PhoneNumber,
                JobTitle = employee.JobTitle,
                IsActive = employee.IsActive
            };
        }
    }
}
using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Cases;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Cases;

namespace TaxServices.Application.Services
{
    public class TaxCaseService : ITaxCaseService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        public TaxCaseService(
            ITaxServicesDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<IEnumerable<TaxCaseResponse>> GetAllAsync()
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.TaxCases
                .AsNoTracking()
                .Where(x => x.TenantId == tenantId)
                .Select(x => new TaxCaseResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    EmployeeId = x.EmployeeId,
                    TaxYear = x.TaxYear,
                    Status = x.Status,
                    Description = x.Description,
                    OpenedAt = x.OpenedAt,
                    ClosedAt = x.ClosedAt
                })
                .ToListAsync();
        }

        public async Task<TaxCaseResponse?> GetByIdAsync(Guid id)
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.TaxCases
                .AsNoTracking()
                .Where(x =>
                    x.Id == id &&
                    x.TenantId == tenantId)
                .Select(x => new TaxCaseResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    EmployeeId = x.EmployeeId,
                    TaxYear = x.TaxYear,
                    Status = x.Status,
                    Description = x.Description,
                    OpenedAt = x.OpenedAt,
                    ClosedAt = x.ClosedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TaxCaseResponse> CreateAsync(CreateTaxCaseRequest request)
        {
            var tenantId = _tenantContext.TenantId;

            var clientExists = await _context.Clients
                .AnyAsync(x =>
                    x.Id == request.ClientId &&
                    x.TenantId == tenantId);

            if (!clientExists)
                throw new KeyNotFoundException("Client not found.");

            if (request.EmployeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(x =>
                        x.Id == request.EmployeeId.Value &&
                        x.TenantId == tenantId);

                if (!employeeExists)
                    throw new KeyNotFoundException("Employee not found.");
            }

            var taxCase = new TaxCase
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ClientId = request.ClientId,
                EmployeeId = request.EmployeeId,
                TaxYear = request.TaxYear,
                Status = CaseStatus.Draft,
                Description = request.Description,
                OpenedAt = DateTime.UtcNow
            };

            _context.TaxCases.Add(taxCase);

            await _context.SaveChangesAsync();

            return new TaxCaseResponse
            {
                Id = taxCase.Id,
                ClientId = taxCase.ClientId,
                EmployeeId = taxCase.EmployeeId,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                Description = taxCase.Description,
                OpenedAt = taxCase.OpenedAt,
                ClosedAt = taxCase.ClosedAt
            };
        }

        public async Task<TaxCaseResponse> UpdateAsync(Guid id, UpdateTaxCaseRequest request)
        {
            var tenantId = _tenantContext.TenantId;

            var taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.TenantId == tenantId);

            if (taxCase == null)
                throw new KeyNotFoundException("Tax case not found.");

            if (request.EmployeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(x =>
                        x.Id == request.EmployeeId.Value &&
                        x.TenantId == tenantId);

                if (!employeeExists)
                    throw new KeyNotFoundException("Employee not found.");
            }

            taxCase.EmployeeId = request.EmployeeId;
            taxCase.TaxYear = request.TaxYear;
            taxCase.Description = request.Description;

            await _context.SaveChangesAsync();

            return new TaxCaseResponse
            {
                Id = taxCase.Id,
                ClientId = taxCase.ClientId,
                EmployeeId = taxCase.EmployeeId,
                TaxYear = taxCase.TaxYear,
                Status = taxCase.Status,
                Description = taxCase.Description,
                OpenedAt = taxCase.OpenedAt,
                ClosedAt = taxCase.ClosedAt
            };
        }
    }
}
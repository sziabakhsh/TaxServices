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

        public async Task<IEnumerable<TaxCaseResponse>> GetAllAsync(CancellationToken cancellationToken = default)
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
                .ToListAsync(cancellationToken);
        }

        public async Task<TaxCaseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
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
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<TaxCaseResponse> CreateAsync(CreateTaxCaseRequest request, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var clientExists = await _context.Clients
                .AnyAsync(
                    x => x.Id == request.ClientId &&
                         x.TenantId == tenantId,
                    cancellationToken);

            if (!clientExists)
                throw new KeyNotFoundException("Client not found.");

            if (request.EmployeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(
                        x => x.Id == request.EmployeeId.Value &&
                             x.TenantId == tenantId,
                        cancellationToken);

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

            await _context.SaveChangesAsync(cancellationToken);

            return MapToResponse(taxCase);
        }

        public async Task<TaxCaseResponse> UpdateAsync(Guid id, UpdateTaxCaseRequest request, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(
                    x => x.Id == id &&
                         x.TenantId == tenantId,
                    cancellationToken);

            if (taxCase == null)
                throw new KeyNotFoundException("Tax case not found.");

            if (request.EmployeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(
                        x => x.Id == request.EmployeeId.Value &&
                             x.TenantId == tenantId,
                        cancellationToken);

                if (!employeeExists)
                    throw new KeyNotFoundException("Employee not found.");
            }

            taxCase.EmployeeId = request.EmployeeId;
            taxCase.TaxYear = request.TaxYear;
            taxCase.Description = request.Description;

            await _context.SaveChangesAsync(cancellationToken);

            return MapToResponse(taxCase);
        }

        public async Task<IEnumerable<TaxCaseResponse>> GetMineAsync(string userId, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var clientId = await _context.Clients
                .AsNoTracking()
                .Where(c =>
                    c.UserId == userId &&
                    c.TenantId == tenantId)
                .Select(c => (Guid?)c.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (clientId == null)
                return Enumerable.Empty<TaxCaseResponse>();

            return await _context.TaxCases
                .AsNoTracking()
                .Where(tc =>
                    tc.TenantId == tenantId &&
                    tc.ClientId == clientId.Value)
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
                .ToListAsync(cancellationToken);
        }

        public async Task<TaxCaseResponse?> GetMineByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
        {
            var taxCase = await _context.TaxCases
                .Include(tc => tc.Client)
                .FirstOrDefaultAsync(
                    tc =>
                        tc.Id == id &&
                        tc.TenantId == _tenantContext.TenantId &&
                        tc.Client.UserId == userId,
                    cancellationToken);

            if (taxCase is null)
                return null;

            return MapToResponse(taxCase);
        }

        private static TaxCaseResponse MapToResponse(TaxCase taxCase)
        {
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
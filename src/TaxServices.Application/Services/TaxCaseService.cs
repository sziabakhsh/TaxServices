using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Cases;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Cases;

namespace TaxServices.Application.Services
{
    public class TaxCaseService : ITaxCaseService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        public TaxCaseService(ITaxServicesDbContext context, ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<PagedResult<TaxCaseResponse>> GetAllAsync(TaxCaseQueryParameters parameters, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var query = _context.TaxCases
                .AsNoTracking()
                .Where(x => x.TenantId == tenantId);

            if (!string.IsNullOrWhiteSpace(parameters.Status))
            {
                query = parameters.Status switch
                {
                    "open" => query.Where(x =>
                        x.Status == CaseStatus.Open ||
                        x.Status == CaseStatus.InProgress),

                    "waitingForClient" => query.Where(x =>
                        x.Status == CaseStatus.WaitingForClient),

                    _ => query
                };
            }

            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var search = parameters.Search.Trim();

                var isTaxYear =
                    int.TryParse(search, out var taxYear);

                query = query.Where(x =>
                    x.Client.FirstName.Contains(search) ||
                    x.Client.LastName.Contains(search) ||
                    (x.Client.FirstName + " " + x.Client.LastName)
                        .Contains(search) ||
                    x.Service.Name.Contains(search) ||
                    x.Description.Contains(search) ||
                    (isTaxYear && x.TaxYear == taxYear));
            }

            var totalCount =
                await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.OpenedAt)
                .Skip(
                    (parameters.PageNumber - 1) *
                    parameters.PageSize)
                .Take(parameters.PageSize)
                .Select(x => new TaxCaseResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName =
                        x.Client.FirstName + " " +
                        x.Client.LastName,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service.Name,
                    EmployeeId = x.EmployeeId,
                    TaxYear = x.TaxYear,
                    Status = x.Status,
                    Description = x.Description,
                    OpenedAt = x.OpenedAt,
                    ClosedAt = x.ClosedAt
                })
                .ToListAsync(cancellationToken);

            return new PagedResult<TaxCaseResponse>
            {
                Items = items,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount
            };
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
                    ClientName =
                        x.Client.FirstName + " " +
                        x.Client.LastName,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service.Name,
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
                    x =>
                        x.Id == request.ClientId &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (!clientExists)
                throw new KeyNotFoundException(
                    "Client not found.");

            var serviceExists = await _context.Services
                .AnyAsync(
                    x =>
                        x.Id == request.ServiceId &&
                        x.TenantId == tenantId &&
                        x.IsActive,
                    cancellationToken);

            if (!serviceExists)
            {
                throw new KeyNotFoundException(
                    "Active service not found.");
            }

            if (request.EmployeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(
                        x =>
                            x.Id == request.EmployeeId.Value &&
                            x.TenantId == tenantId &&
                            x.IsActive,
                        cancellationToken);

                if (!employeeExists)
                {
                    throw new KeyNotFoundException(
                        "Active employee not found.");
                }
            }

            var taxCase = new TaxCase
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ClientId = request.ClientId,
                ServiceId = request.ServiceId,
                EmployeeId = request.EmployeeId,
                TaxYear = request.TaxYear,
                Status = CaseStatus.Draft,
                Description = request.Description,
                OpenedAt = DateTime.UtcNow
            };

            _context.TaxCases.Add(taxCase);

            await _context.SaveChangesAsync(
                cancellationToken);

            return await GetByIdAsync(
                       taxCase.Id,
                       cancellationToken)
                   ?? throw new InvalidOperationException(
                       "Unable to load the created tax case.");
        }

        public async Task<TaxCaseResponse> UpdateAsync(Guid id, UpdateTaxCaseRequest request, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var taxCase = await _context.TaxCases
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (taxCase == null)
                throw new KeyNotFoundException(
                    "Tax case not found.");

            /*
             * An existing case may continue using an inactive
             * service. We only require that the service exists
             * in the current tenant.
             */
            var serviceExists = await _context.Services
                .AnyAsync(
                    x =>
                        x.Id == request.ServiceId &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (!serviceExists)
            {
                throw new KeyNotFoundException(
                    "Service not found.");
            }

            if (request.EmployeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(
                        x =>
                            x.Id == request.EmployeeId.Value &&
                            x.TenantId == tenantId &&
                            x.IsActive,
                        cancellationToken);

                if (!employeeExists)
                {
                    throw new KeyNotFoundException(
                        "Active employee not found.");
                }
            }

            taxCase.ServiceId = request.ServiceId;
            taxCase.EmployeeId = request.EmployeeId;
            taxCase.TaxYear = request.TaxYear;
            taxCase.Status = request.Status;
            taxCase.Description = request.Description;

            if (request.Status == CaseStatus.Completed ||
                request.Status == CaseStatus.Cancelled)
            {
                taxCase.ClosedAt ??= DateTime.UtcNow;
            }
            else
            {
                taxCase.ClosedAt = null;
            }

            await _context.SaveChangesAsync(
                cancellationToken);

            return await GetByIdAsync(
                       taxCase.Id,
                       cancellationToken)
                   ?? throw new InvalidOperationException(
                       "Unable to load the updated tax case.");
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
                .OrderByDescending(x => x.TaxYear)
                .ThenByDescending(x => x.OpenedAt)
                .Select(x => new TaxCaseResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName =
                        x.Client.FirstName + " " +
                        x.Client.LastName,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service.Name,
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
            var tenantId = _tenantContext.TenantId;

            return await _context.TaxCases
                .AsNoTracking()
                .Where(x =>
                    x.Id == id &&
                    x.TenantId == tenantId &&
                    x.Client.UserId == userId)
                .Select(x => new TaxCaseResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName =
                        x.Client.FirstName + " " +
                        x.Client.LastName,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service.Name,
                    EmployeeId = x.EmployeeId,
                    TaxYear = x.TaxYear,
                    Status = x.Status,
                    Description = x.Description,
                    OpenedAt = x.OpenedAt,
                    ClosedAt = x.ClosedAt
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IEnumerable<TaxCaseResponse>> GetByClientIdAsync(Guid clientId, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.TaxCases
                .AsNoTracking()
                .Where(x =>
                    x.ClientId == clientId &&
                    x.TenantId == tenantId)
                .OrderByDescending(x => x.TaxYear)
                .ThenByDescending(x => x.OpenedAt)
                .Select(x => new TaxCaseResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName =
                        x.Client.FirstName + " " +
                        x.Client.LastName,
                    ServiceId = x.ServiceId,
                    ServiceName = x.Service.Name,
                    EmployeeId = x.EmployeeId,
                    TaxYear = x.TaxYear,
                    Status = x.Status,
                    Description = x.Description,
                    OpenedAt = x.OpenedAt,
                    ClosedAt = x.ClosedAt
                })
                .ToListAsync(cancellationToken);
        }
    }
}
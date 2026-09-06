using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Services;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Services;

namespace TaxServices.Application.Services
{
    public class ServiceService : IServiceService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        public ServiceService(ITaxServicesDbContext context, ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<IEnumerable<ServiceResponse>> GetAllAsync()
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.Services
                .AsNoTracking()
                .Where(x => x.TenantId == tenantId)
                .Select(x => new ServiceResponse
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    BasePrice = x.BasePrice,
                    IsActive = x.IsActive
                })
                .ToListAsync();
        }

        public async Task<ServiceResponse?> GetByIdAsync(Guid id)
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.Services
                .AsNoTracking()
                .Where(x => x.Id == id && x.TenantId == tenantId)
                .Select(x => new ServiceResponse
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    BasePrice = x.BasePrice,
                    IsActive = x.IsActive
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ServiceResponse> CreateAsync(CreateServiceRequest request)
        {
            var tenantId = _tenantContext.TenantId;

            var exists = await _context.Services
                .AnyAsync(x =>
                    x.TenantId == tenantId &&
                    x.Name == request.Name);

            if (exists)
                throw new ArgumentException("A service with this name already exists.");

            var service = new Service
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = request.Name,
                Description = request.Description,
                BasePrice = request.BasePrice,
                IsActive = true
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return new ServiceResponse
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                BasePrice = service.BasePrice,
                IsActive = service.IsActive
            };
        }

        public async Task<ServiceResponse> UpdateAsync(
            Guid id,
            UpdateServiceRequest request)
        {
            var tenantId = _tenantContext.TenantId;

            var service = await _context.Services
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.TenantId == tenantId);

            if (service == null)
                throw new KeyNotFoundException("Service not found.");

            var exists = await _context.Services
                .AnyAsync(x =>
                    x.Id != id &&
                    x.TenantId == tenantId &&
                    x.Name == request.Name);

            if (exists)
                throw new ArgumentException("A service with this name already exists.");

            service.Name = request.Name;
            service.Description = request.Description;
            service.BasePrice = request.BasePrice;

            await _context.SaveChangesAsync();

            return new ServiceResponse
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                BasePrice = service.BasePrice,
                IsActive = service.IsActive
            };
        }

        public async Task DeactivateAsync(Guid id)
        {
            var tenantId = _tenantContext.TenantId;

            var service = await _context.Services
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.TenantId == tenantId);

            if (service == null)
                throw new KeyNotFoundException("Service not found.");

            service.IsActive = false;

            await _context.SaveChangesAsync();
        }

        public async Task ActivateAsync(Guid id)
        {
            var tenantId = _tenantContext.TenantId;

            var service = await _context.Services
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.TenantId == tenantId);

            if (service == null)
                throw new KeyNotFoundException("Service not found.");

            service.IsActive = true;

            await _context.SaveChangesAsync();
        }
    }
}

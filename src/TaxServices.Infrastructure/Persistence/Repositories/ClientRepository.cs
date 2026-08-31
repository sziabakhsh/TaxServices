using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Clients;

namespace TaxServices.Infrastructure.Persistence.Repositories
{
    public class ClientRepository : IClientRepository
    {
        private readonly TaxServicesDbContext _context;

        public ClientRepository(TaxServicesDbContext context)
        {
            _context = context;
        }

        public async Task<Client?> GetByIdAsync(
            Guid id,
            Guid tenantId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Clients
                .Include(x => x.IndividualProfile)
                .Include(x => x.BusinessRelationships)
                    .ThenInclude(x => x.Business)
                .FirstOrDefaultAsync(
                    x => x.Id == id && x.TenantId == tenantId,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Client>> GetAllAsync(
            Guid tenantId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Clients
                .AsNoTracking()
                .Include(x => x.IndividualProfile)
                .Where(x => x.TenantId == tenantId)
                .OrderBy(x => x.LastName)
                .ThenBy(x => x.FirstName)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsByEmailAsync(
            string email,
            Guid tenantId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Clients
                .AnyAsync(
                    x => x.TenantId == tenantId &&
                         x.Email == email,
                    cancellationToken);
        }

        public async Task AddAsync(
            Client client,
            CancellationToken cancellationToken = default)
        {
            await _context.Clients.AddAsync(
                client,
                cancellationToken);
        }

        public Task UpdateAsync(
            Client client,
            CancellationToken cancellationToken = default)
        {
            _context.Clients.Update(client);

            return Task.CompletedTask;
        }
    }
}

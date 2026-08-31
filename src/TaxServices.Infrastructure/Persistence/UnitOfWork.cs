
using TaxServices.Application.Interfaces;

namespace TaxServices.Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly TaxServicesDbContext _context;

        public UnitOfWork(TaxServicesDbContext context)
        {
            _context = context;
        }

        public Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}

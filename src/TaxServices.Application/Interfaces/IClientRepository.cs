
using TaxServices.Domain.Clients;

namespace TaxServices.Application.Interfaces
{
    public interface IClientRepository
    {
        Task<Client?> GetByIdAsync(
            Guid id,
            Guid tenantId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<Client>> GetAllAsync(
            Guid tenantId,
            CancellationToken cancellationToken = default);

        Task<bool> ExistsByEmailAsync(
            string email,
            Guid tenantId,
            CancellationToken cancellationToken = default);

        Task AddAsync(
            Client client,
            CancellationToken cancellationToken = default);

        Task UpdateAsync(
            Client client,
            CancellationToken cancellationToken = default);
    }
}

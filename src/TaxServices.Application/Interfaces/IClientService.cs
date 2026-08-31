
using TaxServices.Application.DTOs.Clients;

namespace TaxServices.Application.Interfaces
{
    public interface IClientService
    {
        Task<ClientDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<ClientDto>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<ClientDto> CreateAsync(
            CreateClientRequest request,
            CancellationToken cancellationToken = default);

        Task<ClientDto?> UpdateAsync(
            Guid id,
            UpdateClientRequest request,
            CancellationToken cancellationToken = default);

        Task<bool> DeactivateAsync(
            Guid id,
            CancellationToken cancellationToken = default);

        Task<bool> ActivateAsync(
            Guid id,
            CancellationToken cancellationToken = default);
    }
}


using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Clients;

namespace TaxServices.Application.Interfaces
{
    public interface IClientService
    {
        Task<ClientDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        Task<PagedResult<ClientDto>> GetAllAsync(PaginationQueryParameters parameters, CancellationToken cancellationToken = default);

        Task<ClientCreatedResponse> CreateAsync(CreateClientRequest request, CancellationToken cancellationToken = default);

        Task<ClientDto?> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken cancellationToken = default);

        Task<bool> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);

        Task<bool> ActivateAsync(Guid id, CancellationToken cancellationToken = default);

        Task<ClientDto?> GetCurrentAsync(string userId, CancellationToken cancellationToken = default);

        Task<ClientDto?> UpdateCurrentAsync(string userId, UpdateClientRequest request, CancellationToken cancellationToken = default);
    }
}

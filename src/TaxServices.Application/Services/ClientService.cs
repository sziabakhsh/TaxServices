using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Clients;
using TaxServices.Application.Interfaces;
using TaxServices.Application.Validation;
using TaxServices.Domain.Clients;

namespace TaxServices.Application.Services
{
    public class ClientService : IClientService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        public ClientService(
            ITaxServicesDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<ClientDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(
                c => c.Id == id &&
                c.TenantId == _tenantContext.TenantId,
                cancellationToken);

            return client == null
                ? null
                : MapToDto(client);
        }

        public async Task<IReadOnlyList<ClientDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            var clients = await _context.Clients.Where(
                c => c.TenantId == _tenantContext.TenantId).ToListAsync(
                    cancellationToken);

            return clients
                .Select(MapToDto)
                .ToList();
        }

        public async Task<ClientDto> CreateAsync(
            CreateClientRequest request,
            CancellationToken cancellationToken = default)
        {
            ClientValidator.Validate(request);

            var emailExists = await _context.Clients.AnyAsync(
                c => c.Email == request.Email
                && c.TenantId == _tenantContext.TenantId,
                cancellationToken);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "A client with this email already exists.");
            }

            var client = new Client
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantContext.TenantId,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim(),
                PhoneNumber = request.PhoneNumber.Trim(),
                IsActive = request.IsActive
            };

            if (request.IndividualProfile != null)
            {
                client.IndividualProfile = new IndividualProfile
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantContext.TenantId,
                    ClientId = client.Id,
                    SIN = request.IndividualProfile.SIN.Trim(),
                    DateOfBirth = request.IndividualProfile.DateOfBirth,
                    Address = request.IndividualProfile.Address.Trim()
                };
            }

            await _context.Clients.AddAsync(
                client,
                cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            return MapToDto(client);
        }

        public async Task<ClientDto?> UpdateAsync(
            Guid id,
            UpdateClientRequest request,
            CancellationToken cancellationToken = default)
        {
            ClientValidator.Validate(request);

            var client = await _context.Clients.FirstOrDefaultAsync(
                c => c.Id == id
                && c.TenantId == _tenantContext.TenantId,
                cancellationToken);

            if (client == null)
            {
                return null;
            }

            if (!string.Equals(
                    client.Email,
                    request.Email.Trim(),
                    StringComparison.OrdinalIgnoreCase))
            {
                var emailExists =
                    await _context.Clients.AnyAsync(
                        c => c.Email == request.Email
                        && c.TenantId == _tenantContext.TenantId,
                        cancellationToken);

                if (emailExists)
                {
                    throw new InvalidOperationException(
                        "A client with this email already exists.");
                }
            }

            client.FirstName = request.FirstName.Trim();
            client.LastName = request.LastName.Trim();
            client.Email = request.Email.Trim();
            client.PhoneNumber = request.PhoneNumber.Trim();

            if (request.IndividualProfile == null)
            {
                client.IndividualProfile = null;
            }
            else if (client.IndividualProfile == null)
            {
                client.IndividualProfile = new IndividualProfile
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantContext.TenantId,
                    ClientId = client.Id,
                    SIN = request.IndividualProfile.SIN.Trim(),
                    DateOfBirth = request.IndividualProfile.DateOfBirth,
                    Address = request.IndividualProfile.Address.Trim()
                };
            }
            else
            {
                client.IndividualProfile.SIN =
                    request.IndividualProfile.SIN.Trim();

                client.IndividualProfile.DateOfBirth =
                    request.IndividualProfile.DateOfBirth;

                client.IndividualProfile.Address =
                    request.IndividualProfile.Address.Trim();
            }

            await _context.SaveChangesAsync(cancellationToken);

            return MapToDto(client);
        }

        public async Task<bool> DeactivateAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(
                c => c.Id == id && c.TenantId == _tenantContext.TenantId,
                cancellationToken);

            if (client == null)
            {
                return false;
            }

            client.IsActive = false;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> ActivateAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(
                c => c.Id == id && c.TenantId == _tenantContext.TenantId,
                cancellationToken);

            if (client == null)
            {
                return false;
            }

            client.IsActive = true;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        private static ClientDto MapToDto(Client client)
        {
            return new ClientDto
            {
                Id = client.Id,
                FirstName = client.FirstName,
                LastName = client.LastName,
                Email = client.Email,
                PhoneNumber = client.PhoneNumber,
                IsActive = client.IsActive,

                IndividualProfile =
                    client.IndividualProfile == null
                        ? null
                        : new IndividualProfileDto
                        {
                            Id = client.IndividualProfile.Id,
                            DateOfBirth =
                                client.IndividualProfile.DateOfBirth,
                            Address =
                                client.IndividualProfile.Address
                        }
            };
        }
    }
}
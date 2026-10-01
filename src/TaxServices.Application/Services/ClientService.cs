using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.DTOs.Clients;
using TaxServices.Application.Exceptions;
using TaxServices.Application.Interfaces;
using TaxServices.Application.Validation;
using TaxServices.Domain.Clients;

namespace TaxServices.Application.Services
{
    public class ClientService : IClientService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;
        private readonly IAuthService _authService;
        private readonly ISensitiveDataProtector _sensitiveDataProtector;
        private readonly IAccountEmailService _accountEmailService;
        public ClientService(
            ITaxServicesDbContext context,
            ITenantContext tenantContext,
            IAuthService authService,
            ISensitiveDataProtector sensitiveDataProtector,
            IAccountEmailService accountEmailService)
        {
            _context = context;
            _tenantContext = tenantContext;
            _authService = authService;
            _sensitiveDataProtector = sensitiveDataProtector;
            _accountEmailService = accountEmailService;
        }

        public async Task<ClientDto?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var client = await _context.Clients
                .Include(c => c.IndividualProfile)
                .FirstOrDefaultAsync(
                    c => c.Id == id &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            return client == null
                ? null
                : MapToDto(client);
        }

        public async Task<PagedResult<ClientDto>> GetAllAsync(
            PaginationQueryParameters parameters,
            CancellationToken cancellationToken = default)
        {
            var query = _context.Clients
                .AsNoTracking()
                .Include(c => c.IndividualProfile)
                .Where(c => c.TenantId == _tenantContext.TenantId);

            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var search = parameters.Search.Trim();

                query = query.Where(c =>
                    c.FirstName.Contains(search) ||
                    c.LastName.Contains(search) ||
                    c.Email.Contains(search));
            }

            var totalCount =
                await query.CountAsync(cancellationToken);

            var clients = await query
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.FirstName)
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync(cancellationToken);

            var items = clients
                .Select(MapToDto)
                .ToList();

            return new PagedResult<ClientDto>
            {
                Items = items,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<ClientCreatedResponse> CreateAsync(
    CreateClientRequest request,
    CancellationToken cancellationToken = default)
        {
            ClientValidator.Validate(request);

            var email = request.Email.Trim();

            var emailExists =
                await _context.Clients.AnyAsync(
                    c =>
                        c.Email == email &&
                        c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (emailExists)
            {
                throw new DuplicateUserException(
                    "A client with this email already exists.");
            }

            string? sin = null;
            string? sinHash = null;

            if (request.IndividualProfile != null)
            {
                sin = NormalizeSIN(
                    request.IndividualProfile.SIN);

                sinHash =
                    _sensitiveDataProtector.ComputeHash(sin);

                var sinExists =
                    await _context.IndividualProfiles.AnyAsync(
                        p =>
                            p.TenantId ==
                                _tenantContext.TenantId &&
                            p.SINHash == sinHash,
                        cancellationToken);

                if (sinExists)
                {
                    throw new DuplicateUserException(
                        "A client with this SIN already exists.");
                }
            }

            var newUser = new NewUserRequestInApp
            {
                Email = email,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Role = "Client"
            };

            UserCreatedResponse userCreatedResponse;
            Client client;

            await using var transaction =
                await _context.BeginTransactionAsync(
                    cancellationToken);

            try
            {
                userCreatedResponse =
                    await _authService.CreateUserAsync(
                        newUser,
                        cancellationToken);

                client = new Client
                {
                    Id = Guid.NewGuid(),
                    TenantId = _tenantContext.TenantId,
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Email = email,
                    PhoneNumber = request.PhoneNumber.Trim(),
                    IsActive = request.IsActive,
                    UserId = userCreatedResponse.UserId
                };

                if (request.IndividualProfile != null)
                {
                    client.IndividualProfile =
                        new IndividualProfile
                        {
                            Id = Guid.NewGuid(),
                            TenantId =
                                _tenantContext.TenantId,
                            ClientId = client.Id,

                            EncryptedSIN =
                                _sensitiveDataProtector
                                    .Protect(sin!),

                            SINHash = sinHash!,

                            DateOfBirth =
                                request.IndividualProfile
                                    .DateOfBirth,

                            Address =
                                request.IndividualProfile
                                    .Address.Trim()
                        };
                }

                await _context.Clients.AddAsync(
                    client,
                    cancellationToken);

                await _context.SaveChangesAsync(
                    cancellationToken);

                await transaction.CommitAsync(
                    cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(
                    cancellationToken);

                throw;
            }
            // Generate the password setup token only after
            // the database transaction has committed successfully.
            var passwordSetupToken =
                await _authService.GeneratePasswordSetupTokenAsync(
                    userCreatedResponse.UserId,
                    cancellationToken);

            // Send password setup invitation.
            await _accountEmailService.SendInvitationAsync(
                client.FirstName,
                client.Email,
                passwordSetupToken,
                cancellationToken);

            return new ClientCreatedResponse
            {
                Client = MapToDto(client)
            };
        }
        public async Task<ClientDto?> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken cancellationToken = default)
        {
            ClientValidator.Validate(request);

            var client = await _context.Clients
                .Include(c => c.IndividualProfile)
                .FirstOrDefaultAsync(
                    c => c.Id == id &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (client is null)
                return null;

            await using var transaction =
                await _context.BeginTransactionAsync(
                    cancellationToken);

            try
            {
                client.FirstName =
                    request.FirstName.Trim();

                client.LastName =
                    request.LastName.Trim();

                client.PhoneNumber =
                    request.PhoneNumber.Trim();

                if (request.IndividualProfile != null)
                {
                    if (client.IndividualProfile is null)
                    {
                        var sin = NormalizeSIN(
                            request.IndividualProfile.SIN);

                        var sinHash =
                            _sensitiveDataProtector
                                .ComputeHash(sin);

                        var sinExists =
                            await _context.IndividualProfiles
                                .AnyAsync(
                                    p =>
                                        p.TenantId ==
                                            _tenantContext.TenantId &&
                                        p.SINHash == sinHash,
                                    cancellationToken);

                        if (sinExists)
                        {
                            throw new DuplicateUserException("A client with this SIN already exists.");
                        }

                        client.IndividualProfile =
                            new IndividualProfile
                            {
                                Id = Guid.NewGuid(),
                                TenantId =
                                    _tenantContext.TenantId,
                                ClientId = client.Id,

                                EncryptedSIN =
                                    _sensitiveDataProtector
                                        .Protect(sin),

                                SINHash = sinHash,

                                DateOfBirth =
                                    request.IndividualProfile
                                        .DateOfBirth,

                                Address =
                                    request.IndividualProfile
                                        .Address.Trim()
                            };
                    }
                    else
                    {
                        if (!string.IsNullOrWhiteSpace(
                                request.IndividualProfile.SIN))
                        {
                            var sin = NormalizeSIN(
                                request.IndividualProfile.SIN);

                            var sinHash =
                                _sensitiveDataProtector
                                    .ComputeHash(sin);

                            var sinExists =
                                await _context.IndividualProfiles
                                    .AnyAsync(
                                        p =>
                                            p.TenantId ==
                                                _tenantContext.TenantId &&
                                            p.SINHash == sinHash &&
                                            p.Id !=
                                                client.IndividualProfile.Id,
                                        cancellationToken);

                            if (sinExists)
                            {
                                throw new DuplicateUserException("A client with this SIN already exists.");
                            }

                            client.IndividualProfile.EncryptedSIN =
                                _sensitiveDataProtector
                                    .Protect(sin);

                            client.IndividualProfile.SINHash =
                                sinHash;
                        }

                        client.IndividualProfile.DateOfBirth =
                            request.IndividualProfile.DateOfBirth;

                        client.IndividualProfile.Address =
                            request.IndividualProfile.Address.Trim();
                    }
                }

                if (!string.IsNullOrWhiteSpace(client.UserId))
                {
                    var updatedUser =
                        new UpdatedUserRequestInApp
                        {
                            UserId = client.UserId,
                            Email = client.Email,
                            FirstName = client.FirstName,
                            LastName = client.LastName
                        };

                    await _authService.UpdateUserAsync(
                        updatedUser,
                        cancellationToken);
                }

                await _context.SaveChangesAsync(
                    cancellationToken);

                await transaction.CommitAsync(
                    cancellationToken);

                return MapToDto(client);
            }
            catch
            {
                await transaction.RollbackAsync(
                    cancellationToken);

                throw;
            }
        }

        public async Task<bool> DeactivateAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var client =
                await _context.Clients.FirstOrDefaultAsync(
                    c => c.Id == id &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (client == null)
            {
                return false;
            }

            client.IsActive = false;

            await _context.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        public async Task<bool> ActivateAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var client =
                await _context.Clients.FirstOrDefaultAsync(
                    c => c.Id == id &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (client == null)
            {
                return false;
            }

            client.IsActive = true;

            await _context.SaveChangesAsync(
                cancellationToken);

            return true;
        }

        private ClientDto MapToDto(Client client)
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

                            MaskedSIN = MaskSIN(_sensitiveDataProtector.Unprotect(client.IndividualProfile.EncryptedSIN)),

                            DateOfBirth = client.IndividualProfile.DateOfBirth,

                            Address = client.IndividualProfile.Address
                        }
            };
        }

        private static string MaskSIN(string sin)
        {
            if (string.IsNullOrWhiteSpace(sin) ||
                sin.Length != 9)
            {
                return string.Empty;
            }

            return $"*** *** {sin[^3..]}";
        }

        public async Task<ClientDto?> GetCurrentAsync(
            string userId,
            CancellationToken cancellationToken = default)
        {
            var client = await _context.Clients
                .Include(c => c.IndividualProfile)
                .FirstOrDefaultAsync(
                    c => c.UserId == userId &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            return client == null
                ? null
                : MapToDto(client);
        }

        public async Task<ClientDto?> UpdateCurrentAsync(
    string userId,
    UpdateClientRequest request,
    CancellationToken cancellationToken = default)
        {
            ClientValidator.Validate(request);

            var client = await _context.Clients
                .Include(c => c.IndividualProfile)
                .FirstOrDefaultAsync(
                    c => c.UserId == userId &&
                         c.TenantId == _tenantContext.TenantId,
                    cancellationToken);

            if (client is null)
                return null;

            await using var transaction =
                await _context.BeginTransactionAsync(
                    cancellationToken);

            try
            {
                client.FirstName =
                    request.FirstName.Trim();

                client.LastName =
                    request.LastName.Trim();

                client.PhoneNumber =
                    request.PhoneNumber.Trim();

                if (request.IndividualProfile != null)
                {
                    if (client.IndividualProfile is null)
                    {
                        var sin = NormalizeSIN(
                            request.IndividualProfile.SIN);

                        var sinHash =
                            _sensitiveDataProtector
                                .ComputeHash(sin);

                        var sinExists =
                            await _context.IndividualProfiles
                                .AnyAsync(
                                    p =>
                                        p.TenantId ==
                                            _tenantContext.TenantId &&
                                        p.SINHash == sinHash,
                                    cancellationToken);

                        if (sinExists)
                        {
                            throw new DuplicateUserException("A client with this SIN already exists.");
                        }

                        client.IndividualProfile =
                            new IndividualProfile
                            {
                                Id = Guid.NewGuid(),
                                TenantId =
                                    _tenantContext.TenantId,
                                ClientId = client.Id,

                                EncryptedSIN =
                                    _sensitiveDataProtector
                                        .Protect(sin),

                                SINHash = sinHash,

                                DateOfBirth =
                                    request.IndividualProfile
                                        .DateOfBirth,

                                Address =
                                    request.IndividualProfile
                                        .Address.Trim()
                            };
                    }
                    else
                    {
                        if (!string.IsNullOrWhiteSpace(
                                request.IndividualProfile.SIN))
                        {
                            var sin = NormalizeSIN(
                                request.IndividualProfile.SIN);

                            var sinHash =
                                _sensitiveDataProtector
                                    .ComputeHash(sin);

                            var sinExists =
                                await _context.IndividualProfiles
                                    .AnyAsync(
                                        p =>
                                            p.TenantId ==
                                                _tenantContext.TenantId &&
                                            p.SINHash == sinHash &&
                                            p.Id !=
                                                client.IndividualProfile.Id,
                                        cancellationToken);

                            if (sinExists)
                            {
                                throw new DuplicateUserException("A client with this SIN already exists.");
                            }

                            client.IndividualProfile.EncryptedSIN =
                                _sensitiveDataProtector
                                    .Protect(sin);

                            client.IndividualProfile.SINHash =
                                sinHash;
                        }

                        client.IndividualProfile.DateOfBirth =
                            request.IndividualProfile.DateOfBirth;

                        client.IndividualProfile.Address =
                            request.IndividualProfile.Address.Trim();
                    }
                }

                if (!string.IsNullOrWhiteSpace(client.UserId))
                {
                    var updatedUser =
                        new UpdatedUserRequestInApp
                        {
                            UserId = client.UserId,
                            Email = client.Email,
                            FirstName = client.FirstName,
                            LastName = client.LastName
                        };

                    await _authService.UpdateUserAsync(
                        updatedUser,
                        cancellationToken);
                }

                await _context.SaveChangesAsync(
                    cancellationToken);

                await transaction.CommitAsync(
                    cancellationToken);

                return MapToDto(client);
            }
            catch
            {
                await transaction.RollbackAsync(
                    cancellationToken);

                throw;
            }
        }

        private static string NormalizeSIN(string sin)
        {
            return new string(
                sin.Where(char.IsDigit).ToArray());
        }
    }
}

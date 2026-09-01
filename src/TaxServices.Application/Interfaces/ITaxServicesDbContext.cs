using Microsoft.EntityFrameworkCore;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Employees;
using TaxServices.Domain.Services;

namespace TaxServices.Application.Interfaces
{
    public interface ITaxServicesDbContext
    {
        DbSet<Client> Clients { get; }
        DbSet<IndividualProfile> IndividualProfiles { get; }
        DbSet<Business> Businesses { get; }
        DbSet<ClientBusinessRelationship> ClientBusinessRelationships { get; }
        DbSet<Employee> Employees { get; }
        DbSet<Service> Services { get; }
        DbSet<TaxCase> TaxCases { get; }

        Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default);
    }
}

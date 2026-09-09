using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Employees;
using TaxServices.Domain.Services;
using TaxServices.Domain.Documents;

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
        DbSet<Document> Documents { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}

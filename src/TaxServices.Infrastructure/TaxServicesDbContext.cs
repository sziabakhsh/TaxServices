using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Employees;
using TaxServices.Domain.Services;
using TaxServices.Infrastructure.Identity;

namespace TaxServices.Infrastructure;

public class TaxServicesDbContext : IdentityDbContext<AppUser>, ITaxServicesDbContext
{

    public TaxServicesDbContext(
        DbContextOptions<TaxServicesDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<IndividualProfile> IndividualProfiles => Set<IndividualProfile>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<ClientBusinessRelationship> ClientBusinessRelationships => Set<ClientBusinessRelationship>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<TaxCase> TaxCases => Set<TaxCase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(TaxServicesDbContext).Assembly);
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return await Database.BeginTransactionAsync(cancellationToken);
    }
}

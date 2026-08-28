using Microsoft.EntityFrameworkCore;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Employees;
using TaxServices.Domain.Services;

namespace TaxServices.Infrastructure;

public class TaxServicesDbContext : DbContext
{

    public TaxServicesDbContext(
        DbContextOptions<TaxServicesDbContext> options)
        : base(options)
    {
    }


    public DbSet<Client> Clients => Set<Client>();

    public DbSet<IndividualProfile> IndividualProfiles => Set<IndividualProfile>();

    public DbSet<Business> Businesses => Set<Business>();

    public DbSet<ClientBusinessRelationship> ClientBusinessRelationships
        => Set<ClientBusinessRelationship>();

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<Service> Services => Set<Service>();

    public DbSet<TaxCase> TaxCases => Set<TaxCase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(TaxServicesDbContext).Assembly);
    }

}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Documents;
using TaxServices.Domain.Employees;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;
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
        DbSet<Document> Documents { get; }
        DbSet<DocumentSignature> DocumentSignatures { get; }
        DbSet<DocumentSignatureEvent> DocumentSignatureEvents { get; }
        DbSet<Invoice> Invoices { get; }
        DbSet<InvoiceItem> InvoiceItems { get; }
        DbSet<Payment> Payments { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}

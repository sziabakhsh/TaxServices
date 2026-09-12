using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Documents;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class DocumentConfiguration : IEntityTypeConfiguration<Document>
    {
        public void Configure(EntityTypeBuilder<Document> builder)
        {
            builder.HasOne(d => d.Client)
                .WithMany(c => c.Documents)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<TaxCase>()
                .WithMany()
                .HasForeignKey(d => d.TaxCaseId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(d => d.ClientId);

            builder.HasIndex(d => d.TaxCaseId);

            builder.HasIndex(d => new
            {
                d.TenantId,
                d.ClientId
            });
        }
    }
}
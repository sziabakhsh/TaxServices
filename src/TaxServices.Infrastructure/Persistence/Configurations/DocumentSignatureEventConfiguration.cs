using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Documents;

namespace TaxServices.Infrastructure.Persistence.Configurations;

public class DocumentSignatureEventConfiguration : IEntityTypeConfiguration<DocumentSignatureEvent>
{
    public void Configure(EntityTypeBuilder<DocumentSignatureEvent> builder)
    {
        builder.ToTable("DocumentSignatureEvents");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EventType).HasConversion<int>();
        builder.HasIndex(x => new { x.TenantId, x.DocumentSignatureId, x.OccurredAt });
    }
}

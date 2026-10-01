using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Documents;

namespace TaxServices.Infrastructure.Persistence.Configurations;

public class DocumentSignatureConfiguration : IEntityTypeConfiguration<DocumentSignature>
{
    public void Configure(EntityTypeBuilder<DocumentSignature> builder)
    {
        builder.ToTable("DocumentSignatures");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<int>();
        builder.Property(x => x.DocumentHash).IsRequired().HasMaxLength(64);
        builder.HasIndex(x => new { x.TenantId, x.DocumentId });
        builder.HasIndex(x => new { x.TenantId, x.ClientId, x.Status });

        builder.HasOne(x => x.Document).WithMany().HasForeignKey(x => x.DocumentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Client).WithMany().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.Events).WithOne(x => x.DocumentSignature).HasForeignKey(x => x.DocumentSignatureId).OnDelete(DeleteBehavior.Cascade);
    }
}

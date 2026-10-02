using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Invoices;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.Property(i => i.InvoiceNumber)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(i => i.Subtotal)
                .HasPrecision(18, 2);

            builder.Property(i => i.TaxAmount)
                .HasPrecision(18, 2);

            builder.Property(i => i.TotalAmount)
                .HasPrecision(18, 2);

            builder.Property(i => i.Notes)
                .HasMaxLength(2000);

            builder.Property(i => i.TaxRate)
                .HasPrecision(5, 2);

            builder.HasOne(i => i.Client)
                .WithMany()
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(i => i.Items)
                .WithOne(ii => ii.Invoice)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(i => new
            {
                i.TenantId,
                i.InvoiceNumber
            })
            .IsUnique();

            builder.HasIndex(i => new
            {
                i.TenantId,
                i.ClientId
            });

            builder.HasIndex(i => new
            {
                i.TenantId,
                i.Status
            });
        }
    }
}

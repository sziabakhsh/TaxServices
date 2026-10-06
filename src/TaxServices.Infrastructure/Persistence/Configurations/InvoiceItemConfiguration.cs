using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Invoices;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class InvoiceItemConfiguration
        : IEntityTypeConfiguration<InvoiceItem>
    {
        public void Configure(
            EntityTypeBuilder<InvoiceItem> builder)
        {
            builder.Property(ii => ii.Description)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(ii => ii.Quantity)
                .HasPrecision(18, 2);

            builder.Property(ii => ii.UnitPrice)
                .HasPrecision(18, 2);

            builder.Property(ii => ii.DiscountAmount)
                .HasPrecision(18, 2)
                .HasDefaultValue(0);

            builder.Property(ii => ii.Amount)
                .HasPrecision(18, 2);

            builder.HasOne(ii => ii.Service)
                .WithMany()
                .HasForeignKey(ii => ii.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(ii => new
            {
                ii.TenantId,
                ii.InvoiceId
            });

            builder.HasIndex(ii => new
            {
                ii.TenantId,
                ii.ServiceId
            });
        }
    }
}
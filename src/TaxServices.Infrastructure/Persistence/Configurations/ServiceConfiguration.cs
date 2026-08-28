using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Services;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class ServiceConfiguration
    : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.ToTable("Services");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.TenantId)
                .IsRequired();

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.BasePrice)
                .HasPrecision(18, 2);

            builder.Property(x => x.IsActive)
                .IsRequired();

            builder.HasIndex(x => new { x.TenantId, x.Name })
                .IsUnique();
        }
    }
}

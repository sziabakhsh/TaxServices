

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Clients;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class BusinessConfiguration
     : IEntityTypeConfiguration<Business>
    {
        public void Configure(EntityTypeBuilder<Business> builder)
        {
            builder.ToTable("Businesses");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.TenantId)
                .IsRequired();

            builder.Property(x => x.LegalName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.BusinessNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(30);

            builder.Property(x => x.Email)
                .HasMaxLength(255);

            builder.Property(x => x.Address)
                .HasMaxLength(500);

            builder.HasIndex(x => new { x.TenantId, x.BusinessNumber })
                .IsUnique();

            builder.HasMany(x => x.ClientRelationships)
                .WithOne(x => x.Business)
                .HasForeignKey(x => x.BusinessId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

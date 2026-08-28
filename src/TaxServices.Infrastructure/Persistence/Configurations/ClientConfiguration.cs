using Microsoft.EntityFrameworkCore;
using TaxServices.Domain.Clients;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class ClientConfiguration
    {
        public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<TaxServices.Domain.Clients.Client> builder)
        {
            builder.ToTable("Clients");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.TenantId)
                .IsRequired();

            builder.Property(x => x.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.LastName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(30);

            builder.Property(x => x.IsActive)
                .IsRequired();

            builder.HasIndex(x => new { x.TenantId, x.Email })
                .IsUnique();

            builder.HasOne(x => x.IndividualProfile)
                .WithOne(x => x.Client)
                .HasForeignKey<IndividualProfile>(x => x.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.BusinessRelationships)
                .WithOne(x => x.Client)
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.TaxCases)
                .WithOne(x => x.Client)
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

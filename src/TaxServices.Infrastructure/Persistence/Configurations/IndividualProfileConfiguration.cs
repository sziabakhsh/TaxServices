using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Clients;

namespace TaxServices.Infrastructure.Persistence.Configurations
{

    public class IndividualProfileConfiguration
        : IEntityTypeConfiguration<IndividualProfile>
    {
        public void Configure(EntityTypeBuilder<IndividualProfile> builder)
        {
            builder.ToTable("IndividualProfiles");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.TenantId)
                .IsRequired();

            builder.Property(x => x.ClientId)
                .IsRequired();

            builder.Property(x => x.SIN)
                .IsRequired()
                .HasMaxLength(9);

            builder.Property(x => x.DateOfBirth);

            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(30);

            builder.Property(x => x.Address)
                .HasMaxLength(500);

            builder.HasIndex(x => new { x.TenantId, x.ClientId })
                .IsUnique();

            builder.HasIndex(x => new { x.TenantId, x.SIN })
                .IsUnique();

            builder.HasOne(x => x.Client)
                .WithOne(x => x.IndividualProfile)
                .HasForeignKey<IndividualProfile>(x => x.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

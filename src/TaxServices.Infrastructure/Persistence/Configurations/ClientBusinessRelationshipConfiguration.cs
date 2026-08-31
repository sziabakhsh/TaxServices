using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Clients;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class ClientBusinessRelationshipConfiguration
        : IEntityTypeConfiguration<ClientBusinessRelationship>
    {
        public void Configure(EntityTypeBuilder<ClientBusinessRelationship> builder)
        {
            builder.ToTable("ClientBusinessRelationships");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.RelationshipType)
                .HasConversion<int>();

            builder.HasIndex(x => new
            {
                x.TenantId,
                x.ClientId,
                x.BusinessId
            });

            builder.HasOne(x => x.Client)
                .WithMany(x => x.BusinessRelationships)
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Business)
                .WithMany(x => x.ClientRelationships)
                .HasForeignKey(x => x.BusinessId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Cases;

namespace TaxServices.Infrastructure.Persistence.Configurations
{
    public class TaxCaseConfiguration : IEntityTypeConfiguration<TaxCase>
    {
        public void Configure(EntityTypeBuilder<TaxCase> builder)
        {
            builder.ToTable("TaxCases");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.HasIndex(x => new
            {
                x.TenantId,
                x.ClientId,
                x.TaxYear
            });

            builder.HasOne(x => x.Client)
                .WithMany(x => x.TaxCases)
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Employee)
                .WithMany(x => x.TaxCases)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
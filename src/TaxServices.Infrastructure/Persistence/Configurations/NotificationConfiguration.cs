using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaxServices.Domain.Notification;

namespace TaxServices.Infrastructure.Persistence.Configurations
{

    public class NotificationConfiguration
        : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.EventKey)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Type)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.RecipientEmail)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(x => x.Subject)
                .IsRequired()
                .HasMaxLength(300);

            builder.Property(x => x.HtmlBody)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasConversion<int>()
                .IsRequired();

            builder.Property(x => x.AttemptCount)
                .HasDefaultValue(0);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.LastError)
                .HasMaxLength(2000);

            // Prevent duplicate notifications within a tenant
            builder.HasIndex(x => new
            {
                x.TenantId,
                x.EventKey
            }).IsUnique();

            // Efficient lookup for pending notifications
            builder.HasIndex(x => new
            {
                x.Status,
                x.NextAttemptAt
            });
        }
    }
}

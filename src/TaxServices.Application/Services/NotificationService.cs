
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Notification;
using Microsoft.EntityFrameworkCore;

namespace TaxServices.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ITaxServicesDbContext _dbContext;

        public NotificationService(
            ITaxServicesDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task QueueEmailAsync(
            Guid tenantId,
            string eventKey,
            string type,
            string recipientEmail,
            string subject,
            string htmlBody,
            Guid? clientId = null,
            CancellationToken cancellationToken = default)
        {
            if (tenantId == Guid.Empty)
                throw new ArgumentException(
                    "TenantId is required.", nameof(tenantId));

            if (string.IsNullOrWhiteSpace(eventKey))
                throw new ArgumentException(
                    "EventKey is required.", nameof(eventKey));

            if (string.IsNullOrWhiteSpace(recipientEmail))
                throw new ArgumentException(
                    "Recipient email is required.", nameof(recipientEmail));

            var exists = await _dbContext.Notifications
                .AnyAsync(
                    x => x.TenantId == tenantId &&
                         x.EventKey == eventKey,
                    cancellationToken);

            if (exists)
                return;

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ClientId = clientId,
                EventKey = eventKey,
                Type = type,
                RecipientEmail = recipientEmail,
                Subject = subject,
                HtmlBody = htmlBody,
                Status = NotificationStatus.Pending,
                AttemptCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Notifications.Add(notification);

            await _dbContext.SaveChangesAsync(cancellationToken);
        }


        public async Task AddEmailAsync(
            Guid tenantId,
            string eventKey,
            string type,
            string recipientEmail,
            string subject,
            string htmlBody,
            Guid? clientId = null,
            CancellationToken cancellationToken = default)
        {
            if (tenantId == Guid.Empty)
                throw new ArgumentException("TenantId is required.");

            if (string.IsNullOrWhiteSpace(eventKey))
                throw new ArgumentException("EventKey is required.");

            if (string.IsNullOrWhiteSpace(recipientEmail))
                throw new ArgumentException("Recipient email is required.");

            var exists = await _dbContext.Notifications
                .AnyAsync(x =>
                    x.TenantId == tenantId &&
                    x.EventKey == eventKey,
                    cancellationToken);

            if (exists)
                return;

            _dbContext.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ClientId = clientId,
                EventKey = eventKey,
                Type = type,
                RecipientEmail = recipientEmail,
                Subject = subject,
                HtmlBody = htmlBody,
                Status = NotificationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            });
        }

    }
}

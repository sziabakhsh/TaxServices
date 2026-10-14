namespace TaxServices.Application.Interfaces
{
    public interface INotificationService
    {
        Task QueueEmailAsync(
            Guid tenantId,
            string eventKey,
            string type,
            string recipientEmail,
            string subject,
            string htmlBody,
            Guid? clientId = null,
            CancellationToken cancellationToken = default);

        Task AddEmailAsync(
            Guid tenantId,
            string eventKey,
            string type,
            string recipientEmail,
            string subject,
            string htmlBody,
            Guid? clientId = null,
            CancellationToken cancellationToken = default);
    }
}

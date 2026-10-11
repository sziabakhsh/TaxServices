using TaxServices.Domain.Common;

namespace TaxServices.Domain.Notification
{

    public class Notification : Entity
    {
        public Guid? ClientId { get; set; }

        public string EventKey { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string RecipientEmail { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string HtmlBody { get; set; } = string.Empty;

        public NotificationStatus Status { get; set; } =
            NotificationStatus.Pending;

        public int AttemptCount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? SentAt { get; set; }

        public DateTime? NextAttemptAt { get; set; }

        public string? LastError { get; set; }
    }
}

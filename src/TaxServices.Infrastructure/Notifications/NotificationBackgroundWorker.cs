using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Notification;

namespace TaxServices.Infrastructure.Notifications
{
    public sealed class NotificationBackgroundWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationBackgroundWorker> _logger;

        private const int MaxAttempts = 5;

        public NotificationBackgroundWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<NotificationBackgroundWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(
                TimeSpan.FromSeconds(30));

            do
            {
                try
                {
                    await ProcessBatchAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                    when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Notification worker iteration failed.");
                }
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        private async Task ProcessBatchAsync(
            CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();

            var db = scope.ServiceProvider
                .GetRequiredService<ITaxServicesDbContext>();

            var emailService = scope.ServiceProvider
                .GetRequiredService<IEmailService>();

            var now = DateTime.UtcNow;

            var ids = await db.Notifications
                .AsNoTracking()
                .Where(x =>
                    x.AttemptCount < MaxAttempts &&
                    (
                        (
                            (x.Status == NotificationStatus.Pending ||
                             x.Status == NotificationStatus.Failed) &&
                            (x.NextAttemptAt == null ||
                             x.NextAttemptAt <= now)
                        )
                        ||
                        (
                            x.Status == NotificationStatus.Processing &&
                            x.NextAttemptAt != null &&
                            x.NextAttemptAt <= now
                        )
                    ))
                .OrderBy(x => x.CreatedAt)
                .Select(x => x.Id)
                .Take(20)
                .ToListAsync(cancellationToken);

            foreach (var id in ids)
            {
                cancellationToken.ThrowIfCancellationRequested();

                // Atomic claim: only one worker can claim a row.

                var claimTime = DateTime.UtcNow;
                var leaseExpiresAt = claimTime.AddMinutes(5);

                var claimed = await db.Notifications
                    .Where(x =>
                        x.Id == id &&
                        x.AttemptCount < MaxAttempts &&
                        (
                            (
                                (x.Status == NotificationStatus.Pending ||
                                 x.Status == NotificationStatus.Failed) &&
                                (x.NextAttemptAt == null ||
                                 x.NextAttemptAt <= claimTime)
                            )
                            ||
                            (
                                x.Status == NotificationStatus.Processing &&
                                x.NextAttemptAt != null &&
                                x.NextAttemptAt <= claimTime
                            )
                        ))
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(
                            x => x.Status,
                            NotificationStatus.Processing)
                        .SetProperty(
                            x => x.AttemptCount,
                            x => x.AttemptCount + 1)
                        .SetProperty(
                            x => x.NextAttemptAt,
                            (DateTime?)leaseExpiresAt),
                        cancellationToken);

                if (claimed != 1)
                    continue;

                var notification = await db.Notifications
                    .AsNoTracking()
                    .FirstAsync(
                        x => x.Id == id,
                        cancellationToken);

                try
                {
                    await emailService.SendAsync(
                        notification.RecipientEmail,
                        notification.Subject,
                        notification.HtmlBody,
                        cancellationToken);

                    await db.Notifications
                        .Where(x =>
                            x.Id == id &&
                            x.Status == NotificationStatus.Processing)
                        .ExecuteUpdateAsync(setters => setters
                            .SetProperty(
                                x => x.Status,
                                NotificationStatus.Sent)
                            .SetProperty(
                                x => x.SentAt,
                                DateTime.UtcNow)
                            .SetProperty(
                                x => x.NextAttemptAt,
                                (DateTime?)null)
                            .SetProperty(
                                x => x.LastError,
                                (string?)null),
                            cancellationToken);
                }
                catch (OperationCanceledException)
                    when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    var delayMinutes = Math.Min(
                        60,
                        Math.Pow(2, notification.AttemptCount));

                    var nextAttempt = notification.AttemptCount
                        >= MaxAttempts
                        ? (DateTime?)null
                        : DateTime.UtcNow.AddMinutes(delayMinutes);

                    await db.Notifications
                        .Where(x =>
                            x.Id == id &&
                            x.Status == NotificationStatus.Processing)
                        .ExecuteUpdateAsync(setters => setters
                            .SetProperty(
                                x => x.Status,
                                NotificationStatus.Failed)
                            .SetProperty(
                                x => x.NextAttemptAt,
                                nextAttempt)
                            .SetProperty(
                                x => x.LastError,
                                ex.Message.Length > 2000
                                    ? ex.Message.Substring(0, 2000)
                                    : ex.Message),
                            cancellationToken);

                    _logger.LogWarning(
                        ex,
                        "Email notification {NotificationId} failed.",
                        id);
                }
            }
        }
    }
}

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Payments;
using Microsoft.EntityFrameworkCore;

namespace TaxServices.Infrastructure.Payments
{
    public sealed class PaymentReconciliationBackgroundWorker   : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<PaymentReconciliationBackgroundWorker> _logger;

        public PaymentReconciliationBackgroundWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<PaymentReconciliationBackgroundWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(
                TimeSpan.FromMinutes(5));

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessPendingPaymentsAsync(stoppingToken);
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
                        "Payment reconciliation worker failed.");
                }

                try
                {
                    if (!await timer.WaitForNextTickAsync(stoppingToken))
                        break;
                 }
                catch (OperationCanceledException)
                    when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }

        public async Task ProcessPendingPaymentsAsync(
            CancellationToken cancellationToken = default)
        {
            List<Guid> paymentIds;

            await using (var scope = _scopeFactory.CreateAsyncScope())
            {
                var context = scope.ServiceProvider
                    .GetRequiredService<ITaxServicesDbContext>();

                var cutoff = DateTime.UtcNow.AddMinutes(-2);

                paymentIds = await context.Payments
                    .AsNoTracking()
                    .Where(x =>
                        x.Provider == "Stripe" &&
                        x.Status == PaymentStatus.Pending &&
                        x.ProviderPaymentId != null &&
                        x.CreatedAt <= cutoff)
                    .OrderBy(x => x.CreatedAt)
                    .Select(x => x.Id)
                    .Take(50)
                    .ToListAsync(cancellationToken);
            }

            foreach (var paymentId in paymentIds)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    await using var scope =
                        _scopeFactory.CreateAsyncScope();

                    var paymentService = scope.ServiceProvider
                        .GetRequiredService<IPaymentService>();

                    await paymentService.ReconcilePendingPaymentAsync(
                        paymentId,
                        cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to reconcile payment {PaymentId}.",
                        paymentId);
                }
            }
        }
    }
}

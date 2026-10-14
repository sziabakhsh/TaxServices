using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TaxServices.Api.Tests.Infrastructure;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;
using TaxServices.Infrastructure;

namespace TaxServices.Api.Tests.Controllers
{
    public class PaymentReconciliationHostedServiceTests
    {
        [Fact]
        public async Task HostedWorker_Should_Automatically_Reconcile_Payment()
        {
            var tenantId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var invoiceId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();

            var gateway = new FakeOnlinePaymentGateway();

            // 1. Prepare the fake Stripe checkout session.
            var checkout = await gateway.CreateCheckoutAsync(
                paymentId,
                invoiceId,
                tenantId,
                "TEST-HOSTED",
                400m);

            gateway.MarkAsPaid(checkout.SessionId);

            // 2. Seed test data without starting the payment worker.
            using (var seedFactory = new PaymentWebApplicationFactory
            {
                EnablePaymentReconciliationWorker = false,
                SharedPaymentGateway = gateway
            })
            {
                using var scope = seedFactory.Services.CreateScope();

                var db = scope.ServiceProvider
                    .GetRequiredService<TaxServicesDbContext>();

                db.Clients.Add(new Client
                {
                    Id = clientId,
                    TenantId = tenantId,
                    UserId = Guid.NewGuid().ToString(),
                    FirstName = "Hosted",
                    LastName = "Worker",
                    Email = $"hosted-{clientId:N}@example.com",
                    PhoneNumber = "6045550100",
                    IsActive = true
                });

                db.Invoices.Add(new Invoice
                {
                    Id = invoiceId,
                    TenantId = tenantId,
                    ClientId = clientId,
                    InvoiceNumber = $"TEST-{invoiceId:N}",
                    Status = InvoiceStatus.Issued,
                    IssueDate = DateTime.UtcNow,
                    DueDate = DateTime.UtcNow.AddDays(30),
                    Subtotal = 400m,
                    TaxAmount = 0m,
                    TaxRate = 0m,
                    TotalAmount = 400m
                });

                db.Payments.Add(new Payment
                {
                    Id = paymentId,
                    TenantId = tenantId,
                    InvoiceId = invoiceId,
                    Amount = 400m,
                    Method = PaymentMethod.Card,
                    Status = PaymentStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-3),
                    Provider = "Stripe",
                    ProviderPaymentId = checkout.SessionId
                });

                await db.SaveChangesAsync();
            }

            // 3. Start ASP.NET Core with the real payment worker enabled.
            using var workerFactory = new PaymentWebApplicationFactory
            {
                EnablePaymentReconciliationWorker = true,
                SharedPaymentGateway = gateway
            };

            // Accessing Services starts the application and hosted services.
            _ = workerFactory.Services;

            // 4. Wait for the background worker to finalize payment.
            var completed = false;

            using var timeout = new CancellationTokenSource(
                TimeSpan.FromSeconds(30));

            while (!timeout.IsCancellationRequested)
            {
                using var scope = workerFactory.Services.CreateScope();

                var db = scope.ServiceProvider
                    .GetRequiredService<TaxServicesDbContext>();

                var payment = await db.Payments
                    .AsNoTracking()
                    .SingleAsync(x => x.Id == paymentId);

                if (payment.Status == PaymentStatus.Succeeded)
                {
                    completed = true;
                    break;
                }

                try
                {
                    await Task.Delay(250, timeout.Token);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }

            Assert.True(
                completed,
                "Background worker did not reconcile the payment within 30 seconds.");

            // 5. Verify the final state.
            using (var scope = workerFactory.Services.CreateScope())
            {
                var db = scope.ServiceProvider
                    .GetRequiredService<TaxServicesDbContext>();

                var payment = await db.Payments
                    .AsNoTracking()
                    .SingleAsync(x => x.Id == paymentId);

                var invoice = await db.Invoices
                    .AsNoTracking()
                    .SingleAsync(x => x.Id == invoiceId);

                var notificationCount = await db.Notifications
                    .CountAsync(x =>
                        x.EventKey == $"payment-succeeded:{paymentId}");

                Assert.Equal(PaymentStatus.Succeeded, payment.Status);
                Assert.NotNull(payment.PaidAt);
                Assert.Equal(InvoiceStatus.Paid, invoice.Status);
                Assert.Equal(1, notificationCount);
            }
        }
    }
}

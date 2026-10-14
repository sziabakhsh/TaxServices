using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using TaxServices.Api.Tests.Infrastructure;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;
using TaxServices.Infrastructure;
using TaxServices.Infrastructure.Payments;

namespace TaxServices.Api.Tests.Controllers
{
    public class PaymentReconciliationWorkerTests
    : IClassFixture<PaymentWebApplicationFactory>
    {
        private readonly PaymentWebApplicationFactory _factory;

        public PaymentReconciliationWorkerTests(
            PaymentWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Worker_Should_Reconcile_Paid_Stripe_Payment()
        {
            var tenantId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var invoiceId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();

            string sessionId;

            // 1. Create a fake Stripe checkout session
            using (var scope = _factory.Services.CreateScope())
            {
                var gateway = (FakeOnlinePaymentGateway)
                    scope.ServiceProvider
                        .GetRequiredService<IOnlinePaymentGateway>();

                var checkout = await gateway.CreateCheckoutAsync(
                    paymentId,
                    invoiceId,
                    tenantId,
                    "TEST-INVOICE",
                    400m);

                sessionId = checkout.SessionId;

                gateway.MarkAsPaid(sessionId);
            }

            // 2. Seed an eligible pending payment
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider
                    .GetRequiredService<TaxServicesDbContext>();

                db.Clients.Add(new Client
                {
                    Id = clientId,
                    TenantId = tenantId,
                    UserId = Guid.NewGuid().ToString(),
                    FirstName = "Worker",
                    LastName = "Test",
                    Email = $"worker-{clientId:N}@example.com",
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
                    ProviderPaymentId = sessionId
                });

                await db.SaveChangesAsync();
            }

            // 3. Run the actual worker reconciliation logic
            using (var scope = _factory.Services.CreateScope())
            {
                var worker = new PaymentReconciliationBackgroundWorker(
                    scope.ServiceProvider
                        .GetRequiredService<IServiceScopeFactory>(),
                    scope.ServiceProvider
                        .GetRequiredService<
                            ILogger<PaymentReconciliationBackgroundWorker>>());

                await worker.ProcessPendingPaymentsAsync();
            }

            // 4. Verify database state
            using (var scope = _factory.Services.CreateScope())
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

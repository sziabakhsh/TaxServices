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
    public class PaymentConcurrencyTests
    : IClassFixture<PaymentWebApplicationFactory>
    {
        private readonly PaymentWebApplicationFactory _factory;

        public PaymentConcurrencyTests(
            PaymentWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Concurrent_Finalization_Should_Create_Only_One_Notification()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var invoiceId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();
            var sessionId = $"cs_test_concurrent_{paymentId:N}";

            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider
                    .GetRequiredService<TaxServicesDbContext>();

                db.Clients.Add(new Client
                {
                    Id = clientId,
                    TenantId = tenantId,
                    UserId = Guid.NewGuid().ToString(),
                    FirstName = "Payment",
                    LastName = "Test",
                    Email = $"payment-{clientId:N}@example.com",
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
                    CreatedAt = DateTime.UtcNow,
                    Provider = "Stripe",
                    ProviderPaymentId = sessionId
                });

                await db.SaveChangesAsync();
            }

            var paymentEvent = new OnlinePaymentEvent(
                EventId: $"test:{paymentId:N}",
                EventType: "checkout.session.completed",
                SessionId: sessionId,
                PaymentStatus: "paid",
                PaymentId: paymentId,
                InvoiceId: invoiceId,
                TenantId: tenantId);

            // Act: two independent scopes, competing for the same payment.
            async Task FinalizeAsync()
            {
                using var scope = _factory.Services.CreateScope();

                var paymentService = scope.ServiceProvider
                    .GetRequiredService<IPaymentService>();

                await paymentService.HandleOnlinePaymentEventAsync(
                    paymentEvent);
            }

            await Task.WhenAll(
                Task.Run(FinalizeAsync),
                Task.Run(FinalizeAsync));

            // Assert: read persisted state using a fresh DbContext.
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

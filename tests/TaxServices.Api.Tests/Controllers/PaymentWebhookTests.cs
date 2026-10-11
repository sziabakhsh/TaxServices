
using TaxServices.Api.Tests.Infrastructure;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;
using TaxServices.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace TaxServices.Api.Tests.Controllers
{

    public class PaymentWebhookTests
        : IClassFixture<PaymentWebApplicationFactory>
    {
        private readonly PaymentWebApplicationFactory _factory;

        public PaymentWebhookTests(PaymentWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task CompletedWebhook_ProcessedTwice_ShouldBeIdempotent()
        {
            var tenantId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var invoiceId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();
            var sessionId = "cs_test_idempotency";

            using var scope = _factory.Services.CreateScope();

            var db = scope.ServiceProvider
                .GetRequiredService<TaxServicesDbContext>();

            db.Clients.Add(new Client
            {
                Id = clientId,
                TenantId = tenantId,
                UserId = Guid.NewGuid().ToString(),
                FirstName = "Payment",
                LastName = "Test",
                Email = $"payment-{clientId}@example.com",
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
                IssueDate = DateTime.UtcNow.Date,
                DueDate = DateTime.UtcNow.Date.AddDays(30),
                Subtotal = 300m,
                TaxAmount = 0m,
                TotalAmount = 300m,
                TaxRate = 0m
            });

            db.Payments.Add(new Payment
            {
                Id = paymentId,
                TenantId = tenantId,
                InvoiceId = invoiceId,
                Amount = 300m,
                Method = PaymentMethod.Card,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Provider = "Stripe",
                ProviderPaymentId = sessionId
            });

            await db.SaveChangesAsync();
            db.ChangeTracker.Clear();

            var service = scope.ServiceProvider
                .GetRequiredService<IPaymentService>();

            var paymentEvent = new OnlinePaymentEvent(
                "evt_test_idempotency",
                "checkout.session.completed",
                sessionId,
                "paid",
                paymentId,
                invoiceId,
                tenantId);

            await service.HandleOnlinePaymentEventAsync(paymentEvent);

            db.ChangeTracker.Clear();

            var firstPayment = await db.Payments
                .AsNoTracking()
                .SingleAsync(x => x.Id == paymentId);

            Assert.Equal(PaymentStatus.Succeeded, firstPayment.Status);
            Assert.NotNull(firstPayment.PaidAt);

            var firstPaidAt = firstPayment.PaidAt;

            // Simulate Stripe retrying the same webhook.
            await service.HandleOnlinePaymentEventAsync(paymentEvent);

            db.ChangeTracker.Clear();

            var payments = await db.Payments
                .AsNoTracking()
                .Where(x => x.InvoiceId == invoiceId)
                .ToListAsync();

            var invoice = await db.Invoices
                .AsNoTracking()
                .SingleAsync(x => x.Id == invoiceId);

            var payment = Assert.Single(payments);

            Assert.Equal(PaymentStatus.Succeeded, payment.Status);
            Assert.Equal(firstPaidAt, payment.PaidAt);
            Assert.Equal(InvoiceStatus.Paid, invoice.Status);
        }


        [Fact]
        public async Task CompletedWebhook_WithWrongSession_ShouldNotCompletePayment()
        {
            var tenantId = Guid.NewGuid();
            var clientId = Guid.NewGuid();
            var invoiceId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();

            using var scope = _factory.Services.CreateScope();

            var db = scope.ServiceProvider
                .GetRequiredService<TaxServicesDbContext>();

            db.Clients.Add(new Client
            {
                Id = clientId,
                TenantId = tenantId,
                UserId = Guid.NewGuid().ToString(),
                FirstName = "Security",
                LastName = "Test",
                Email = $"security-{clientId}@example.com",
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
                IssueDate = DateTime.UtcNow.Date,
                DueDate = DateTime.UtcNow.Date.AddDays(30),
                Subtotal = 300m,
                TaxAmount = 0m,
                TotalAmount = 300m,
                TaxRate = 0m
            });

            db.Payments.Add(new Payment
            {
                Id = paymentId,
                TenantId = tenantId,
                InvoiceId = invoiceId,
                Amount = 300m,
                Method = PaymentMethod.Card,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Provider = "Stripe",
                ProviderPaymentId = "cs_test_correct_session"
            });

            await db.SaveChangesAsync();
            db.ChangeTracker.Clear();

            var service = scope.ServiceProvider
                .GetRequiredService<IPaymentService>();

            var invalidEvent = new OnlinePaymentEvent(
                "evt_test_wrong_session",
                "checkout.session.completed",
                "cs_test_WRONG_session",
                "paid",
                paymentId,
                invoiceId,
                tenantId);

            // A webhook with a mismatched session must be rejected.
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.HandleOnlinePaymentEventAsync(invalidEvent));

            db.ChangeTracker.Clear();

            var payment = await db.Payments
                .AsNoTracking()
                .SingleAsync(x => x.Id == paymentId);

            var invoice = await db.Invoices
                .AsNoTracking()
                .SingleAsync(x => x.Id == invoiceId);

            Assert.Equal(PaymentStatus.Pending, payment.Status);
            Assert.Null(payment.PaidAt);
            Assert.Equal(InvoiceStatus.Issued, invoice.Status);
        }

    }
}

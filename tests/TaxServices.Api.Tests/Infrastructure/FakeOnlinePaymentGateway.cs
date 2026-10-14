using System.Collections.Concurrent;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Tests.Infrastructure
{

    public sealed class FakeOnlinePaymentGateway : IOnlinePaymentGateway
    {
        private readonly ConcurrentDictionary<string, OnlineCheckoutStatus>
            _sessions = new();

        public Task<OnlineCheckoutResult> CreateCheckoutAsync(
            Guid paymentId,
            Guid invoiceId,
            Guid tenantId,
            string invoiceNumber,
            decimal amount,
            CancellationToken cancellationToken = default)
        {
            var sessionId = $"cs_test_fake_{paymentId:N}";

            _sessions[sessionId] = new OnlineCheckoutStatus(
                SessionId: sessionId,
                PaymentStatus: "unpaid",
                Currency: "cad",
                AmountTotal: decimal.ToInt64(amount * 100m),
                PaymentId: paymentId,
                InvoiceId: invoiceId,
                TenantId: tenantId);

            return Task.FromResult(
                new OnlineCheckoutResult(
                    sessionId,
                    $"https://example.test/checkout/{sessionId}"));
        }

        public Task<OnlineCheckoutStatus> GetCheckoutStatusAsync(
            string sessionId,
            CancellationToken cancellationToken = default)
        {
            if (!_sessions.TryGetValue(sessionId, out var status))
            {
                throw new InvalidOperationException(
                    $"Fake checkout session not found: {sessionId}");
            }

            return Task.FromResult(status);
        }

        public OnlinePaymentEvent ParseWebhook(
            string json,
            string signatureHeader)
        {
            throw new NotSupportedException(
                "Webhook parsing is not used in this test.");
        }

        public void MarkAsPaid(string sessionId)
        {
            if (!_sessions.TryGetValue(sessionId, out var status))
            {
                throw new InvalidOperationException(
                    $"Fake checkout session not found: {sessionId}");
            }

            _sessions[sessionId] = status with
            {
                PaymentStatus = "paid"
            };
        }
    }
}

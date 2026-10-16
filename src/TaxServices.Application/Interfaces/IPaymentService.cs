using TaxServices.Application.DTOs.Payments;
using TaxServices.Domain.Payments;

namespace TaxServices.Application.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<PaymentResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PaymentResponse>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PaymentResponse>> GetMineAsync(string userId, CancellationToken cancellationToken = default);
    Task<PaymentResponse> RecordManualPaymentAsync(CreateManualPaymentRequest request, CancellationToken cancellationToken = default);
    Task<CheckoutSessionResponse> CreateCheckoutSessionAsync(Guid invoiceId, decimal? amount, string userId, CancellationToken cancellationToken = default);
    Task HandleOnlinePaymentEventAsync(OnlinePaymentEvent paymentEvent, CancellationToken cancellationToken = default);
    Task<PaymentResponse> ReconcileOnlinePaymentAsync(
        Guid paymentId,
        CancellationToken cancellationToken = default);
    Task<PaymentResponse> ConfirmClientCheckoutAsync(string sessionId, string userId, CancellationToken cancellationToken = default);
    Task<PaymentResponse> ReconcilePendingPaymentAsync(
        Guid paymentId,
        CancellationToken cancellationToken = default);

}

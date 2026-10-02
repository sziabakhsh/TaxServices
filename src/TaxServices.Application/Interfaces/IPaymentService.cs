using TaxServices.Application.DTOs.Payments;

namespace TaxServices.Application.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<PaymentResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PaymentResponse>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PaymentResponse>> GetMineAsync(string userId, CancellationToken cancellationToken = default);
    Task<PaymentResponse> RecordManualPaymentAsync(CreateManualPaymentRequest request, CancellationToken cancellationToken = default);
    Task<CheckoutSessionResponse> CreateCheckoutSessionAsync(Guid invoiceId, decimal? amount, string userId, CancellationToken cancellationToken = default);
    Task HandleOnlinePaymentEventAsync(OnlinePaymentEvent paymentEvent, CancellationToken cancellationToken = default);
}

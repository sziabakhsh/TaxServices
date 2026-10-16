using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Payments;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;
using System.Data;

namespace TaxServices.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly ITaxServicesDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IOnlinePaymentGateway _onlinePaymentGateway;
    private readonly INotificationService _notificationService;

    public PaymentService(ITaxServicesDbContext context, ITenantContext tenantContext, IOnlinePaymentGateway onlinePaymentGateway, INotificationService notificationService)
    {
        _context = context;
        _tenantContext = tenantContext;
        _onlinePaymentGateway = onlinePaymentGateway;
        _notificationService = notificationService;

    }

    public async Task<IEnumerable<PaymentResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;
        return await Query().Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt).Select(Map()).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<PaymentResponse>> GetByInvoiceIdAsync(Guid invoiceId, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;
        var exists = await _context.Invoices.AnyAsync(x => x.Id == invoiceId && x.TenantId == tenantId, cancellationToken);
        if (!exists) throw new KeyNotFoundException("Invoice not found.");

        return await Query().Where(x => x.TenantId == tenantId && x.InvoiceId == invoiceId)
            .OrderByDescending(x => x.CreatedAt).Select(Map()).ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<PaymentResponse>> GetMineAsync(string userId, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;
        return await Query()
            .Where(x => x.TenantId == tenantId && x.Invoice.Client.UserId == userId)
            .OrderByDescending(x => x.CreatedAt).Select(Map()).ToListAsync(cancellationToken);
    }

    public async Task<PaymentResponse> RecordManualPaymentAsync(CreateManualPaymentRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Method is not PaymentMethod.Cash and not PaymentMethod.InteracETransfer)
            throw new ArgumentException("Manual payments can only use Cash or Interac e-Transfer.");

        if (request.Amount <= 0) throw new ArgumentException("Payment amount must be greater than zero.");

        var tenantId = _tenantContext.TenantId;
        await using var transaction = await _context.BeginTransactionAsync(cancellationToken);

        var invoice = await _context.Invoices.FirstOrDefaultAsync(
            x => x.Id == request.InvoiceId && x.TenantId == tenantId, cancellationToken);

        if (invoice == null) throw new KeyNotFoundException("Invoice not found.");
        if (invoice.Status is InvoiceStatus.Draft or InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Payments can only be recorded for an issued invoice.");
        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Invoice is already paid.");

        var paidAmount = await _context.Payments
            .Where(x => x.TenantId == tenantId && x.InvoiceId == invoice.Id && x.Status == PaymentStatus.Succeeded)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0m;

        var balanceDue = invoice.TotalAmount - paidAmount;
        if (request.Amount > balanceDue)
            throw new InvalidOperationException($"Payment amount exceeds the outstanding balance of {balanceDue:0.00}.");

        var now = DateTime.UtcNow;
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InvoiceId = invoice.Id,
            Amount = decimal.Round(request.Amount, 2, MidpointRounding.AwayFromZero),
            Method = request.Method,
            Status = PaymentStatus.Succeeded,
            CreatedAt = now,
            PaidAt = now,
            Reference = string.IsNullOrWhiteSpace(request.Reference) ? null : request.Reference.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
        };

        _context.Payments.Add(payment);
        if (paidAmount + payment.Amount >= invoice.TotalAmount)
            invoice.Status = InvoiceStatus.Paid;

        await AddPaymentNotificationAsync(payment, invoice, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return ToResponse(payment);
    }

    public async Task<CheckoutSessionResponse> CreateCheckoutSessionAsync(Guid invoiceId, decimal? amount, string userId, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;
        var invoice = await _context.Invoices.Include(x => x.Client).FirstOrDefaultAsync(
            x => x.Id == invoiceId && x.TenantId == tenantId && x.Client.UserId == userId, cancellationToken);

        if (invoice == null) throw new KeyNotFoundException("Invoice not found.");
        if (invoice.Status is InvoiceStatus.Draft or InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Payments can only be made for an issued invoice.");
        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Invoice is already paid.");

        var succeeded = await _context.Payments
            .Where(x => x.TenantId == tenantId && x.InvoiceId == invoice.Id && x.Status == PaymentStatus.Succeeded)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0m;
        var balanceDue = invoice.TotalAmount - succeeded;
        var paymentAmount = decimal.Round(amount ?? balanceDue, 2, MidpointRounding.AwayFromZero);

        if (paymentAmount <= 0) throw new ArgumentException("Payment amount must be greater than zero.");
        if (paymentAmount > balanceDue)
            throw new InvalidOperationException($"Payment amount exceeds the outstanding balance of {balanceDue:0.00}.");

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InvoiceId = invoice.Id,
            Amount = paymentAmount,
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Provider = "Stripe"
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            var checkout = await _onlinePaymentGateway.CreateCheckoutAsync(
                payment.Id, invoice.Id, tenantId, invoice.InvoiceNumber, paymentAmount, cancellationToken);
            payment.ProviderPaymentId = checkout.SessionId;
            await _context.SaveChangesAsync(cancellationToken);
            return new CheckoutSessionResponse { PaymentId = payment.Id, CheckoutUrl = checkout.Url };
        }
        catch
        {
            payment.Status = PaymentStatus.Failed;
            await _context.SaveChangesAsync(cancellationToken);
            throw;
        }
    }


    public async Task HandleOnlinePaymentEventAsync(
        OnlinePaymentEvent paymentEvent,
        CancellationToken cancellationToken = default)
    {
        if (paymentEvent.EventType != "checkout.session.completed" ||
            paymentEvent.PaymentStatus != "paid")
            return;

        if (paymentEvent.PaymentId is null ||
            paymentEvent.InvoiceId is null ||
            paymentEvent.TenantId is null ||
            string.IsNullOrWhiteSpace(paymentEvent.SessionId))
        {
            throw new ArgumentException(
                "Stripe payment metadata is incomplete.");
        }

        // Serialize concurrent finalization of the same payment.
        await using var transaction =
            await _context.BeginTransactionAsync(cancellationToken);

        // Acquire an update lock before reading payment status.
        // The lock is held until transaction commit/rollback.

        var payment = await _context.GetPaymentForUpdateAsync(
            paymentEvent.PaymentId.Value,
            paymentEvent.InvoiceId.Value,
            paymentEvent.TenantId.Value,
            cancellationToken);

        if (payment is null)
            throw new KeyNotFoundException("Payment not found.");

        // Validate the session even for already-succeeded payments.
        if (!string.Equals(
                payment.ProviderPaymentId,
                paymentEvent.SessionId,
                StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "Stripe session does not match the payment.");
        }

        // Webhook and reconciliation may arrive simultaneously.
        // Only the first transaction should finalize the payment.
        if (payment.Status == PaymentStatus.Succeeded)
        {
            await transaction.CommitAsync(cancellationToken);
            return;
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            throw new InvalidOperationException(
                "Payment is not pending.");
        }

        var invoice = await _context.Invoices
            .FirstOrDefaultAsync(
                x => x.Id == payment.InvoiceId &&
                     x.TenantId == payment.TenantId,
                cancellationToken)
            ?? throw new KeyNotFoundException("Invoice not found.");

        var otherSucceeded = await _context.Payments
            .Where(x =>
                x.TenantId == payment.TenantId &&
                x.InvoiceId == payment.InvoiceId &&
                x.Status == PaymentStatus.Succeeded &&
                x.Id != payment.Id)
            .SumAsync(
                x => (decimal?)x.Amount,
                cancellationToken) ?? 0m;

        payment.Status = PaymentStatus.Succeeded;
        payment.PaidAt = DateTime.UtcNow;

        if (otherSucceeded + payment.Amount >= invoice.TotalAmount)
            invoice.Status = InvoiceStatus.Paid;

        await AddPaymentNotificationAsync(
            payment,
            invoice,
            cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }


    // Called only by the authenticated owner of the invoice after returning from Stripe.
    public async Task<PaymentResponse> ConfirmClientCheckoutAsync(
        string sessionId, string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId) || sessionId.Length > 255 ||
            !sessionId.StartsWith("cs_", StringComparison.Ordinal))
            throw new ArgumentException("Invalid Stripe checkout session.");

        var tenantId = _tenantContext.TenantId;
        var payment = await _context.Payments.AsNoTracking().FirstOrDefaultAsync(
            x => x.TenantId == tenantId && x.Provider == "Stripe" &&
                 x.ProviderPaymentId == sessionId && x.Invoice.Client.UserId == userId,
            cancellationToken) ?? throw new KeyNotFoundException("Checkout session not found.");

        if (payment.Status != PaymentStatus.Pending)
            return ToResponse(payment);

        // Uses the same metadata/amount/currency verification and idempotent
        // finalization as the background reconciliation and Stripe webhook.
        return await ReconcilePendingPaymentAsync(payment.Id, cancellationToken);
    }

    public async Task<PaymentResponse> ReconcileOnlinePaymentAsync(
        Guid paymentId,
        CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;

        var payment = await _context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == paymentId &&
                     x.TenantId == tenantId &&
                     x.Provider == "Stripe",
                cancellationToken)
            ?? throw new KeyNotFoundException("Payment not found.");

        if (payment.Status == PaymentStatus.Succeeded)
            return ToResponse(payment);

        if (payment.Status != PaymentStatus.Pending)
            throw new InvalidOperationException(
                "Only pending payments can be reconciled.");

        if (string.IsNullOrWhiteSpace(payment.ProviderPaymentId))
            throw new InvalidOperationException(
                "Stripe checkout session is missing.");

        // Read the actual payment status directly from Stripe.
        var checkout = await _onlinePaymentGateway.GetCheckoutStatusAsync(
            payment.ProviderPaymentId,
            cancellationToken);

        if (checkout.PaymentStatus != "paid")
            throw new InvalidOperationException(
                "Stripe has not confirmed this payment as paid.");

        // Verify the session belongs to this payment and tenant.
        if (checkout.SessionId != payment.ProviderPaymentId ||
            checkout.PaymentId != payment.Id ||
            checkout.InvoiceId != payment.InvoiceId ||
            checkout.TenantId != payment.TenantId)
        {
            throw new InvalidOperationException(
                "Stripe checkout metadata does not match the payment.");
        }

        if (!string.Equals(
                checkout.Currency,
                "cad",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Stripe checkout currency does not match CAD.");
        }

        var expectedAmount = checked((long)decimal.Round(
            payment.Amount * 100m,
            0,
            MidpointRounding.AwayFromZero));

        if (checkout.AmountTotal != expectedAmount)
            throw new InvalidOperationException(
                "Stripe checkout amount does not match the payment.");

        // Reuse the existing payment finalization logic.
        await HandleOnlinePaymentEventAsync(
            new OnlinePaymentEvent(
                EventId: $"reconcile:{checkout.SessionId}",
                EventType: "checkout.session.completed",
                SessionId: checkout.SessionId,
                PaymentStatus: checkout.PaymentStatus,
                PaymentId: checkout.PaymentId,
                InvoiceId: checkout.InvoiceId,
                TenantId: checkout.TenantId),
            cancellationToken);

        var updated = await _context.Payments
            .AsNoTracking()
            .FirstAsync(
                x => x.Id == paymentId &&
                     x.TenantId == tenantId,
                cancellationToken);

        return ToResponse(updated);
    }


    public async Task<PaymentResponse> ReconcilePendingPaymentAsync(
        Guid paymentId,
        CancellationToken cancellationToken = default)
    {
        var payment = await _context.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == paymentId &&
                     x.Provider == "Stripe",
                cancellationToken)
            ?? throw new KeyNotFoundException("Payment not found.");

        if (payment.Status == PaymentStatus.Succeeded)
            return ToResponse(payment);

        if (payment.Status != PaymentStatus.Pending)
            throw new InvalidOperationException(
                "Only pending payments can be reconciled.");

        if (string.IsNullOrWhiteSpace(payment.ProviderPaymentId))
            throw new InvalidOperationException(
                "Stripe checkout session is missing.");

        var checkout = await _onlinePaymentGateway.GetCheckoutStatusAsync(
            payment.ProviderPaymentId,
            cancellationToken);

        if (checkout.PaymentStatus != "paid")
            return ToResponse(payment);

        if (checkout.SessionId != payment.ProviderPaymentId ||
            checkout.PaymentId != payment.Id ||
            checkout.InvoiceId != payment.InvoiceId ||
            checkout.TenantId != payment.TenantId)
        {
            throw new InvalidOperationException(
                "Stripe checkout metadata does not match the payment.");
        }

        if (!string.Equals(
                checkout.Currency,
                "cad",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Stripe checkout currency does not match CAD.");
        }

        var expectedAmount = checked((long)decimal.Round(
            payment.Amount * 100m,
            0,
            MidpointRounding.AwayFromZero));

        if (checkout.AmountTotal != expectedAmount)
            throw new InvalidOperationException(
                "Stripe checkout amount does not match the payment.");

        await HandleOnlinePaymentEventAsync(
            new OnlinePaymentEvent(
                EventId: $"reconcile:{checkout.SessionId}",
                EventType: "checkout.session.completed",
                SessionId: checkout.SessionId,
                PaymentStatus: checkout.PaymentStatus,
                PaymentId: checkout.PaymentId,
                InvoiceId: checkout.InvoiceId,
                TenantId: checkout.TenantId),
            cancellationToken);

        var updated = await _context.Payments
            .AsNoTracking()
            .FirstAsync(
                x => x.Id == paymentId,
                cancellationToken);

        return ToResponse(updated);
    }


    private IQueryable<Payment> Query() => _context.Payments.AsNoTracking();

    private static System.Linq.Expressions.Expression<Func<Payment, PaymentResponse>> Map() => x => new PaymentResponse
    {
        Id = x.Id,
        InvoiceId = x.InvoiceId,
        Amount = x.Amount,
        Method = x.Method,
        Status = x.Status,
        CreatedAt = x.CreatedAt,
        PaidAt = x.PaidAt,
        Provider = x.Provider,
        ProviderPaymentId = x.ProviderPaymentId,
        Reference = x.Reference,
        Notes = x.Notes
    };

    private static PaymentResponse ToResponse(Payment x) => new()
    {
        Id = x.Id,
        InvoiceId = x.InvoiceId,
        Amount = x.Amount,
        Method = x.Method,
        Status = x.Status,
        CreatedAt = x.CreatedAt,
        PaidAt = x.PaidAt,
        Provider = x.Provider,
        ProviderPaymentId = x.ProviderPaymentId,
        Reference = x.Reference,
        Notes = x.Notes
    };

    private async Task AddPaymentNotificationAsync(
        Payment payment,
        Invoice invoice,
        CancellationToken cancellationToken)
    {
        var client = await _context.Clients
            .AsNoTracking()
            .FirstAsync(
                x => x.Id == invoice.ClientId &&
                     x.TenantId == payment.TenantId,
                cancellationToken);

        await _notificationService.AddEmailAsync(
            tenantId: payment.TenantId,
            eventKey: $"payment-succeeded:{payment.Id}",
            type: "PaymentSucceeded",
            recipientEmail: client.Email,
            subject: $"Payment received - {invoice.InvoiceNumber}",
            htmlBody:
                "<p>We have received your payment of " +
                $"{payment.Amount:0.00} CAD for invoice " +
                $"{System.Net.WebUtility.HtmlEncode(invoice.InvoiceNumber)}.</p>" +
                "<p>Thank you.</p>",
            clientId: invoice.ClientId,
            cancellationToken: cancellationToken);
    }

}

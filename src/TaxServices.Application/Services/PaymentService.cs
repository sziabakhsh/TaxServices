using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Payments;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;

namespace TaxServices.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly ITaxServicesDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IOnlinePaymentGateway _onlinePaymentGateway;

    public PaymentService(ITaxServicesDbContext context, ITenantContext tenantContext, IOnlinePaymentGateway onlinePaymentGateway)
    {
        _context = context;
        _tenantContext = tenantContext;
        _onlinePaymentGateway = onlinePaymentGateway;
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
            Id = Guid.NewGuid(), TenantId = tenantId, InvoiceId = invoice.Id,
            Amount = decimal.Round(request.Amount, 2, MidpointRounding.AwayFromZero),
            Method = request.Method, Status = PaymentStatus.Succeeded,
            CreatedAt = now, PaidAt = now,
            Reference = string.IsNullOrWhiteSpace(request.Reference) ? null : request.Reference.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
        };

        _context.Payments.Add(payment);
        if (paidAmount + payment.Amount >= invoice.TotalAmount)
            invoice.Status = InvoiceStatus.Paid;

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
            Id = Guid.NewGuid(), TenantId = tenantId, InvoiceId = invoice.Id,
            Amount = paymentAmount, Method = PaymentMethod.Card, Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow, Provider = "Stripe"
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

    public async Task HandleOnlinePaymentEventAsync(OnlinePaymentEvent paymentEvent, CancellationToken cancellationToken = default)
    {
        if (paymentEvent.EventType != "checkout.session.completed" || paymentEvent.PaymentStatus != "paid") return;
        if (paymentEvent.PaymentId is null || paymentEvent.InvoiceId is null || paymentEvent.TenantId is null)
            throw new ArgumentException("Stripe webhook metadata is incomplete.");

        await using var transaction = await _context.BeginTransactionAsync(cancellationToken);
        var payment = await _context.Payments.FirstOrDefaultAsync(x =>
            x.Id == paymentEvent.PaymentId.Value && x.InvoiceId == paymentEvent.InvoiceId.Value &&
            x.TenantId == paymentEvent.TenantId.Value && x.Provider == "Stripe", cancellationToken);
        if (payment == null) throw new KeyNotFoundException("Payment not found.");

        // Stripe can retry webhooks. A succeeded payment makes this handler idempotent.
        if (payment.Status == PaymentStatus.Succeeded)
        {
            await transaction.CommitAsync(cancellationToken);
            return;
        }
        if (payment.Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Payment is not pending.");
        if (!string.Equals(payment.ProviderPaymentId, paymentEvent.SessionId, StringComparison.Ordinal))
            throw new InvalidOperationException("Stripe session does not match the payment.");

        payment.Status = PaymentStatus.Succeeded;
        payment.PaidAt = DateTime.UtcNow;

        var invoice = await _context.Invoices.FirstOrDefaultAsync(x =>
            x.Id == payment.InvoiceId && x.TenantId == payment.TenantId, cancellationToken)
            ?? throw new KeyNotFoundException("Invoice not found.");

        var otherSucceeded = await _context.Payments.Where(x =>
            x.TenantId == payment.TenantId && x.InvoiceId == payment.InvoiceId &&
            x.Status == PaymentStatus.Succeeded && x.Id != payment.Id)
            .SumAsync(x => (decimal?)x.Amount, cancellationToken) ?? 0m;

        if (otherSucceeded + payment.Amount >= invoice.TotalAmount)
            invoice.Status = InvoiceStatus.Paid;

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private IQueryable<Payment> Query() => _context.Payments.AsNoTracking();

    private static System.Linq.Expressions.Expression<Func<Payment, PaymentResponse>> Map() => x => new PaymentResponse
    {
        Id = x.Id, InvoiceId = x.InvoiceId, Amount = x.Amount, Method = x.Method, Status = x.Status,
        CreatedAt = x.CreatedAt, PaidAt = x.PaidAt, Provider = x.Provider,
        ProviderPaymentId = x.ProviderPaymentId, Reference = x.Reference, Notes = x.Notes
    };

    private static PaymentResponse ToResponse(Payment x) => new()
    {
        Id = x.Id, InvoiceId = x.InvoiceId, Amount = x.Amount, Method = x.Method, Status = x.Status,
        CreatedAt = x.CreatedAt, PaidAt = x.PaidAt, Provider = x.Provider,
        ProviderPaymentId = x.ProviderPaymentId, Reference = x.Reference, Notes = x.Notes
    };
}

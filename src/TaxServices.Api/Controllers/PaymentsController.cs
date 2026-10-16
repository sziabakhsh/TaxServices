using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaxServices.Application.DTOs.Payments;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{

    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentService paymentService,
        ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }


    [HttpGet]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<PaymentResponse>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _paymentService.GetAllAsync(cancellationToken));

    [HttpGet("invoice/{invoiceId:guid}")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<IEnumerable<PaymentResponse>>> GetByInvoice(Guid invoiceId, CancellationToken cancellationToken) =>
        Ok(await _paymentService.GetByInvoiceIdAsync(invoiceId, cancellationToken));

    [HttpPost("manual")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<PaymentResponse>> RecordManual(CreateManualPaymentRequest request, CancellationToken cancellationToken)
    {
        var payment = await _paymentService.RecordManualPaymentAsync(request, cancellationToken);
        return Created($"api/payments/invoice/{payment.InvoiceId}", payment);
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<CheckoutSessionResponse>> CreateCheckout(
        CreateCheckoutSessionRequest request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        return Ok(await _paymentService.CreateCheckoutSessionAsync(request.InvoiceId, request.Amount, userId, cancellationToken));
    
    }

    [AllowAnonymous]
    [HttpPost("stripe/webhook")]
    public async Task<IActionResult> StripeWebhook(
        [FromServices] IOnlinePaymentGateway gateway,
        CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrWhiteSpace(signature))
        {
            _logger.LogWarning(
                "Stripe webhook rejected: missing signature.");

            return BadRequest();
        }

        try
        {
            var paymentEvent = gateway.ParseWebhook(json, signature);

            _logger.LogInformation(
                "Stripe webhook received. EventType: {EventType}",
                paymentEvent.EventType);

            await _paymentService.HandleOnlinePaymentEventAsync(
                paymentEvent, cancellationToken);

            _logger.LogInformation(
                "Stripe webhook processed successfully. EventType: {EventType}",
                paymentEvent.EventType);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Stripe webhook processing failed: {ex.Message}" , ex.Message);

            throw;
        }
    }


    [HttpPost("{paymentId:guid}/reconcile")]
    [Authorize(Roles = "Admin,Employee")]
    public async Task<ActionResult<PaymentResponse>> Reconcile(
        Guid paymentId,
        CancellationToken cancellationToken)
    {
        var payment = await _paymentService.ReconcileOnlinePaymentAsync(
            paymentId,
            cancellationToken);

        return Ok(payment);
    }


    [HttpGet("checkout/confirm")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<PaymentResponse>> ConfirmCheckout(
        [FromQuery(Name = "session_id")] string sessionId,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        return Ok(await _paymentService.ConfirmClientCheckoutAsync(sessionId, userId, cancellationToken));
    }

    [HttpGet("me")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<IEnumerable<PaymentResponse>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        return Ok(await _paymentService.GetMineAsync(userId, cancellationToken));
    }
}

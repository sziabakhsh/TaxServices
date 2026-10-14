using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;

namespace TaxServices.Api.Controllers;

[ApiController]
[Route("api/financial-reports")]
[Authorize(Roles = "Admin,Employee")]
public class FinancialReportsController : ControllerBase
{
    private readonly ITaxServicesDbContext _db;
    private readonly ITenantContext _tenant;
    public FinancialReportsController(ITaxServicesDbContext db, ITenantContext tenant)
    { _db = db; _tenant = tenant; }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? from, [FromQuery] DateTime? to,
        [FromQuery] Guid? clientId, CancellationToken ct)
    {
        if (from.HasValue && to.HasValue && from.Value.Date > to.Value.Date)
            return BadRequest("From date must not be after To date.");
        var tenantId = _tenant.TenantId;
        var invoicesQuery = _db.Invoices.AsNoTracking().Where(i => i.TenantId == tenantId);
        var paymentsQuery = _db.Payments.AsNoTracking().Where(p => p.TenantId == tenantId && p.Invoice.TenantId == tenantId);
        if (clientId.HasValue)
        {
            invoicesQuery = invoicesQuery.Where(i => i.ClientId == clientId.Value);
            paymentsQuery = paymentsQuery.Where(p => p.Invoice.ClientId == clientId.Value);
        }
        // Date filter: invoice issue date for invoice metrics; payment date for collections.
        if (from.HasValue)
        {
            var start = from.Value.Date;
            invoicesQuery = invoicesQuery.Where(i => i.IssueDate >= start);
            paymentsQuery = paymentsQuery.Where(p => p.PaidAt >= start);
        }
        if (to.HasValue)
        {
            var endExclusive = to.Value.Date.AddDays(1);
            invoicesQuery = invoicesQuery.Where(i => i.IssueDate < endExclusive);
            paymentsQuery = paymentsQuery.Where(p => p.PaidAt < endExclusive);
        }
        var invoices = await invoicesQuery.Select(i => new {
            i.Id, i.ClientId, ClientName = i.Client.FirstName + " " + i.Client.LastName,
            i.InvoiceNumber, i.Status, i.IssueDate, i.DueDate, i.TotalAmount
        }).ToListAsync(ct);
        var payments = await paymentsQuery.Where(p => p.Status == PaymentStatus.Succeeded)
            .Select(p => new { p.Id, p.InvoiceId, p.Amount, p.PaidAt }).ToListAsync(ct);
        var paidByInvoice = payments.GroupBy(p => p.InvoiceId)
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));
        var today = DateTime.UtcNow.Date;
        var rows = invoices.Select(i => {
            var paid = paidByInvoice.GetValueOrDefault(i.Id);
            var active = i.Status != InvoiceStatus.Draft && i.Status != InvoiceStatus.Cancelled;
            var outstanding = active ? Math.Max(0, i.TotalAmount - paid) : 0m;
            return new {
                i.Id, i.ClientId, i.ClientName, i.InvoiceNumber, i.Status, i.IssueDate, i.DueDate,
                i.TotalAmount, PaidAmount = paid, OutstandingAmount = outstanding,
                IsOverdue = outstanding > 0 && i.DueDate.Date < today
            };
        }).OrderByDescending(i => i.IssueDate).ToList();
        var months = payments.Where(p => p.PaidAt.HasValue)
            .GroupBy(p => new { p.PaidAt!.Value.Year, p.PaidAt!.Value.Month })
            .Select(g => new { Month = $"{g.Key.Year:D4}-{g.Key.Month:D2}", Amount = g.Sum(p => p.Amount) })
            .OrderBy(x => x.Month).ToList();
        return Ok(new {
            TotalInvoiced = rows.Where(r => r.Status != InvoiceStatus.Draft && r.Status != InvoiceStatus.Cancelled).Sum(r => r.TotalAmount),
            TotalCollected = payments.Sum(p => p.Amount),
            OutstandingBalance = rows.Sum(r => r.OutstandingAmount),
            OverdueBalance = rows.Where(r => r.IsOverdue).Sum(r => r.OutstandingAmount),
            PaidInvoices = rows.Count(r => r.Status == InvoiceStatus.Paid),
            Invoices = rows, MonthlyCollections = months
        });
    }
}

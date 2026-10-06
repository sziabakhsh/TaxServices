
using TaxServices.Domain.Invoices;

namespace TaxServices.Application.DTOs.Invoices
{
    public class InvoiceResponse
    {
        public Guid Id { get; set; }

        public Guid ClientId { get; set; }

        public string ClientName { get; set; } = string.Empty;

        public string ClientEmail { get; set; } = string.Empty;

        public string InvoiceNumber { get; set; } = string.Empty;

        public InvoiceStatus Status { get; set; }

        public DateTime IssueDate { get; set; }

        public DateTime DueDate { get; set; }

        public decimal TaxRate { get; set; }

        public decimal Subtotal { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public string? Notes { get; set; }

        public List<InvoiceItemResponse> Items { get; set; } = [];
    }
}

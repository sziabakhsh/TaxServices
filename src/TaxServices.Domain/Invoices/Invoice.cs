using TaxServices.Domain.Clients;
using TaxServices.Domain.Common;
using TaxServices.Domain.Payments;

namespace TaxServices.Domain.Invoices
{
    public class Invoice : Entity
    {
        public Guid ClientId { get; set; }

        public string InvoiceNumber { get; set; } = string.Empty;

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

        public DateTime IssueDate { get; set; }

        public DateTime DueDate { get; set; }

        public decimal Subtotal { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public string? Notes { get; set; }

        public decimal TaxRate { get; set; }

        public Client Client { get; set; } = null!;

        public ICollection<InvoiceItem> Items { get; set; }
            = new List<InvoiceItem>();

        public ICollection<Payment> Payments { get; set; }
            = new List<Payment>();
    }
}

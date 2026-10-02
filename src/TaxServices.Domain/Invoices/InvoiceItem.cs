
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Invoices
{
    public class InvoiceItem : Entity
    {
        public Guid InvoiceId { get; set; }

        public string Description { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Amount { get; set; }

        public Invoice Invoice { get; set; } = null!;
    }
}

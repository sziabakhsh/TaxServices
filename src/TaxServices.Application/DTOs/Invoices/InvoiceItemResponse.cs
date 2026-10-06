namespace TaxServices.Application.DTOs.Invoices
{
    public class InvoiceItemResponse
    {
        public Guid Id { get; set; }

        public Guid? ServiceId { get; set; }

        public string Description { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal Amount { get; set; }
    }
}
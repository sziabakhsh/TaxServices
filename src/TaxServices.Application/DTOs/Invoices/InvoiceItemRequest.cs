using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Invoices
{
    public class InvoiceItemRequest
    {
        public Guid? ServiceId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, 999999)]
        public decimal Quantity { get; set; }

        [Range(0, 999999999)]
        public decimal UnitPrice { get; set; }

        [Range(0, 999999999)]
        public decimal DiscountAmount { get; set; }
    }
}
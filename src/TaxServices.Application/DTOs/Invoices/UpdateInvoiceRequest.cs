
using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Invoices
{
    public class UpdateInvoiceRequest
    {
        [Required]
        public DateTime IssueDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Range(0, 100)]
        public decimal TaxRate { get; set; }

        [MaxLength(2000)]
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<InvoiceItemRequest> Items { get; set; } = [];
    }
}

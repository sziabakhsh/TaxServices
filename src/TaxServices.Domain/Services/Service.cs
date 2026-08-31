using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Services
{
    public class Service : Entity
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? BasePrice { get; set; }

        public bool IsActive { get; set; }
    }
}
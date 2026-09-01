
using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Clients
{
    public class UpdateIndividualProfileRequest { 
        [Required]
        [MaxLength(9)] 
        public string SIN { get; set; } = string.Empty; 
        public DateTime? DateOfBirth { get; set; }
        [MaxLength(500)] 
        public string Address { get; set; } = string.Empty;
    }
}

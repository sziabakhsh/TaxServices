using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Authentication
{
    public class TwoFactorCodeRequest
    {
        [Required]
        public string Code { get; set; } = string.Empty;
    }
}
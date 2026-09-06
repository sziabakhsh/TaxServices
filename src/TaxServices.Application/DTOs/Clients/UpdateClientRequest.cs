using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Clients
{
    public class UpdateClientRequest
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [MaxLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public UpdateIndividualProfileRequest? IndividualProfile { get; set; }
    }

}
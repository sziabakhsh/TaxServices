namespace TaxServices.Application.DTOs.Clients
{
    public class CreateClientRequest
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public CreateIndividualProfileRequest? IndividualProfile { get; set; }
    }
}
namespace TaxServices.Application.DTOs.Clients
{
    public class UpdateClientRequest
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public UpdateIndividualProfileRequest? IndividualProfile { get; set; }
    }

    public class UpdateIndividualProfileRequest
    {
        public string SIN { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        public string Address { get; set; } = string.Empty;
    }
}
namespace TaxServices.Application.DTOs.Clients
{
    public class CreateIndividualProfileRequest
    {
        public string SIN { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        public string Address { get; set; } = string.Empty;
    }
}

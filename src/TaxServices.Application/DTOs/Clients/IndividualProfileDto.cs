namespace TaxServices.Application.DTOs.Clients
{
    public class IndividualProfileDto
    {
        public Guid Id { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string Address { get; set; } = string.Empty;
    }
}
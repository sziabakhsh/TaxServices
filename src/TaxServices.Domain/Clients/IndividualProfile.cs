using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class IndividualProfile:Entity
    {
         public Guid ClientId { get; set; }

        public string SIN { get; set; }=string.Empty;

        public DateTime? DateOfBirth { get; set; }

        public string PhoneNumber { get; set; }=string.Empty;

        public string Address { get; set; }=   string.Empty;

        public Client Client { get; set; }
    }
}
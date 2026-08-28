using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class Business: Entity
    {
        public string LegalName { get; set; }=string.Empty;
        public string BusinessNumber { get; set; }=string.Empty;
        public string PhoneNumber { get; set; }=string.Empty;
        public string Email { get; set; }=string.Empty;
        public string Address { get; set; }=string.Empty;

        public ICollection<ClientBusinessRelationship> ClientRelationships { get; set; }
            = new List<ClientBusinessRelationship>();
    }
}

using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class ClientBusinessRelationship : Entity
    {
        public Guid ClientId { get; set; }

        public Guid BusinessId { get; set; }

        public RelationshipType RelationshipType { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public Client Client { get; set; } = null!;

        public Business Business { get; set; } = null!;
    }
}
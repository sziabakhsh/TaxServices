using TaxServices.Domain.Cases;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Clients
{
    public class Client : Entity
    {
    public string FirstName { get; set; }=string.Empty;

    public string LastName { get; set; }=string.Empty;

    public string Email { get; set; }=string.Empty;

    public string PhoneNumber { get; set; }=string.Empty;

    public bool IsActive { get; set; }

    public IndividualProfile IndividualProfile { get; set; }

    public ICollection<ClientBusinessRelationship> BusinessRelationships { get; set; }
        = new List<ClientBusinessRelationship>();

    public ICollection<TaxCase> TaxCases { get; set; }
        = new List<TaxCase>();
    }
}
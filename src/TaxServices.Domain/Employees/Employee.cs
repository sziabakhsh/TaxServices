using TaxServices.Domain.Cases;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Employees
{
    public class Employee: Entity
    {
        public string FirstName { get; set; }=string.Empty;
        public string LastName { get; set; }=string.Empty;
        public string Email { get; set; }=string.Empty;
        public string PhoneNumber { get; set; }=string.Empty;
        public string JobTitle { get; set; }=string.Empty;
        public bool IsActive { get; set; }
        public ICollection<TaxCase> TaxCases { get; set; }
            = new List<TaxCase>();
    }
}
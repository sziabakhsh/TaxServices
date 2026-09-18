
namespace TaxServices.Application.Interfaces
{
    public interface IEmployeeAccountStatusService
    {
        Task<bool?> GetActiveStatusAsync(string userId, CancellationToken cancellationToken = default);
    }
}

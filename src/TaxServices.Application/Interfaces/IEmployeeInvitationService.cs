namespace TaxServices.Application.Interfaces
{
    public interface IEmployeeInvitationService
    {
        Task SendInvitationAsync(
            string userId,
            string firstName,
            string email,
            CancellationToken cancellationToken = default);
    }
}
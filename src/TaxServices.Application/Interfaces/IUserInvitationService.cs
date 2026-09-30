namespace TaxServices.Application.Interfaces
{
    public interface IUserInvitationService
    {
        Task SendInvitationAsync(
            string userId,
            string firstName,
            string email,
            CancellationToken cancellationToken = default);
    }
}
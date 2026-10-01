namespace TaxServices.Application.Interfaces;

public interface IAccountEmailService
{
    Task SendInvitationAsync(string firstName, string email, string token, CancellationToken cancellationToken = default);

    Task SendPasswordResetAsync(string email, string token, CancellationToken cancellationToken = default);
}
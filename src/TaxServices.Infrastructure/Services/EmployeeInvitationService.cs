using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;

namespace TaxServices.Infrastructure.Services
{
    public class EmployeeInvitationService : IEmployeeInvitationService
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;
        private readonly FrontendOptions _frontendOptions;

        public EmployeeInvitationService(
            IAuthService authService,
            IEmailService emailService,
            IOptions<FrontendOptions> frontendOptions)
        {
            _authService = authService;
            _emailService = emailService;
            _frontendOptions = frontendOptions.Value;
        }

        public async Task SendInvitationAsync(
            string userId,
            string firstName,
            string email,
            CancellationToken cancellationToken = default)
        {
            var passwordSetupToken =
                await _authService.GeneratePasswordSetupTokenAsync(
                    userId,
                    cancellationToken);


            var encodedEmail = WebUtility.UrlEncode(email);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(passwordSetupToken));

            var setupUrl =
                $"{_frontendOptions.BaseUrl.TrimEnd('/')}/set-password" +
                $"?email={encodedEmail}&token={encodedToken}";

            var emailBody = $"""
                <h2>Welcome to Amazing Accountant and Tax Services</h2>

                <p>Hello {WebUtility.HtmlEncode(firstName)},</p>

                <p>Your employee account has been created.</p>

                <p>Please use the link below to set your password:</p>

                <p>
                    <a href="{setupUrl}">Set your password</a>
                </p>

                <p>If you did not expect this email, please contact us.</p>
                """;

            await _emailService.SendAsync(
                email,
                "Set up your password",
                emailBody,
                cancellationToken);
        }
    }
}
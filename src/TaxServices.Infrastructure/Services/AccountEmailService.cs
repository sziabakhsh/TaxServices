using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;

namespace TaxServices.Infrastructure.Services
{
    public class AccountEmailService : IAccountEmailService
    {
        private readonly IEmailService _emailService;
        private readonly FrontendOptions _frontendOptions;

        public AccountEmailService(
            IEmailService emailService,
            IOptions<FrontendOptions> frontendOptions)
        {
            _emailService = emailService;
            _frontendOptions = frontendOptions.Value;
        }

        public async Task SendInvitationAsync(
            string firstName,
            string email,
            string token,
            CancellationToken cancellationToken = default)
        {
            var encodedEmail =
                WebUtility.UrlEncode(email);

            var encodedToken =
                WebEncoders.Base64UrlEncode(
                    Encoding.UTF8.GetBytes(token));

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

        public async Task SendPasswordResetAsync(
            string email,
            string token,
            CancellationToken cancellationToken = default)
        {
            var encodedEmail =
                WebUtility.UrlEncode(email);

            var encodedToken =
                WebEncoders.Base64UrlEncode(
                    Encoding.UTF8.GetBytes(token));

            var resetUrl =
                $"{_frontendOptions.BaseUrl.TrimEnd('/')}/reset-password" +
                $"?email={encodedEmail}&token={encodedToken}";

            var emailBody = $"""
                <h2>Reset Your Password</h2>

                <p>We received a request to reset your password.</p>

                <p>
                    <a href="{resetUrl}">Reset your password</a>
                </p>

                <p>
                    If you did not request a password reset,
                    you can ignore this email.
                </p>
                """;

            await _emailService.SendAsync(
                email,
                "Reset your password",
                emailBody,
                cancellationToken);
        }
    }
}
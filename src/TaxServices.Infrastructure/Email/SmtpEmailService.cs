using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using TaxServices.Application.Interfaces;

namespace TaxServices.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;

    public SmtpEmailService(IOptions<EmailOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        var message = new MimeMessage();

        message.From.Add(
            new MailboxAddress(
                _options.FromName,
                _options.FromEmail));

        message.To.Add(MailboxAddress.Parse(to));

        message.Subject = subject;

        message.Body = new TextPart("html")
        {
            Text = htmlBody
        };

        using var client = new SmtpClient();

        await client.ConnectAsync(
            _options.Host,
            _options.Port,
            SecureSocketOptions.StartTls,
            cancellationToken);

        await client.AuthenticateAsync(
            _options.Username,
            _options.Password,
            cancellationToken);

        await client.SendAsync(
            message,
            cancellationToken);

        await client.DisconnectAsync(
            true,
            cancellationToken);
    }
}
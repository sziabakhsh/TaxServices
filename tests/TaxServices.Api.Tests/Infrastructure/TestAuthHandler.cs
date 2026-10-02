using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace TaxServices.Api.Tests.Infrastructure;

/// <summary>
/// A test authentication handler that allows for simulating authenticated users in integration tests.
/// </summary>
public class TestAuthHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userId = Request.Headers["X-Test-UserId"].FirstOrDefault();

        var tenantId = Request.Headers["X-Test-TenantId"].FirstOrDefault();

        var role = Request.Headers["X-Test-Role"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            string.IsNullOrWhiteSpace(role))
        {
            return Task.FromResult(
                AuthenticateResult.NoResult());
        }

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                userId),

            new Claim(
                "tenant_id",
                tenantId),

            new Claim(
                ClaimTypes.Role,
                role)
        };

        var identity = new ClaimsIdentity(
            claims,
            SchemeName);

        var principal =
            new ClaimsPrincipal(identity);

        var ticket = new AuthenticationTicket(
            principal,
            SchemeName);

        return Task.FromResult(
            AuthenticateResult.Success(ticket));
    }
}
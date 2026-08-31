using System.Net;
using System.Net.Http.Json;
using TaxServices.Api.Tests.Infrastructure;

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using TaxServices.Infrastructure.Identity;

namespace TaxServices.Api.Tests.Controllers;

public class AuthControllerTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_Should_Create_User()
    {
        var client = _factory.CreateClient();

        var request = new
        {
            email = "test@example.com",
            password = "Test@1234",
            firstName = "Test",
            lastName = "User"
        };

        var response = await client.PostAsJsonAsync(
            "/api/Auth/register",
            request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = _factory.Services.CreateScope();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<AppUser>>();

        var user = await userManager.FindByEmailAsync(request.email);

        Assert.NotNull(user);
        Assert.Equal(request.email, user.Email);
    }
}
using System.Net;
using TaxServices.Infrastructure;
using TaxServices.Api.Tests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace TaxServices.Api.Tests;

public class ApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public void Api_Should_Start()
    {
        var client = _factory.CreateClient();

        Assert.NotNull(client);
    }

    [Fact]
    public async Task Api_Should_Return_NotFound_For_Unknown_Endpoint()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/this-endpoint-does-not-exist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
public async Task Test_Database_Should_Be_Available()
{
    using var scope = _factory.Services.CreateScope();

    var dbContext = scope.ServiceProvider
        .GetRequiredService<TaxServicesDbContext>();

    var canConnect = await dbContext.Database.CanConnectAsync();

    Assert.True(canConnect);
}
}
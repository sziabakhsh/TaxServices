using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure;

namespace TaxServices.Api.Tests.Infrastructure;

public class SignatureWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TaxServicesDbContext>();

            services.RemoveAll<
                DbContextOptions<TaxServicesDbContext>>();

            _connection = new SqliteConnection(
                "DataSource=:memory:");

            _connection.Open();

            services.AddDbContext<TaxServicesDbContext>(
                options =>
                {
                    options.UseSqlite(_connection);
                });

            services.RemoveAll<IDocumentService>();

            services.AddScoped<
                IDocumentService,
                TestDocumentService>();

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme =
                        TestAuthHandler.SchemeName;

                    options.DefaultChallengeScheme =
                        TestAuthHandler.SchemeName;
                })
                .AddScheme<
                    AuthenticationSchemeOptions,
                    TestAuthHandler>(
                    TestAuthHandler.SchemeName,
                    _ =>
                    {
                    });

            var serviceProvider =
                services.BuildServiceProvider();

            using var scope =
                serviceProvider.CreateScope();

            var dbContext =
                scope.ServiceProvider
                    .GetRequiredService<
                        TaxServicesDbContext>();

            dbContext.Database.EnsureCreated();
        });
    }

    protected override void Dispose(
        bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection?.Dispose();
        }
    }
}
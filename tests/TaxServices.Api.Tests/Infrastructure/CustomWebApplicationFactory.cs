using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TaxServices.Infrastructure;

namespace TaxServices.Api.Tests.Infrastructure;

public class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the application's SQL Server DbContext registration
            services.RemoveAll<TaxServicesDbContext>();
            services.RemoveAll<DbContextOptions<TaxServicesDbContext>>();

            // Create and keep the SQLite in-memory connection open
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            // Register DbContext using SQLite
            services.AddDbContext<TaxServicesDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            // Build the service provider and create the database schema
            var serviceProvider = services.BuildServiceProvider();

            using var scope = serviceProvider.CreateScope();

            var dbContext = scope.ServiceProvider
                .GetRequiredService<TaxServicesDbContext>();

            dbContext.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection?.Dispose();
        }
    }
}
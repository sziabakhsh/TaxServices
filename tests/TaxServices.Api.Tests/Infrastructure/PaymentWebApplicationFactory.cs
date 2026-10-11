using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TaxServices.Infrastructure;

namespace TaxServices.Api.Tests.Infrastructure
{
    public class PaymentWebApplicationFactory
        : WebApplicationFactory<Program>
    {
        private SqliteConnection? _connection;

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<TaxServicesDbContext>();
                services.RemoveAll<DbContextOptions<TaxServicesDbContext>>();

                _connection = new SqliteConnection("DataSource=:memory:");
                _connection.Open();

                services.AddDbContext<TaxServicesDbContext>(options =>
                    options.UseSqlite(_connection));

                using var provider = services.BuildServiceProvider();
                using var scope = provider.CreateScope();

                var db = scope.ServiceProvider
                    .GetRequiredService<TaxServicesDbContext>();

                db.Database.EnsureCreated();
            });
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);

            if (disposing)
                _connection?.Dispose();
        }
    }

}

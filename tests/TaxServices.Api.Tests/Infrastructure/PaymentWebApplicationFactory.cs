using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure;

namespace TaxServices.Api.Tests.Infrastructure;

public class PaymentWebApplicationFactory
    : WebApplicationFactory<Program>
{
    public bool EnablePaymentReconciliationWorker { get; set; }
    public FakeOnlinePaymentGateway? SharedPaymentGateway { get; set; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var connectionString = Environment.GetEnvironmentVariable(
            "TAXSERVICES_PAYMENT_TEST_CONNECTION");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "TAXSERVICES_PAYMENT_TEST_CONNECTION is not configured.");
        }

        var sqlBuilder = new SqlConnectionStringBuilder(connectionString);

        if (!string.Equals(
                sqlBuilder.InitialCatalog,
                "TaxServices_PaymentTests",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Payment tests must use TaxServices_PaymentTests.");
        }

        builder.ConfigureServices(services =>
        {
            
            services.RemoveAll<IOnlinePaymentGateway>();

            if (SharedPaymentGateway is not null)
            {
                services.AddSingleton<IOnlinePaymentGateway>(
                    SharedPaymentGateway);
            }
            else
            {
                services.AddSingleton<
                    IOnlinePaymentGateway,
                    FakeOnlinePaymentGateway>();
            }

            // Disable background workers during tests.
            // Disable notification worker in all tests.
            // Enable payment reconciliation worker only when explicitly requested.
            var hostedServices = services
                .Where(descriptor =>
                    descriptor.ServiceType == typeof(IHostedService) &&
                    (
                        descriptor.ImplementationType?.Name ==
                            "NotificationBackgroundWorker"
                        ||
                        (
                            !EnablePaymentReconciliationWorker &&
                            descriptor.ImplementationType?.Name ==
                                "PaymentReconciliationBackgroundWorker"
                        )
                    ))
                .ToList();

            foreach (var descriptor in hostedServices)
            {
                services.Remove(descriptor);
            }


            // Start of temp lines

            var paymentWorkerRegistered = services.Any(descriptor =>
    descriptor.ServiceType == typeof(IHostedService) &&
    descriptor.ImplementationType?.Name ==
        "PaymentReconciliationBackgroundWorker");

            if (EnablePaymentReconciliationWorker && !paymentWorkerRegistered)
            {
                throw new InvalidOperationException(
                    "TEST ERROR: PaymentReconciliationBackgroundWorker is NOT registered.");
            }

            // End of temp lines
            services.RemoveAll<IOnlinePaymentGateway>();
            services.AddSingleton<IOnlinePaymentGateway, FakeOnlinePaymentGateway>();

            // Use test authentication.
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme =
                    TestAuthHandler.SchemeName;

                options.DefaultChallengeScheme =
                    TestAuthHandler.SchemeName;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                TestAuthHandler.SchemeName,
                _ => { });
        });
    }
}
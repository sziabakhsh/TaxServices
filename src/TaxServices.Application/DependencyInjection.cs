using Microsoft.Extensions.DependencyInjection;
using TaxServices.Api.Services;
using TaxServices.Application.Interfaces;
using TaxServices.Application.Services;
namespace TaxServices.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {

        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<IClientService, ClientService>();

        return services;
    }
}

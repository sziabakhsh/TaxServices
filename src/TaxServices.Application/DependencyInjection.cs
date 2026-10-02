using Microsoft.Extensions.DependencyInjection;
using TaxServices.Api.Services;
using TaxServices.Application.Configuration;
using TaxServices.Application.Interfaces;
using TaxServices.Application.Services;
namespace TaxServices.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {

        

        services.AddScoped<FileUploadValidator>();
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IServiceService, ServiceService>();
        services.AddScoped<ITaxCaseService, TaxCaseService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IDocumentSignatureService, DocumentSignatureService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IInvoiceService, InvoiceService>();

        return services;
    }
}

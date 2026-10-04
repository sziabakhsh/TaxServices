using Microsoft.AspNetCore.Identity;
using TaxServices.Api.Exceptions;
using TaxServices.Application;
using TaxServices.Infrastructure;
using TaxServices.Infrastructure.Configuration;
using TaxServices.Infrastructure.Identity;

var builder = WebApplication.CreateBuilder(args);

var runtimeWebhookSecret =
    builder.Configuration["Stripe:WebhookSecret"];

Console.WriteLine(
    $"Stripe WebhookSecret loaded: {!string.IsNullOrWhiteSpace(runtimeWebhookSecret)}");

Console.WriteLine(
    $"Stripe WebhookSecret ending: {(runtimeWebhookSecret?.Length >= 6
        ? runtimeWebhookSecret[^6..]
        : "INVALID")}");

var configRoot = (IConfigurationRoot)builder.Configuration;

foreach (var provider in configRoot.Providers)
{
    if (provider.TryGet("Stripe:WebhookSecret", out var value) &&
        !string.IsNullOrWhiteSpace(value))
    {
        Console.WriteLine(
            $"Stripe WebhookSecret provider: {provider}");
    }
}

// ---------------------------------------------------------
// CORS
// ---------------------------------------------------------

var allowedOrigins =
    builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services.AddHttpContextAccessor();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

builder.Services.AddControllers();

// ---------------------------------------------------------
// Exception Handling
// ---------------------------------------------------------

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ---------------------------------------------------------
// Swagger / OpenAPI
// ---------------------------------------------------------

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Enter your JWT token."
        });

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models.ReferenceType
                                    .SecurityScheme,

                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

var app = builder.Build();

// ---------------------------------------------------------
// Identity Seed
// ---------------------------------------------------------

using (var scope = app.Services.CreateScope())
{
    var roleManager =
        scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

    // Roles are required in all environments
    await IdentitySeeder.SeedRolesAsync(roleManager);

    // Development admin only
    if (app.Environment.IsDevelopment())
    {
        var userManager =
            scope.ServiceProvider
                .GetRequiredService<UserManager<AppUser>>();

        var dbContext =
            scope.ServiceProvider
                .GetRequiredService<TaxServicesDbContext>();

        var publicSiteOptions =
            scope.ServiceProvider
                .GetRequiredService<
                    Microsoft.Extensions.Options.IOptions<PublicSiteOptions>>();

        var tenantId = publicSiteOptions.Value.TenantId;

        await IdentitySeeder.SeedDevelopmentAdminAsync(
            userManager,
            dbContext,
            tenantId);
    }
}

// ---------------------------------------------------------
// Exception Handler
// ---------------------------------------------------------

app.UseExceptionHandler();

// ---------------------------------------------------------
// HTTP Pipeline
// ---------------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // In production, tell browsers to use HTTPS
    // for future requests.
    app.UseHsts();
}

app.UseHttpsRedirection();

// ---------------------------------------------------------
// Security Headers
// ---------------------------------------------------------

app.Use(async (context, next) =>
{
    // Prevent browsers from MIME-sniffing responses.
    context.Response.Headers["X-Content-Type-Options"] =
        "nosniff";

    // Prevent this application from being embedded
    // inside an iframe.
    context.Response.Headers["X-Frame-Options"] =
        "DENY";

    // Limit referrer information sent to other origins.
    context.Response.Headers["Referrer-Policy"] =
        "strict-origin-when-cross-origin";

    // Disable browser features that this application
    // does not currently need.
    context.Response.Headers["Permissions-Policy"] =
        "camera=(), microphone=(), geolocation=()";

    await next();
});

// ---------------------------------------------------------
// CORS
// ---------------------------------------------------------

app.UseCors("Frontend");

// ---------------------------------------------------------
// Authentication / Authorization
// ---------------------------------------------------------

app.UseAuthentication();
app.UseAuthorization();

// ---------------------------------------------------------
// Endpoints
// ---------------------------------------------------------

app.MapControllers();

app.Run();

public partial class Program
{
}
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaxServices.Application.Configuration;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;
using TaxServices.Infrastructure.Email;
using TaxServices.Infrastructure.Identity;
using TaxServices.Infrastructure.Identity.Services;
using TaxServices.Infrastructure.Persistence;
using TaxServices.Infrastructure.Security;
using TaxServices.Infrastructure.Services;
using TaxServices.Infrastructure.Storage;
using TaxServices.Infrastructure.Payments;

namespace TaxServices.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Database
            services.AddDbContext<TaxServicesDbContext>(options =>
            {
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"));
            });

            // ASP.NET Core Identity
            services
                .AddIdentityCore<AppUser>(options =>
                {
                    options.Password.RequiredLength = 8;
                    options.Password.RequireDigit = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireNonAlphanumeric = true;
                })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<TaxServicesDbContext>()
                .AddDefaultTokenProviders();

            // JWT Options
            services.Configure<JwtOptions>(
                configuration.GetSection(JwtOptions.SectionName));

            // Azure Storage Options
            services.Configure<AzureStorageOptions>(
                configuration.GetSection(AzureStorageOptions.SectionName));

            // JWT Configuration
            var jwtOptions = configuration
                .GetSection(JwtOptions.SectionName)
                .Get<JwtOptions>()
                ?? throw new InvalidOperationException(
                    "JWT configuration is missing.");

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme =
                        JwtBearerDefaults.AuthenticationScheme;

                    options.DefaultChallengeScheme =
                        JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters =
                        new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,

                            ValidIssuer = jwtOptions.Issuer,
                            ValidAudience = jwtOptions.Audience,

                            IssuerSigningKey =
                                new SymmetricSecurityKey(
                                    Encoding.UTF8.GetBytes(
                                        jwtOptions.SecretKey))
                        };
                });

            services.Configure<SensitiveDataOptions>(configuration.GetSection(SensitiveDataOptions.SectionName));

            services.Configure<FileEncryptionOptions>(configuration.GetSection(FileEncryptionOptions.SectionName));

            services.Configure<PublicSiteOptions>(configuration.GetSection(PublicSiteOptions.SectionName));

            services.AddDataProtection();

            services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));

            services.Configure<FrontendOptions>(configuration.GetSection(FrontendOptions.SectionName));

            services.Configure<FileUploadOptions>(configuration.GetSection(FileUploadOptions.SectionName));
            services.Configure<StripeOptions>(configuration.GetSection(StripeOptions.SectionName));

            // Services
            services.AddScoped<ITaxServicesDbContext, TaxServicesDbContext>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IFileStorageService, AzureBlobStorageService>();
            services.AddScoped<IEmployeeService, EmployeeService>();
            services.AddScoped<IEmployeeAccountStatusService, EmployeeAccountStatusService>();
            services.AddScoped<IEmailService, SmtpEmailService>();
            services.AddScoped<IAccountEmailService, AccountEmailService>();
            services.AddScoped<IFileEncryptionService, FileEncryptionService>();
            services.AddScoped<ISensitiveDataProtector, SensitiveDataProtector>();
            services.AddScoped<IOnlinePaymentGateway, StripePaymentGateway>();

            return services;
        }
    }
}

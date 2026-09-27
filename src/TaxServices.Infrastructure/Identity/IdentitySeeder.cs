using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaxServices.Domain.Employees;
using TaxServices.Infrastructure.Persistence;

namespace TaxServices.Infrastructure.Identity
{
    public static class IdentitySeeder
    {
        public static async Task SeedRolesAsync(
            RoleManager<IdentityRole> roleManager)
        {
            string[] roles =
            {
                "Admin",
                "Employee",
                "Client"
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(
                        new IdentityRole(role));
                }
            }
        }

        public static async Task SeedDevelopmentAdminAsync(
            UserManager<AppUser> userManager,
            TaxServicesDbContext dbContext)
        {
            const string email = "h.ziabakhsh@gmail.com";
            const string password = "Aa@12345";

            var existingUser = await userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                return;
            }

            var tenantId = Guid.NewGuid();

            var user = new AppUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,

                FirstName = "System",
                LastName = "Admin",

                TenantId = tenantId
            };

            var createResult =
                await userManager.CreateAsync(
                    user,
                    password);

            if (!createResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    createResult.Errors.Select(
                        e => e.Description));

                throw new InvalidOperationException(
                    $"Failed to create development admin: {errors}");
            }

            var roleResult =
                await userManager.AddToRoleAsync(
                    user,
                    "Admin");

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    roleResult.Errors.Select(
                        e => e.Description));

                throw new InvalidOperationException(
                    $"Failed to assign Admin role: {errors}");
            }

            var employeeExists =
                await dbContext.Employees.AnyAsync(
                    e =>
                        e.TenantId == tenantId &&
                        e.UserId == user.Id);

            if (!employeeExists)
            {
                var employee = new Employee
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,

                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = email,

                    PhoneNumber = string.Empty,
                    JobTitle = "Administrator",

                    IsActive = true,
                    UserId = user.Id
                };

                await dbContext.Employees.AddAsync(employee);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
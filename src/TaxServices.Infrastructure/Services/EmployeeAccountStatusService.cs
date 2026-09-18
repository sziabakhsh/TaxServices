using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Interfaces;

public class EmployeeAccountStatusService
    : IEmployeeAccountStatusService
{
    private readonly ITaxServicesDbContext _context;

    public EmployeeAccountStatusService(
        ITaxServicesDbContext context)
    {
        _context = context;
    }

    public async Task<bool?> GetActiveStatusAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => (bool?)e.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
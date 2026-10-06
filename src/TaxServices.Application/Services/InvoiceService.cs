using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Invoices;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Invoices;

namespace TaxServices.Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        public InvoiceService(
            ITaxServicesDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<IEnumerable<InvoiceResponse>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.Invoices
                .AsNoTracking()
                .Where(x => x.TenantId == tenantId)
                .OrderByDescending(x => x.IssueDate)
                .Select(x => new InvoiceResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client =>
                        client.FirstName + " " + client.LastName)
                    .FirstOrDefault() ?? string.Empty,

                                    ClientEmail = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client => client.Email)
                    .FirstOrDefault() ?? string.Empty,
                    InvoiceNumber = x.InvoiceNumber,
                    Status = x.Status,
                    IssueDate = x.IssueDate,
                    DueDate = x.DueDate,
                    TaxRate = x.TaxRate,
                    Subtotal = x.Subtotal,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    Notes = x.Notes,

                    Items = x.Items
                    .Select(item => new InvoiceItemResponse
                    {
                        Id = item.Id,
                        ServiceId = item.ServiceId,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        DiscountAmount = item.DiscountAmount,
                        Amount = item.Amount
                    })
                    .ToList()
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<InvoiceResponse?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.Invoices
                .AsNoTracking()
                .Where(x =>
                    x.Id == id &&
                    x.TenantId == tenantId)
                .Select(x => new InvoiceResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client =>
                        client.FirstName + " " + client.LastName)
                    .FirstOrDefault() ?? string.Empty,

                                    ClientEmail = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client => client.Email)
                    .FirstOrDefault() ?? string.Empty,
                    InvoiceNumber = x.InvoiceNumber,
                    Status = x.Status,
                    IssueDate = x.IssueDate,
                    DueDate = x.DueDate,
                    TaxRate = x.TaxRate,
                    Subtotal = x.Subtotal,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    Notes = x.Notes,

                    Items = x.Items
                    .Select(item => new InvoiceItemResponse
                    {
                        Id = item.Id,
                        ServiceId = item.ServiceId,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        DiscountAmount = item.DiscountAmount,
                        Amount = item.Amount
                    })
    .ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IEnumerable<InvoiceResponse>> GetByClientIdAsync(
            Guid clientId,
            CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            return await _context.Invoices
                .AsNoTracking()
                .Where(x =>
                    x.ClientId == clientId &&
                    x.TenantId == tenantId)
                .OrderByDescending(x => x.IssueDate)
                .Select(x => new InvoiceResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client =>
                        client.FirstName + " " + client.LastName)
                    .FirstOrDefault() ?? string.Empty,

                                    ClientEmail = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client => client.Email)
                    .FirstOrDefault() ?? string.Empty,
                    InvoiceNumber = x.InvoiceNumber,
                    Status = x.Status,
                    IssueDate = x.IssueDate,
                    DueDate = x.DueDate,
                    TaxRate = x.TaxRate,
                    Subtotal = x.Subtotal,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    Notes = x.Notes,

                    Items = x.Items
                    .Select(item => new InvoiceItemResponse
                    {
                        Id = item.Id,
                        ServiceId = item.ServiceId,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        DiscountAmount = item.DiscountAmount,
                        Amount = item.Amount
                    })
                    .ToList()
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<InvoiceResponse> CreateAsync(
            CreateInvoiceRequest request,
            CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var clientExists = await _context.Clients
                .AnyAsync(
                    x =>
                        x.Id == request.ClientId &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (!clientExists)
                throw new KeyNotFoundException("Client not found.");

            ValidateDates(request.IssueDate, request.DueDate);

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ClientId = request.ClientId,
                InvoiceNumber = await GenerateInvoiceNumberAsync(
                    tenantId,
                    cancellationToken),
                Status = InvoiceStatus.Draft,
                IssueDate = request.IssueDate,
                DueDate = request.DueDate,
                TaxRate = request.TaxRate,
                Notes = request.Notes
            };
            
            foreach (var requestItem in request.Items)
            {
                await ValidateServiceAsync(
                    requestItem.ServiceId,
                    tenantId,
                    cancellationToken);

                var grossAmount = RoundMoney(
                    requestItem.Quantity * requestItem.UnitPrice);

                ValidateDiscount(
                    requestItem.DiscountAmount,
                    grossAmount);

                var amount = RoundMoney(
                    grossAmount - requestItem.DiscountAmount);

                invoice.Items.Add(new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ServiceId = requestItem.ServiceId,
                    Description = requestItem.Description.Trim(),
                    Quantity = requestItem.Quantity,
                    UnitPrice = requestItem.UnitPrice,
                    DiscountAmount = requestItem.DiscountAmount,
                    Amount = amount
                });
            }

            CalculateTotals(invoice);

            _context.Invoices.Add(invoice);

            await _context.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(
                       invoice.Id,
                       cancellationToken)
                   ?? throw new InvalidOperationException(
                       "Unable to load the created invoice.");
        }

        public async Task<InvoiceResponse> UpdateAsync(
            Guid id,
            UpdateInvoiceRequest request,
            CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var invoice = await _context.Invoices
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (invoice == null)
                throw new KeyNotFoundException("Invoice not found.");

            if (invoice.Status != InvoiceStatus.Draft)
            {
                throw new InvalidOperationException(
                    "Only draft invoices can be updated.");
            }

            ValidateDates(
                request.IssueDate,
                request.DueDate);

            invoice.IssueDate = request.IssueDate;
            invoice.DueDate = request.DueDate;
            invoice.TaxRate = request.TaxRate;
            invoice.Notes = request.Notes;

            var existingItems = await _context.InvoiceItems
                .Where(x =>
                    x.InvoiceId == invoice.Id &&
                    x.TenantId == tenantId)
                .ToListAsync(cancellationToken);

            _context.InvoiceItems.RemoveRange(existingItems);

            var newItems = new List<InvoiceItem>();

            foreach (var requestItem in request.Items)
            {
                await ValidateServiceAsync(
                    requestItem.ServiceId,
                    tenantId,
                    cancellationToken);

                var grossAmount = RoundMoney(
                    requestItem.Quantity * requestItem.UnitPrice);

                ValidateDiscount(
                    requestItem.DiscountAmount,
                    grossAmount);

                var amount = RoundMoney(
                    grossAmount - requestItem.DiscountAmount);

                var item = new InvoiceItem
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    InvoiceId = invoice.Id,
                    ServiceId = requestItem.ServiceId,
                    Description = requestItem.Description.Trim(),
                    Quantity = requestItem.Quantity,
                    UnitPrice = requestItem.UnitPrice,
                    DiscountAmount = requestItem.DiscountAmount,
                    Amount = amount
                };

                newItems.Add(item);
            }

            invoice.Subtotal = RoundMoney(
                newItems.Sum(x => x.Amount));

            invoice.TaxAmount = RoundMoney(
                invoice.Subtotal *
                invoice.TaxRate / 100m);

            invoice.TotalAmount = RoundMoney(
                invoice.Subtotal +
                invoice.TaxAmount);

            _context.InvoiceItems.AddRange(newItems);

            await _context.SaveChangesAsync(
                cancellationToken);

            return await GetByIdAsync(
                       invoice.Id,
                       cancellationToken)
                   ?? throw new InvalidOperationException(
                       "Unable to load the updated invoice.");
        }

        public async Task<InvoiceResponse> IssueAsync(
    Guid id,
    CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var invoice = await _context.Invoices
                .Include(x => x.Items)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (invoice == null)
                throw new KeyNotFoundException("Invoice not found.");

            if (invoice.Status != InvoiceStatus.Draft)
            {
                throw new InvalidOperationException(
                    "Only draft invoices can be issued.");
            }

            if (invoice.Items.Count == 0)
            {
                throw new InvalidOperationException(
                    "An invoice must contain at least one item before it can be issued.");
            }

            if (invoice.TotalAmount < 0)
            {
                throw new InvalidOperationException(
                    "Invoice total cannot be negative.");
            }

            invoice.Status = InvoiceStatus.Issued;

            await _context.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(
                       invoice.Id,
                       cancellationToken)
                   ?? throw new InvalidOperationException(
                       "Unable to load the issued invoice.");
        }

        public async Task<InvoiceResponse> CancelAsync(
    Guid id,
    CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var invoice = await _context.Invoices
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == id &&
                        x.TenantId == tenantId,
                    cancellationToken);

            if (invoice == null)
                throw new KeyNotFoundException("Invoice not found.");

            if (invoice.Status != InvoiceStatus.Draft &&
                invoice.Status != InvoiceStatus.Issued)
            {
                throw new InvalidOperationException(
                    "Only draft or issued invoices can be cancelled.");
            }

            invoice.Status = InvoiceStatus.Cancelled;

            await _context.SaveChangesAsync(cancellationToken);

            return await GetByIdAsync(
                       invoice.Id,
                       cancellationToken)
                   ?? throw new InvalidOperationException(
                       "Unable to load the cancelled invoice.");
        }

        private static void ValidateDiscount(
            decimal discountAmount,
            decimal grossAmount)
        {
            if (discountAmount < 0)
            {
                throw new ArgumentException(
                    "Discount amount cannot be negative.");
            }

            if (discountAmount > grossAmount)
            {
                throw new ArgumentException(
                    "Discount amount cannot exceed the item amount.");
            }
        }

        private async Task ValidateServiceAsync(
            Guid? serviceId,
            Guid tenantId,
            CancellationToken cancellationToken)
        {
            if (!serviceId.HasValue)
                return;

            var serviceExists = await _context.Services
                .AsNoTracking()
                .AnyAsync(
                    x =>
                        x.Id == serviceId.Value &&
                        x.TenantId == tenantId &&
                        x.IsActive,
                    cancellationToken);

            if (!serviceExists)
            {
                throw new ArgumentException(
                    "The selected service is invalid or inactive.");
            }
        }

        private static void ValidateDates(
            DateTime issueDate,
            DateTime dueDate)
        {
            if (dueDate.Date < issueDate.Date)
            {
                throw new ArgumentException(
                    "Due date cannot be before issue date.");
            }
        }

        public async Task<IEnumerable<InvoiceResponse>> GetMineAsync(
    string userId,
    CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var clientId = await _context.Clients
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    x.TenantId == tenantId)
                .Select(x => (Guid?)x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (clientId == null)
                return [];

            return await _context.Invoices
                .AsNoTracking()
                .Where(x =>
                    x.ClientId == clientId.Value &&
                    x.TenantId == tenantId &&
                    x.Status != InvoiceStatus.Draft)
                .OrderByDescending(x => x.IssueDate)
                .Select(x => new InvoiceResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client =>
                        client.FirstName + " " + client.LastName)
                    .FirstOrDefault() ?? string.Empty,

                     ClientEmail = _context.Clients
                    .Where(client =>
                        client.Id == x.ClientId &&
                        client.TenantId == tenantId)
                    .Select(client => client.Email)
                    .FirstOrDefault() ?? string.Empty,
                    InvoiceNumber = x.InvoiceNumber,
                    Status = x.Status,
                    IssueDate = x.IssueDate,
                    DueDate = x.DueDate,
                    TaxRate = x.TaxRate,
                    Subtotal = x.Subtotal,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    Notes = x.Notes,

                    Items = x.Items
                    .Select(item => new InvoiceItemResponse
                    {
                        Id = item.Id,
                        ServiceId = item.ServiceId,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        DiscountAmount = item.DiscountAmount,
                        Amount = item.Amount
                    })
                    .ToList()
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<InvoiceResponse?> GetMineByIdAsync(
    string userId,
    Guid id,
    CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var clientId = await _context.Clients
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    x.TenantId == tenantId)
                .Select(x => (Guid?)x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (clientId == null)
                return null;

            return await _context.Invoices
                .AsNoTracking()
                .Where(x =>
                    x.Id == id &&
                    x.ClientId == clientId.Value &&
                    x.TenantId == tenantId &&
                    x.Status != InvoiceStatus.Draft)
                .Select(x => new InvoiceResponse
                {
                    Id = x.Id,
                    ClientId = x.ClientId,
                    ClientName = _context.Clients
                        .Where(client => client.Id == x.ClientId && client.TenantId == tenantId)
                        .Select(client => client.FirstName + " " + client.LastName)
                        .FirstOrDefault() ?? string.Empty,
                    ClientEmail = _context.Clients
                        .Where(client => client.Id == x.ClientId && client.TenantId == tenantId)
                        .Select(client => client.Email)
                        .FirstOrDefault() ?? string.Empty,
                    InvoiceNumber = x.InvoiceNumber,
                    Status = x.Status,
                    IssueDate = x.IssueDate,
                    DueDate = x.DueDate,
                    TaxRate = x.TaxRate,
                    Subtotal = x.Subtotal,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    Notes = x.Notes,

                    Items = x.Items
                    .Select(item => new InvoiceItemResponse
                    {
                        Id = item.Id,
                        ServiceId = item.ServiceId,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        DiscountAmount = item.DiscountAmount,
                        Amount = item.Amount
                    })
                    .ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);
        }

        private static void CalculateTotals(Invoice invoice)
        {
            invoice.Subtotal = RoundMoney(
                invoice.Items.Sum(x => x.Amount));

            invoice.TaxAmount = RoundMoney(
                invoice.Subtotal * invoice.TaxRate / 100m);

            invoice.TotalAmount = RoundMoney(
                invoice.Subtotal + invoice.TaxAmount);
        }

        private static decimal RoundMoney(decimal amount)
        {
            return Math.Round(
                amount,
                2,
                MidpointRounding.AwayFromZero);
        }

        private async Task<string> GenerateInvoiceNumberAsync(
            Guid tenantId,
            CancellationToken cancellationToken)
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"INV-{year}-";

            var lastInvoiceNumber = await _context.Invoices
                .AsNoTracking()
                .Where(x =>
                    x.TenantId == tenantId &&
                    x.InvoiceNumber.StartsWith(prefix))
                .OrderByDescending(x => x.InvoiceNumber)
                .Select(x => x.InvoiceNumber)
                .FirstOrDefaultAsync(cancellationToken);

            var nextNumber = 1;

            if (!string.IsNullOrWhiteSpace(lastInvoiceNumber))
            {
                var numberPart =
                    lastInvoiceNumber.Substring(prefix.Length);

                if (int.TryParse(numberPart, out var currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }

            return $"{prefix}{nextNumber:D5}";
        }
    }
}

using Microsoft.AspNetCore.Http;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Services;

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid TenantId
    {
        get
        {
            var tenantId = _httpContextAccessor.HttpContext?
                .User
                .FindFirst("tenant_id")?
                .Value;

            if (Guid.TryParse(tenantId, out var result))
                return result;

            return Guid.Empty;
        }
    }
}
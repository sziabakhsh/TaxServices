# Authentication implementation

Implemented:
- `POST /api/auth/login` integration
- `POST /api/auth/register` integration
- JWT persistence in browser localStorage
- `/api/auth/me` session restoration on refresh
- Protected routes
- Role-aware landing routes for Client / Employee / Admin
- Logout
- Login and registration validation aligned with current ASP.NET Identity password rules

## Required backend V1 change

`AuthController` already has `IAuthService.RegisterAsync(...)` and the registration logic creates a Client user. The endpoint was commented out. Enable it by restoring:

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register(RegisterRequest request)
{
    var result = await _authService.RegisterAsync(request);
    return Ok(result);
}
```

No database migration is required for this endpoint change.

## Local API configuration

Create `.env.local` when needed:

```env
VITE_API_BASE_URL=https://localhost:7226/api
```

The frontend defaults to that URL if the variable is not supplied.

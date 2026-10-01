using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(
            IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("set-password")]
        [AllowAnonymous]
        public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest request, CancellationToken cancellationToken)
        {
            await _authService.SetPasswordAsync(
                request,
                cancellationToken);

            return NoContent();
        }

        //[HttpPost("test-email")]
        //public async Task<IActionResult> TestEmail([FromQuery] string email, CancellationToken cancellationToken)
        //{
        //    await _emailService.SendAsync(
        //        email,
        //        "TaxServices Email Test",
        //        """
        //        <h2>Email service is working!</h2>
        //        <p>This email was sent from the TaxServices API.</p>
        //        """,
        //        cancellationToken);

        //    return Ok(new
        //    {
        //        message = "Test email sent successfully."
        //    });
        //}


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword(
    [FromBody] ForgotPasswordRequest request,
    CancellationToken cancellationToken)
        {
            await _authService.RequestPasswordResetAsync(
                request.Email,
                cancellationToken);

            return Ok(new
            {
                message =
                    "If an account exists for this email, a password reset link has been sent."
            });
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> VerifyTwoFactor(VerifyTwoFactorRequest request)
        {
            var result = await _authService.VerifyTwoFactorAsync(request);

            return Ok(result);
        }

        [HttpGet("2fa/status")]
        [Authorize]
        public async Task<IActionResult> GetTwoFactorStatus()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            var result = await _authService.GetTwoFactorStatusAsync(userId);

            return Ok(result);
        }

        [HttpPost("2fa/enable/request")]
        [Authorize]
        public async Task<IActionResult> RequestEnableTwoFactor()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            await _authService.RequestEnableTwoFactorAsync(userId);

            return NoContent();
        }

        [HttpPost("2fa/enable/confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmEnableTwoFactor(TwoFactorCodeRequest request)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            await _authService.ConfirmEnableTwoFactorAsync(
                userId,
                request);

            return NoContent();
        }

        [HttpPost("2fa/disable/request")]
        [Authorize]
        public async Task<IActionResult> RequestDisableTwoFactor()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            await _authService.RequestDisableTwoFactorAsync(userId);

            return NoContent();
        }

        [HttpPost("2fa/disable/confirm")]
        [Authorize]
        public async Task<IActionResult> ConfirmDisableTwoFactor(TwoFactorCodeRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            await _authService.ConfirmDisableTwoFactorAsync(userId, request);

            return NoContent();
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            var result = await _authService
                .GetCurrentUserAsync(userId);

            return Ok(result);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            await _authService.ChangePasswordAsync(
                userId,
                request);

            return NoContent();
        }

        [HttpGet("client-test")]
        [Authorize(Roles = "Client")]
        public IActionResult ClientTest()
        {
            return Ok("Client authorization works.");
        }

        [HttpGet("admin-test")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminTest()
        {
            return Ok("Admin authorization works.");
        }

    }
}

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.Exceptions;

namespace TaxServices.Api.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(
            exception,
            "Unhandled exception occurred. TraceId: {TraceId}",
            httpContext.TraceIdentifier);

        var statusCode = StatusCodes.Status500InternalServerError;
        var title = "An unexpected error occurred.";
        var detail =
            "An internal server error occurred. Please try again later.";

        if (exception is ArgumentException)
        {
            statusCode = StatusCodes.Status400BadRequest;
            title = "Validation error.";
            detail = exception.Message;
        }
        else if (exception is DuplicateUserException)
        {
            statusCode = StatusCodes.Status409Conflict;
            title = "User already exists.";
            detail = exception.Message;
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] =
            httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }
}
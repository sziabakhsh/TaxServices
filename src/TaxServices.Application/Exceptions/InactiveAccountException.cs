namespace TaxServices.Application.Exceptions;

public class InactiveAccountException : Exception
{
    public InactiveAccountException()
        : base("Your account is inactive. Please contact your administrator.")
    {
    }
}
namespace TaxServices.Application.Exceptions
{
    public class InvalidTwoFactorCodeException : Exception
    {
        public InvalidTwoFactorCodeException()
            : base("The verification code is invalid or has expired.")
        {
        }
    }
}
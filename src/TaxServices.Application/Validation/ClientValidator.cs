using TaxServices.Application.DTOs.Clients;

namespace TaxServices.Application.Validation
{

    public static class ClientValidator
    {
        public static void Validate(CreateClientRequest request)
        {
            ValidateCommon(
                request.FirstName,
                request.LastName,
                request.Email);

            if (request.IndividualProfile is not null)
            {
                ValidateIndividualProfile(
                    request.IndividualProfile.SIN,
                    request.IndividualProfile.DateOfBirth,
                    request.IndividualProfile.Address);
            }
        }

        public static void Validate(UpdateClientRequest request)
        {
            ValidateCommon(
                request.FirstName,
                request.LastName,
                request.Email);

            if (request.IndividualProfile is not null)
            {
                ValidateIndividualProfile(
                    request.IndividualProfile.SIN,
                    request.IndividualProfile.DateOfBirth,
                    request.IndividualProfile.Address);
            }
        }

        private static void ValidateCommon(
            string firstName,
            string lastName,
            string email)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new ArgumentException("First name is required.");

            if (firstName.Length > 100)
                throw new ArgumentException(
                    "First name cannot exceed 100 characters.");

            if (string.IsNullOrWhiteSpace(lastName))
                throw new ArgumentException("Last name is required.");

            if (lastName.Length > 100)
                throw new ArgumentException(
                    "Last name cannot exceed 100 characters.");

            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required.");

            if (email.Length > 255)
                throw new ArgumentException(
                    "Email cannot exceed 255 characters.");

            if (!IsValidEmail(email))
                throw new ArgumentException("Email format is invalid.");
        }

        private static void ValidateIndividualProfile(
            string sin,
            DateTime? dateOfBirth,
            string address)
        {
            if (string.IsNullOrWhiteSpace(sin))
                throw new ArgumentException("SIN is required.");

            if (sin.Length != 9 ||
                !sin.All(char.IsDigit))
            {
                throw new ArgumentException(
                    "SIN must contain exactly 9 digits.");
            }

            if (address.Length > 500)
                throw new ArgumentException(
                    "Address cannot exceed 500 characters.");

            if (dateOfBirth.HasValue &&
                dateOfBirth.Value.Date > DateTime.UtcNow.Date)
            {
                throw new ArgumentException(
                    "Date of birth cannot be in the future.");
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var address = new System.Net.Mail.MailAddress(email);

                return string.Equals(
                    address.Address,
                    email,
                    StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }
    }
}

using TaxServices.Application.DTOs.Clients;

namespace TaxServices.Application.Validation
{
    public static class ClientValidator
    {
        public static void Validate(
            CreateClientRequest request)
        {
            if (request.IndividualProfile is not null)
            {
                ValidateIndividualProfile(
                    request.IndividualProfile.SIN,
                    request.IndividualProfile.DateOfBirth,
                    requireSin: true);
            }
        }

        public static void Validate(
            UpdateClientRequest request)
        {
            if (request.IndividualProfile is not null)
            {
                ValidateIndividualProfile(
                    request.IndividualProfile.SIN,
                    request.IndividualProfile.DateOfBirth,
                    requireSin: false);
            }
        }

        private static void ValidateIndividualProfile(
            string sin,
            DateTime? dateOfBirth,
            bool requireSin)
        {
            if (requireSin || !string.IsNullOrWhiteSpace(sin))
            {
                if (sin.Length != 9 ||
                    !sin.All(char.IsDigit))
                {
                    throw new ArgumentException(
                        "SIN must contain exactly 9 digits.");
                }
            }

            if (dateOfBirth.HasValue &&
                dateOfBirth.Value.Date >
                DateTime.UtcNow.Date)
            {
                throw new ArgumentException(
                    "Date of birth cannot be in the future.");
            }
        }
    }
}
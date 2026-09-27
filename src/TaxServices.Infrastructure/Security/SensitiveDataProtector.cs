using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;

namespace TaxServices.Infrastructure.Security
{
    public class SensitiveDataProtector : ISensitiveDataProtector
    {
        private readonly IDataProtector _protector;
        private readonly byte[] _hashKey;

        public SensitiveDataProtector(
            IDataProtectionProvider dataProtectionProvider,
            IOptions<SensitiveDataOptions> options)
        {
            _protector = dataProtectionProvider.CreateProtector(
                "TaxServices.SensitiveData.v1");

            if (string.IsNullOrWhiteSpace(options.Value.HashKey))
            {
                throw new InvalidOperationException(
                    "Sensitive data hash key is not configured.");
            }

            _hashKey = Convert.FromBase64String(
                options.Value.HashKey);
        }

        public string Protect(string plainText)
        {
            if (string.IsNullOrWhiteSpace(plainText))
                return string.Empty;

            return _protector.Protect(plainText);
        }

        public string Unprotect(string protectedText)
        {
            if (string.IsNullOrWhiteSpace(protectedText))
                return string.Empty;

            return _protector.Unprotect(protectedText);
        }

        public string ComputeHash(string plainText)
        {
            if (string.IsNullOrWhiteSpace(plainText))
                return string.Empty;

            using var hmac = new HMACSHA256(_hashKey);

            var bytes = Encoding.UTF8.GetBytes(plainText);

            var hash = hmac.ComputeHash(bytes);

            return Convert.ToHexString(hash);
        }
    }
}
using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;

namespace TaxServices.Infrastructure.Storage
{
    public class FileEncryptionService : IFileEncryptionService
    {
        private const byte CurrentVersion = 1;
        private const int NonceSize = 12;
        private const int TagSize = 16;

        private readonly byte[] _key;

        public FileEncryptionService(
            IOptions<FileEncryptionOptions> options)
        {
            var key = options.Value.Key;

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException(
                    "File encryption key is not configured.");
            }

            try
            {
                _key = Convert.FromBase64String(key);
            }
            catch (FormatException)
            {
                throw new InvalidOperationException(
                    "File encryption key must be a valid Base64 string.");
            }

            if (_key.Length != 32)
            {
                throw new InvalidOperationException(
                    "File encryption key must be 256 bits (32 bytes).");
            }
        }

        public async Task<Stream> EncryptAsync(
            Stream input,
            CancellationToken cancellationToken = default)
        {
            using var inputMemory = new MemoryStream();

            await input.CopyToAsync(
                inputMemory,
                cancellationToken);

            var plaintext = inputMemory.ToArray();

            var nonce = RandomNumberGenerator.GetBytes(NonceSize);
            var ciphertext = new byte[plaintext.Length];
            var tag = new byte[TagSize];

            using var aes = new AesGcm(_key, TagSize);

            aes.Encrypt(
                nonce,
                plaintext,
                ciphertext,
                tag);

            var output = new MemoryStream();

            output.WriteByte(CurrentVersion);

            await output.WriteAsync(
                nonce,
                cancellationToken);

            await output.WriteAsync(
                tag,
                cancellationToken);

            await output.WriteAsync(
                ciphertext,
                cancellationToken);

            output.Position = 0;

            return output;
        }

        public async Task<Stream> DecryptAsync(
            Stream input,
            CancellationToken cancellationToken = default)
        {
            using var inputMemory = new MemoryStream();

            await input.CopyToAsync(
                inputMemory,
                cancellationToken);

            var encryptedData = inputMemory.ToArray();

            var minimumLength =
                1 + NonceSize + TagSize;

            if (encryptedData.Length < minimumLength)
            {
                throw new CryptographicException(
                    "Invalid encrypted file.");
            }

            var version = encryptedData[0];

            if (version != CurrentVersion)
            {
                throw new CryptographicException(
                    $"Unsupported encrypted file version: {version}.");
            }

            var nonce = encryptedData
                .AsSpan(1, NonceSize)
                .ToArray();

            var tag = encryptedData
                .AsSpan(1 + NonceSize, TagSize)
                .ToArray();

            var ciphertext = encryptedData
                .AsSpan(1 + NonceSize + TagSize)
                .ToArray();

            var plaintext = new byte[ciphertext.Length];

            using var aes = new AesGcm(_key, TagSize);

            aes.Decrypt(
                nonce,
                ciphertext,
                tag,
                plaintext);

            return new MemoryStream(plaintext);
        }
    }
}

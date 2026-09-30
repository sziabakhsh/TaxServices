namespace TaxServices.Application.Interfaces
{
    public interface IFileEncryptionService
    {
        Task<Stream> EncryptAsync(Stream input, CancellationToken cancellationToken = default);

        Task<Stream> DecryptAsync(Stream input, CancellationToken cancellationToken = default);
    }
}
namespace TaxServices.Application.Interfaces
{
    public interface IFileStorageService
    {
        Task UploadAsync(Stream stream, string path, string contentType, CancellationToken cancellationToken = default);

        Task<Stream> DownloadAsync(string path, CancellationToken cancellationToken = default);

        Task DeleteAsync(string path, CancellationToken cancellationToken = default);
    }
}
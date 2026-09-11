using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Options;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;

namespace TaxServices.Infrastructure.Storage
{
    public class AzureBlobStorageService : IFileStorageService
    {
        private readonly AzureStorageOptions _options;

        public AzureBlobStorageService(IOptions<AzureStorageOptions> options)
        {
            _options = options.Value;
        }

        public async Task UploadAsync(Stream stream, string path, string contentType, CancellationToken cancellationToken = default)
        {
            var containerClient = GetContainerClient();

            var blobClient = containerClient.GetBlobClient(path);

            var options = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            };

            await blobClient.UploadAsync(stream, options, cancellationToken);
        }

        public async Task<Stream> DownloadAsync(string path, CancellationToken cancellationToken = default)
        {
            var containerClient = GetContainerClient();

            var blobClient = containerClient.GetBlobClient(path);

            var response = await blobClient.DownloadStreamingAsync(cancellationToken: cancellationToken);

            return response.Value.Content;
        }

        public async Task DeleteAsync(string path, CancellationToken cancellationToken = default)
        {
            var containerClient = GetContainerClient();

            var blobClient = containerClient.GetBlobClient(path);

            await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }

        private BlobContainerClient GetContainerClient()
        {
            if (string.IsNullOrWhiteSpace(_options.ConnectionString))
            {
                throw new InvalidOperationException(
                    "Azure Storage connection string is not configured.");
            }

            if (string.IsNullOrWhiteSpace(_options.ContainerName))
            {
                throw new InvalidOperationException(
                    "Azure Storage container name is not configured.");
            }

            return new BlobContainerClient(_options.ConnectionString, _options.ContainerName);
        }
    }
}
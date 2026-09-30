using Microsoft.Extensions.Options;
using TaxServices.Application.Configuration;
using TaxServices.Application.DTOs.Documents;

namespace TaxServices.Application.Services
{
    public class FileUploadValidator
    {
        private readonly FileUploadOptions _options;

        public FileUploadValidator(
            IOptions<FileUploadOptions> options)
        {
            _options = options.Value;
        }

        public void Validate(UploadDocumentRequest request)
        {
            if (request.Content == null ||
                request.Content == Stream.Null)
            {
                throw new ArgumentException(
                    "File content is required.");
            }

            if (string.IsNullOrWhiteSpace(request.FileName))
            {
                throw new ArgumentException(
                    "File name is required.");
            }

            if (request.FileSize <= 0)
            {
                throw new ArgumentException(
                    "File cannot be empty.");
            }

            if (request.FileSize > _options.MaxFileSizeBytes)
            {
                var maxSizeMb =
                    _options.MaxFileSizeBytes / 1024 / 1024;

                throw new ArgumentException(
                    $"File size cannot exceed {maxSizeMb} MB.");
            }

            var extension = Path
                .GetExtension(request.FileName)
                .ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(extension) ||
                !_options.AllowedExtensions.Contains(
                    extension,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "File extension is not allowed.");
            }

            if (string.IsNullOrWhiteSpace(request.ContentType) ||
                !_options.AllowedContentTypes.Contains(
                    request.ContentType,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "File type is not allowed.");
            }
        }
    }
}
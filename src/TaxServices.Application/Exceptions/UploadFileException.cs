
using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Documents;

namespace TaxServices.Application.Exceptions
{
    public static class UploadFileException
    {
        public static void CheckFileValidation(UploadDocumentRequest request)
        {
            const long maxFileSize = 10 * 1024 * 1024; // 10 MB

            var allowedExtensions = new[]
            {
                ".pdf",
                ".jpg",
                ".jpeg",
                ".png"
            };

            var allowedContentTypes = new[]
            {
                "application/pdf",
                "image/jpeg",
                "image/png"
            };

            if (request.Content == null || request.Content == Stream.Null)
                throw new ArgumentException("File content is required.");

            if (string.IsNullOrWhiteSpace(request.FileName))
                throw new ArgumentException("File name is required.");

            if (request.FileSize <= 0)
                throw new ArgumentException("File cannot be empty.");

            if (request.FileSize > maxFileSize)
                throw new ArgumentException("File size cannot exceed 10 MB.");

            var extension = Path.GetExtension(request.FileName).ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(extension) ||
                !allowedExtensions.Contains(extension))
            {
                throw new ArgumentException(
                    "Only PDF, JPG, JPEG and PNG files are allowed.");
            }

            if (string.IsNullOrWhiteSpace(request.ContentType) ||
                !allowedContentTypes.Contains(
                    request.ContentType,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException("File type is not allowed.");
            }

        }
    }
}

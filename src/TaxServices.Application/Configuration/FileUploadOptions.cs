namespace TaxServices.Application.Configuration
{
    public class FileUploadOptions
    {
        public const string SectionName = "FileUpload";

        public long MaxFileSizeBytes { get; set; }

        public string[] AllowedExtensions { get; set; } = [];

        public string[] AllowedContentTypes { get; set; } = [];
    }
}
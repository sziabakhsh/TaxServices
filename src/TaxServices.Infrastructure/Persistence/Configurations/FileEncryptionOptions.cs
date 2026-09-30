namespace TaxServices.Infrastructure.Configuration
{
    public class FileEncryptionOptions
    {
        public const string SectionName = "FileEncryption";

        public string Key { get; set; } = string.Empty;
    }
}
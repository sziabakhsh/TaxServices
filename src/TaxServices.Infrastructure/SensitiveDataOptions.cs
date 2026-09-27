namespace TaxServices.Infrastructure.Configuration
{
    public class SensitiveDataOptions
    {
        public const string SectionName = "SensitiveData";

        public string HashKey { get; set; } = string.Empty;
    }
}
namespace TaxServices.Infrastructure.Configuration
{
    public class FrontendOptions
    {
        public const string SectionName = "Frontend";

        public string BaseUrl { get; set; } = string.Empty;
    }
}
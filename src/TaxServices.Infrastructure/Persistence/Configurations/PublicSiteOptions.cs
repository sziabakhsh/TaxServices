namespace TaxServices.Infrastructure.Configuration
{
    public class PublicSiteOptions
    {
        public const string SectionName = "PublicSite";

        public Guid TenantId { get; set; }
    }
}
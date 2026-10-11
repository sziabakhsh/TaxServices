
using Serilog;

namespace TaxServices.Infrastructure.Logging
{
    public static class SerilogConfiguration
    {
        public static void Configure()
        {
            const string logPath = "Logs/taxservices-.log";

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .MinimumLevel.Override(
                    "Microsoft", Serilog.Events.LogEventLevel.Warning)
                .MinimumLevel.Override(
                    "System", Serilog.Events.LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .WriteTo.File(
                    path: logPath,
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 14,
                    shared: true,
                    outputTemplate:
                        "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} " +
                        "[{Level:u3}] " +
                        "{Message:lj}{NewLine}{Exception}")
                .CreateLogger();
        }
    }
}

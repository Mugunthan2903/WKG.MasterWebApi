using WKG.Masters;
using WKG.MasterWebApi.Core.Services;
using WKG.MasterWebApi.Core.Services.Interfaces;
using Microsoft.AspNetCore.Http.Features;
using WKL.Web.Core.Interfaces;
using WKG.Masters.Services.Interfaces;

namespace WKG.MasterWebApi
{
    public static class ServiceExtensions
    {
        public static void AddWebApiCors(this IServiceCollection services, IConfiguration configuration, string policyName)
        {
            var settingsSection = configuration.GetSection("WKL:CorsIPs");
            var settings = settingsSection.Get<List<string>>();
            settings = settings ?? new List<string>();

            services.AddCors(options =>
            {
                options.AddPolicy(policyName,
                  builder => builder
                  .WithOrigins(settings.ToArray())
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials());
            });
        }

        public static void AddFilePathConfiguration(this IServiceCollection services)
        {
            services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = long.MaxValue;
                options.KeyLengthLimit = int.MaxValue;
                options.ValueCountLimit = int.MaxValue;
            });
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        }

        public static void AddApiServices(this IServiceCollection services)
        {
            services.AddScoped<IStartupTask, TokenStoreService>();
            services.AddScoped<ITokenStoreService, TokenStoreService>();
            services.AddScoped<ITokenValidatorService, TokenValidatorService>();

            services.AddSingleton<ISignalRNotifierService, SignalRNotifierService<NotificationsHub>>();

            services.AddTransactionService();
        }

    }
}

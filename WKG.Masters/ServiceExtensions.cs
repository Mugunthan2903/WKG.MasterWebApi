using WKG.Masters.Services;
using WKG.Masters.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace WKG.Masters
{
    public static class ServiceExtensions
    {
        public static void AddTransactionService(this IServiceCollection services)
        {
            services.AddScoped<IUserService, UserService>();



            services.AddScoped<ISampleService, SampleService>();

            services.AddScoped<ISMST001Service, SMST001Service>();
            services.AddScoped<ISMST002Service, SMST002Service>();
            services.AddScoped<ISMST003Service, SMST003Service>();
            services.AddScoped<ISMST004Service, SMST004Service>();
            services.AddScoped<ISMST010Service, SMST010Service>();
            services.AddScoped<ISMST015Service, SMST015Service>();
            services.AddScoped<ISMST020Service, SMST020Service>();
            services.AddScoped<ISMST030Service, SMST030Service>();

            //New
            services.AddScoped<ISSM005Service, SSM005Service>();
            services.AddScoped<ISSM009Service, SSM009Service>(); //Image
            services.AddScoped<ISSM010Service, SSM010Service>();
            services.AddScoped<ISSM012Service, SSM012Service>();
            services.AddScoped<ISSM020Service, SSM020Service>();
            services.AddScoped<ISSM030Service, SSM030Service>();
            services.AddScoped<ISSM040Service, SSM040Service>();
            services.AddScoped<ISSM050Service, SSM050Service>();
            services.AddScoped<ISSM060Service, SSM060Service>();
            services.AddScoped<ISSM070Service, SSM070Service>();
            services.AddScoped<ISSM080Service, SSM080Service>();
            services.AddScoped<ISSM090Service, SSM090Service>();
            services.AddScoped<ISSM100Service, SSM100Service>();
            services.AddScoped<ISSM110Service, SSM110Service>();
            services.AddScoped<ISSM120Service, SSM120Service>();
            services.AddScoped<ISSM130Service, SSM130Service>();
            services.AddScoped<ISSM150Service, SSM150Service>();
            services.AddScoped<ISSM160Service, SSM160Service>();

            services.AddScoped<ITypeSearchService, TypeSearchService>();

            services.AddScoped<ITestService, TestService>();

            services.AddScoped<IFileManagerService, FileManagerService>();
        }
    }
}

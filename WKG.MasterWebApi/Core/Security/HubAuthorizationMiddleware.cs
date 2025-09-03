using System.Security.Claims;
using WKG.MasterWebApi.Model;

namespace WKG.MasterWebApi.Core.Security
{
    public class HubAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private const string API_KEY_NAME = "ApiKeys";
        private const string HEADER_API_KEY = "api-key";
        public HubAuthorizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments(AppConstants.SIGNALR_HUB_PATH, StringComparison.OrdinalIgnoreCase))
            {
                string path = context.Request.Path;
                if (path.EndsWith(AppConstants.SIGNALR_HUB_PATH, StringComparison.OrdinalIgnoreCase))
                {
                    if (!context.Request.Query.TryGetValue("access_token", out var extractedApiKey))
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("Api Key was not provided. (Using ApiKeyMiddleware) ");
                        return;
                    }

                    var configuration = context.RequestServices.GetRequiredService<IConfiguration>();
                    if (configuration != null)
                    {
                        var settingsSection = configuration.GetSection(AppConstants.API_KEY_NAME);
                        if (settingsSection != null)
                        {
                            var keys = new List<SecurityMetadata>();
                            try
                            {
                                keys = settingsSection.Get<string>()?.ToJsonObject<List<SecurityMetadata>>();
                            }
                            catch { }

                            keys = keys ?? new List<SecurityMetadata>();

                            if (keys.Count == 0)
                            {
                                context.Response.StatusCode = 401;
                                await context.Response.WriteAsync("Api Keys was not configured!");
                                return;
                            }

                            var securityInfo = keys.FirstOrDefault(k => string.Compare(k.ApiKey, extractedApiKey, true) == 0);
                            if (securityInfo == null)
                            {
                                context.Response.StatusCode = 401;
                                await context.Response.WriteAsync("Api Key is not valid");
                                return;
                            }

                            var claim = new Claim(ClaimTypes.NameIdentifier, securityInfo.UserID);
                            var identity = new ClaimsIdentity(new[] { claim }, "BasicAuthentication"); // this uses basic auth
                            var principal = new ClaimsPrincipal(identity);
                            context.User = principal;
                        }
                    }
                }
            }

            //var claim = new Claim(ClaimTypes.NameIdentifier, "ADMIN");
            //var identity = new ClaimsIdentity(new[] { claim }, "BasicAuthentication"); // this uses basic auth
            //var principal = new ClaimsPrincipal(identity);
            //context.User = principal;
            await _next(context);
        }
    }
}

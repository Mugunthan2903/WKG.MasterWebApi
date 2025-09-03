using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using WKG.MasterWebApi.Model;

namespace WKG.MasterWebApi.Core.Security
{
    [AttributeUsage(validOn: AttributeTargets.Class | AttributeTargets.Method)]
    public class ApiKeyAttribute : Attribute, IAsyncActionFilter
    {
        #region Variables

        private const string API_KEY_NAME = AppConstants.API_KEY_NAME;
        private const string HEADER_API_KEY = AppConstants.HEADER_API_KEY;
        private string _keyName = ApiKeyAttribute.API_KEY_NAME;
        private string _headerApiKey = ApiKeyAttribute.HEADER_API_KEY;

        #endregion

        #region Constructor

        /// <summary>
        /// AppSetting Property Name
        /// </summary>
        /// <param name="SecretKeyName">AppSetting Property Name</param>
        /// <param name="HeaderApiKey">Request Header Name</param>
        public ApiKeyAttribute(string SecretKeyName = AppConstants.API_KEY_NAME, string HeaderApiKey = AppConstants.HEADER_API_KEY)
        {
            if (!string.IsNullOrWhiteSpace(SecretKeyName))
                this._keyName = SecretKeyName;

            if (!string.IsNullOrWhiteSpace(HeaderApiKey))
                this._headerApiKey = HeaderApiKey;
        }

        #endregion

        #region Methods

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.HttpContext.Request.Headers.TryGetValue(this._headerApiKey, out var extractedApiKey))
            {
                context.Result = new ContentResult()
                {
                    StatusCode = 401,
                    Content = "Api Key was not provided"
                };
                return;
            }

            var configuration = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            if (configuration != null)
            {
                var settingsSection = configuration.GetSection(this._keyName);
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
                        context.Result = new ContentResult()
                        {
                            StatusCode = 401,
                            Content = "Api Keys was not configured!"
                        };
                        return;
                    }

                    var securityInfo = keys.FirstOrDefault(k => string.Compare(k.ApiKey, extractedApiKey, true) == 0);
                    if (securityInfo == null)
                    {
                        context.Result = new ContentResult()
                        {
                            StatusCode = 401,
                            Content = "Api Key is not valid"
                        };
                        return;
                    }

                    var claim = new Claim(ClaimTypes.NameIdentifier, securityInfo.UserID);
                    var identity = new ClaimsIdentity(new[] { claim }, "BasicAuthentication"); // this uses basic auth
                    var principal = new ClaimsPrincipal(identity);
                    context.HttpContext.User = principal;
                }
            }
            await next();
        }

        #endregion
    }
}

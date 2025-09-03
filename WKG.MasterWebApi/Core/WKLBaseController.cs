using WKG.Masters.Model;
using WKG.MasterWebApi.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System.Net;
using System.Security.Claims;

namespace WKG.MasterWebApi.Core
{
    [Authorize]
    [EnableCors(AppConstants.CROS_POLICY_NAME)]
    public class WKLBaseController : ControllerBase
    {
        #region Protected Methods

        protected string GetContentType(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return "";

            var types = GetMimeTypes();
            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types[ext];
        }
        protected SessionInfo GetSessionInfo()
        {
            return new SessionInfo
            {
                MachineID = this.GetIPAddress(),
                BrowserInfo = this.GetBrowserInfo(),
                UserID = this.HttpContext.GetUserID()
            };
        }

        #endregion

        #region Private Methods

        private T GetValue<T>(string key, T defaultValue = default(T))
        {
            T t = defaultValue;
            try
            {
                var claimsIdentity = HttpContext.User.Identity as ClaimsIdentity;
                if (claimsIdentity != null && claimsIdentity.Claims != null)
                {
                    var claim = claimsIdentity.FindFirst(key);
                    if (claim != null)
                        t = (T)Convert.ChangeType(claim.Value, typeof(T));
                }
            }
            catch (Exception ex) { }
            return t;
        }
        private Dictionary<string, string> GetMimeTypes()
        {
            return new Dictionary<string, string>
            {
                {".txt", "text/plain"},
                {".pdf", "application/pdf"},
                {".doc", "application/vnd.ms-word"},
                {".docx", "application/vnd.ms-word"},
                {".xls", "application/vnd.ms-excel"},
                {".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                {".png", "image/png"},
                {".jpg", "image/jpeg"},
                {".jpeg", "image/jpeg"},
                {".gif", "image/gif"},
                {".csv", "text/csv"}
            };
        }

        #endregion

        #region Private Methods
        private string GetBrowserInfo()
        {
            string result = "";
            try
            {
                StringValues value = default(StringValues);
                if (this.HttpContext != null && this.HttpContext.Request?.Headers?.TryGetValue("User-Agent", out value) == true)
                {
                    return value[0];
                }
            }
            catch
            {
            }

            return result;
        }
        private string GetIPAddress()
        {
            string result = "127.0.0.1";
            try
            {
                IPAddress iPAddress = this.HttpContext.Connection?.RemoteIpAddress;
                if (iPAddress == null)
                {
                    return result;
                }

                if (iPAddress.Equals(IPAddress.IPv6Loopback))
                {
                    return IPAddress.Loopback.ToString();
                }

                return iPAddress.MapToIPv4().ToString();
            }
            catch
            {
            }

            return result;
        }

        #endregion
    }
}

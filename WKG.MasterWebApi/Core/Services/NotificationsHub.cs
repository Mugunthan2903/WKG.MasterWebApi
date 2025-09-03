using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Text.RegularExpressions;
using WKG.MasterWebApi.Model;

namespace WKG.MasterWebApi.Core.Services
{
    [EnableCors(AppConstants.CROS_POLICY_NAME)]
    public class NotificationsHub : Hub
    {
        readonly List<string> GroupNames = new List<string> { ClaimTypes.NameIdentifier };
        public override async Task OnConnectedAsync()
        {
            try
            {
                if (GroupNames?.Count > 0)
                {
                    string groupName = GetGroupName();
                    await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                }
            }
            catch (Exception ex)
            {
                var logger = Context.GetHttpContext().RequestServices.GetRequiredService<ILogger<NotificationsHub>>();
                if (logger != null)
                    logger.LogError(ex, "NotificationsHub.OnConnectedAsync");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            try
            {
                if (GroupNames?.Count > 0)
                {
                    string groupName = GetGroupName();
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                }
            }
            catch (Exception ex1)
            {
                var logger = Context.GetHttpContext().RequestServices.GetRequiredService<ILogger<NotificationsHub>>();
                if (logger != null)
                    logger.LogError(ex1, "NotificationsHub.OnDisconnectedAsync");
            }
            await base.OnDisconnectedAsync(ex);
        }


        #region Private Methods

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        private string GetGroupName()
        {
            string grpName = "";
            try
            {
                var claims = Context.User?.Claims?.ToList();
                if (claims?.Count > 0)
                {
                    foreach (var grp in GroupNames)
                    {
                        var claim = claims.FirstOrDefault(c => c.Type == grp);
                        if (claim != null)
                        {
                            if (grpName.Length == 0)
                                grpName = claim.Value;
                            else
                                grpName += $"-{claim.Value}";
                        }
                    }
                }

            }
            catch (Exception ex) { }
            return grpName;
        }

        #endregion
    }
}

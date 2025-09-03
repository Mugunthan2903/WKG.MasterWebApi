using Microsoft.AspNetCore.SignalR;
using WKG.Masters.Services.Interfaces;

namespace WKG.MasterWebApi.Core.Services
{
    public class SignalRNotifierService<T> : ISignalRNotifierService where T : Hub
    {
        #region Constants

        const string NOTIFIER = "ReceiveMessage";

        private readonly IHubContext<T> _hubContext;

        #endregion

        #region Constructor

        public SignalRNotifierService(IHubContext<T> hubContext)
        {
            _hubContext = hubContext;
        }


        #endregion

        #region Properties

        public string Method => NOTIFIER;

        #endregion

        #region Public Methods

        public async Task SendMessageAsync<TInput>(string action, TInput data)
        {
            await _hubContext.Clients.All.SendAsync(Method, action, data?.ToJsonText());
        }
        public async Task SendMessageAsync<TInput>(string group, string action, TInput data)
        {
            await _hubContext.Clients.Group(group).SendAsync(Method, action, data?.ToJsonText());
        }
        public async Task SendMessageAsync<TInput>(List<string> groups, string action, TInput data)
        {
            await _hubContext.Clients.Groups(groups).SendAsync(Method, action, data?.ToJsonText());
        }

        #endregion
    }
}

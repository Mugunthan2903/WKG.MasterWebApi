using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISignalRNotifierService
    {
        string Method { get; }
        Task SendMessageAsync<TInput>(string action, TInput data);
        Task SendMessageAsync<TInput>(string group, string action, TInput data);
        Task SendMessageAsync<TInput>(List<string> groups, string action, TInput data);
    }
}

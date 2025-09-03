using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM009Service : IDisposable
    {
        Task<List<SSM020Overrides>> SSM009OnloadImageData(SessionInfo sessionInfo, SSM020Overrides input);
        Task<string> SSM009DownloadFileAsync(SessionInfo sessionInfo, SSM020Overrides input);
    }
}

using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM090Service : IDisposable
    {
        Task<SSM090OnloadObject> SSM090OnloadAsync(SessionInfo sessionInfo, SSM090Object input);
        Task<SSM090OnloadObject> SSM090GetSearchAsync(SessionInfo sessionInfo, SSM090Object input);
        Task<SSM090OnloadObject> SSM090BlurAsync(SessionInfo sessionInfo, SSM090Object input);
        Task<SSM090OnloadObject> SSM090GetSelectAsync(SessionInfo sessionInfo, SSM090Object input);
        Task<OperationStatus> SSM090SaveDataAsync(SessionInfo sessionInfo, SSM090Object input, List<IFormFile> files);

    }
}

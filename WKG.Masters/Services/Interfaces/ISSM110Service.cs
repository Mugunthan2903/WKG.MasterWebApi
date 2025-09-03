using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM110Service : IDisposable
    {
        Task<SSM110OnloadObject> SSM110OnloadAsync(SessionInfo sessionInfo, SSM110Object input);
        Task<OperationStatus> SaveDataAsync(SessionInfo sessionInfo, SSM110Object input);
        Task<SSM110OnloadObject> GetSelectAsync(SessionInfo sessionInfo, SSM110Object input);

        Task<SSM110OnloadObject> BlurAsync(SessionInfo sessionInfo, SSM110Object input);
        //


    }
}

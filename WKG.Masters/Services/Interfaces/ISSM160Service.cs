using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM160Service : IDisposable
    {
        Task<SSM160OnloadObject> SSM160OnloadAsync(SessionInfo sessionInfo, SSM160Object input);
        Task<SSM160OnloadObject> SSM160GetSearchAsync(SessionInfo sessionInfo, SSM160Object input);
        Task<SSM160OnloadObject> SSM160GetSelectAsync(SessionInfo sessionInfo, SSM160Object input);
        Task<SSM160OnloadObject> SSM160GetSelectDefaultcheck(SessionInfo sessionInfo, SSM160Object input);
        Task<OperationStatus> SSM160SaveDataAsync(SessionInfo sessionInfo, SSM160Object input);
        Task<SSM160OnloadObject> SSM161SearchrecordAsync(SessionInfo sessionInfo, SSM160Object input);
        Task<OperationStatus> SSM161SaveDataAsync(SessionInfo sessionInfo, SSM160Object input);
    }
}

using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM200Service : IDisposable
    {
        Task<SSM200loadObject> SSM200GetOnloadAsync(SessionInfo sessionInfo, SSM200Object input);
        Task<SSM200BlurObject> SSM200BlurAsync(SessionInfo sessionInfo, SSM200Object input);
        Task<PageInfo<SSM200Object>> SSM200GetSearchAsync(SessionInfo sessionInfo, SSM200Object input);
        Task<SSM200loadObject> SSM200GetSelectAsync(SessionInfo sessionInfo, SSM200Object input);
        Task<OperationStatus> SSM200SaveAsync(SessionInfo sessionInfo, SSM200Object input);
    }
}
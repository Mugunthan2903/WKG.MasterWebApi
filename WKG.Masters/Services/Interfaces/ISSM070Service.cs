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
    public interface ISSM070Service : IDisposable
    {
        Task<SSM070loadObject> SSM070GetOnloadAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<SSM070loadObject> SSM070GetSearchAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<SSM070loadObject> SSM070GetSelectAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<OperationStatus> SSM070SaveAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<OperationStatus> SSM071SaveAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<SSM070loadObject> SSM071GetOnloadAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<SSM070loadObject> SSM071GetSearchAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<SSM070loadObject> SSM071GetSelectAsync(SessionInfo sessionInfo, SSM070Object input);
        Task<SSM070loadObject> SSM071CheckPosExistAsync(SessionInfo sessionInfo, SSM070Object input);

    }
}

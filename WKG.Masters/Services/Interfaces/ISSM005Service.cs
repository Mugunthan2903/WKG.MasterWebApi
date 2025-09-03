using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{

    public interface ISSM005Service : IDisposable
    {
        Task<SSM005loadObject> SSM005GetOnloadAsync(SessionInfo sessionInfo, SSM005Object input);
        Task<PageInfo<SSM005Object>> SSM005GetSearchAsync(SessionInfo sessionInfo, SSM005Object input);
        Task<OperationStatus> SSM005SaveAsync(SessionInfo sessionInfo, SSM005Object input);
    }
}

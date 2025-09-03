using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISMST001Service: IDisposable
    {
        Task<PageInfo<SMST001Object>> GetProductsAsync(SessionInfo sessionInfo, SearchInput input);
        Task<OperationStatus> PosSaveAsync(SessionInfo sessionInfo, SMST001Object input);
    }
}

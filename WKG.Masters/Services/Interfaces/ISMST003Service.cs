using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISMST003Service : IDisposable
    {
        Task<SMST003loadObject> GetOnloadAsync(SessionInfo sessionInfo, SMST003Object input);

        Task<List<SMST003Object>> GetProductsAsync(SessionInfo sessionInfo, SMST003Object input);

        Task<SMST003BlurObject> BlurSearchAsync(SessionInfo sessionInfo, SMST003Object input);
        Task<PageInfo<SMST003Object>> GetSearchAsync(SessionInfo sessionInfo, SMST003Object input);

        Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, SMST003Object input);
    }
}

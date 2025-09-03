using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISMST020Service : IDisposable
    {
        Task<PageInfo<SMST020Object>> GetTuiProductsAsync(SessionInfo sessionInfo, SMST020Object input);
        Task<OperationStatus> SaveTuiAsync(SessionInfo sessionInfo, SMST020Object input);
        Task<SMST020Object> GetSrchcmbproduct(SessionInfo sessionInfo, SMST020Object input);
        Task<SMST020Object> GetCombobinding(SessionInfo sessionInfo, SMST020Object input);
        Task<PageInfo<SMST022TableFields>> SearchData( SessionInfo sessionInfo, SMST022SearchInputs input );
        Task<OperationStatus> SaveCategoryAsync( SessionInfo sessionInfo, SMST022TableFields input );
        Task<SMST022TableFields> LoadFormDataAsync( SessionInfo sessionInfo, SMST022TableFields input );
    }
}
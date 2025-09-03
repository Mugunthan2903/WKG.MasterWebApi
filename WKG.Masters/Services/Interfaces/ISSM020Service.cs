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
    public interface ISSM020Service : IDisposable
    {
        Task<PageInfo<SSM020Object>> GetTuiProductsAsync(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM020Object> SSM021GetEditTUICity(SessionInfo sessionInfo, SSM020Object input);
        Task<OperationStatus> SaveTuiAsync(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM020Object> GetSrchcmbproduct(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM020Object> GetCombobinding(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM020Object> GetNewdatasectwo(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM020Object> SSM025OnBlurSearch(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM020OnloadObject> SSM022GetOnloadAsync(SessionInfo sessionInfo, SSM022SearchInputs input);
        Task<PageInfo<SSM022Object>> SearchData( SessionInfo sessionInfo, SSM022SearchInputs input );
        Task<OperationStatus> SaveCategoryAsync( SessionInfo sessionInfo, SSM022Object input );
        Task<SSM022Object> LoadFormDataAsync( SessionInfo sessionInfo, SSM022Object input );
        Task<SSM023Object> SSM023OnLoadDataAsync( SessionInfo sessionInfo, SSM023Object input );
        Task<PageInfo<SSM023Object>> SSM023SearchDataAsync( SessionInfo sessionInfo, SSM023Object input );
        Task<SSM023Object> SSM023BlurSrchAsync( SessionInfo sessionInfo, SSM023Object input );
        Task<SSM023Object> SSM023LoadSelectedData( SessionInfo sessionInfo, SSM023Object input );
        Task<OperationStatus> SaveDataAsyncSSM023( SessionInfo sessionInfo, SSM023Object input );
        Task<OperationStatus> SaveDataSectionconfigandimg(SessionInfo sessionInfo, SSM020Overrides input);
        Task<OperationStatus> SaveDataSectionEdit(SessionInfo sessionInfo, SSM020Overrides input, List<IFormFile> files);
        Task<OperationStatus> RemoveImage(SessionInfo sessionInfo, SSM020Overrides input);

    }
}
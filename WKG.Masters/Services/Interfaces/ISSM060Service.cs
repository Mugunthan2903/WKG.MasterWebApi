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
    public interface ISSM060Service : IDisposable
    {
        Task<SSM060LoadObject> GetOnloadSrch(SessionInfo sessionInfo, SSM060Object input);
        Task<SSM060LoadObject> SSM061OnLoadDataAsync(SessionInfo sessionInfo, SSM060Object input);
        Task<OperationStatus> SSM061SaveDataAsync( SessionInfo sessionInfo, SSM060Object input );
        Task<PageInfo<SSM034TableFields>> SSM062SearchData( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM034TableFields> SSM062LoadSelectedData( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM034TableFields> SSM062LoadInitData( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM034TableFields> SSM062BlurAsync( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM020Object> SSM063GetOnloadData(SessionInfo sessionInfo, SSM060Object input);
        Task<SSM020Object> SSM063OnBlurSearch( SessionInfo sessionInfo, SSM020Object input );
        Task<SSM064loadObject> SSM064OnLoadData(SessionInfo sessionInfo, SSM064GridObject input);
        Task<SSM064loadObject> SSM065GetOnloadData(SessionInfo sessionInfo, SSM064GridObject input);
        Task<SSM064GridObject> SSM065OnBlurSearch(SessionInfo sessionInfo, SSM064GridObject input);
        Task<OperationStatus> SSM060SaveExcDataAsync(SessionInfo sessionInfo, SSM062Object input);
        Task<OperationStatus> SSM063SaveDataAsync(SessionInfo sessionInfo, SSM062Object input);
        Task<OperationStatus> SSM064SaveImageData(SessionInfo sessionInfo, SSM064Image input, List<IFormFile> files);
        Task<OperationStatus> SSM065SaveDataAsync(SessionInfo sessionInfo, SSM064GridObject input);
        Task<OperationStatus> SSM064RemoveImage(SessionInfo sessionInfo, SSM064Image input);
        Task<OperationStatus> SSM065DeleteData( SessionInfo sessionInfo, SSM064GridObject input );
    }
}

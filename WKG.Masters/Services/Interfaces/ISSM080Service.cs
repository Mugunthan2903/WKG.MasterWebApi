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
    public interface ISSM080Service : IDisposable
    {
        Task<SSM060LoadObject> SSM080GetOnloadSrch(SessionInfo sessionInfo, SSM060Object input);
        Task<SSM060LoadObject> SSM081OnLoadDataAsync(SessionInfo sessionInfo, SSM060Object input);
        Task<SSM034TableFields> SSM082LoadInitData(SessionInfo sessionInfo, SSM034TableFields input);
        Task<SSM034TableFields> SSM082BlurAsync(SessionInfo sessionInfo, SSM034TableFields input);
        Task<PageInfo<SSM034TableFields>> SSM082SearchData(SessionInfo sessionInfo, SSM034TableFields input);
        Task<SSM034TableFields> SSM082LoadSelectedData(SessionInfo sessionInfo, SSM034TableFields input);
        Task<SSM020Object> SSM083GetOnloadData(SessionInfo sessionInfo, SSM060Object input);
        Task<SSM020Object> SSM083OnBlurSearch(SessionInfo sessionInfo, SSM020Object input);
        Task<SSM064loadObject> SSM084OnLoadData(SessionInfo sessionInfo, SSM064GridObject input);
        Task<SSM064loadObject> SSM085GetOnloadData(SessionInfo sessionInfo, SSM064GridObject input);
        Task<SSM064GridObject> SSM085OnBlurSearch(SessionInfo sessionInfo, SSM064GridObject input);
        Task<OperationStatus> SSM080SaveExcDataAsync(SessionInfo sessionInfo, SSM062Object input);
        Task<OperationStatus> SSM081SaveDataAsync(SessionInfo sessionInfo, SSM060Object input);
        Task<OperationStatus> SSM083SaveDataAsync(SessionInfo sessionInfo, SSM062Object input);
        Task<OperationStatus> SSM084SaveImageData(SessionInfo sessionInfo, SSM064Image input, List<IFormFile> files);
        Task<OperationStatus> SSM085SaveDataAsync(SessionInfo sessionInfo, SSM064GridObject input);
        Task<OperationStatus> SSM085DeleteData(SessionInfo sessionInfo, SSM064GridObject input);
    }
}

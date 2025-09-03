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
    public interface ISSM010Service : IDisposable
    {
        Task<SSM010loadObject> SSM010GetOnloadAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<SSM010BlurObject> SSM010BlurAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<PageInfo<SSM010Object>> SSM010GetSearchAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<SSM010loadObject> SSM010GetSelectAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<OperationStatus> SSM010SaveAsync(SessionInfo sessionInfo, SSM010Object input);


        Task<SSM011BlurObject> SSM011BlurAsync(SessionInfo sessionInfo, SSM011Object input);
        Task<SSM011loadObject> SSM011GetSearchAsync(SessionInfo sessionInfo, SSM011Object input);
        Task<OperationStatus> SSM011SaveAsync(SessionInfo sessionInfo, SSM011Object input, List<IFormFile> files);
        Task<SSM011GridSSMObject> SSM011GridAsync(SessionInfo sessionInfo, SSM010Object input);

        Task<SSM010loadObject> SSM015ManageSSMAsync(SessionInfo sessionInfo, SSM011Object input);
        Task<SSM010loadObject> SSM019OnloadSSMAsync(SessionInfo sessionInfo, SSM011Object input);
        Task<OperationStatus> SSM019SSMSaveAsync(SessionInfo sessionInfo, SSM019Object input);

        Task<SSM140loadObject> SSM140OnloadSrchAsync(SessionInfo sessionInfo, SSM140DstrbnObject input);
        Task<SSM011BlurObject> SSM140StationBlurAsync(SessionInfo sessionInfo, SSM140DstrbnObject input);
        Task<SSM011BlurObject> SSM140ImageBlurSrch(SessionInfo sessionInfo, SSM140DstrbnObject input);
        Task<SSM140DstrbnObject> SSM140GetSelectAsync(SessionInfo sessionInfo, SSM140DstrbnObject input);
        Task<OperationStatus> SSM140DistrbtnSaveAsync(SessionInfo sessionInfo, SSM140DstrbnObject input, List<IFormFile> files);

        Task<OperationStatus> SSM016SaveCopyAsync(SessionInfo sessionInfo, SSM010Object input);

        Task<PageInfo<SSM010Object>> SSM017GetOnloadAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<SSM010Object> SSM017BlurSrchAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<PageInfo<SSM010Object>> SSM017GetSelectDataAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<OperationStatus> SSM017SaveDeleteDataAsync(SessionInfo sessionInfo, SSM010Object input);

        Task<SSM018loadObject> SSM018GetOnloadAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<SSM018loadObject> SSM018GetSearchAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<SSM018loadObject> SSM018BlurAsync(SessionInfo sessionInfo, SSM010Object input);
        Task<SSM018Object> SSM018GetSelectDataAsync(SessionInfo sessionInfo, SSM018Object input);
        Task<OperationStatus> SSM018SaveData(SessionInfo sessionInfo, SSM018Object input, List<IFormFile> files);
    }
}

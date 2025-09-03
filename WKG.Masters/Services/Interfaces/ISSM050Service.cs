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
    public interface ISSM050Service : IDisposable
    {
        Task<SSM050loadObject> GetOnloadSrchprod(SessionInfo sessionInfo, SSM050Object input);

        Task<SSM050loadObject> SSM051Gridbinding(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM052OnLoadDataAsync(SessionInfo sessionInfo, SSM050Object input);
        Task<PageInfo<SSM023Object>> SSM052SearchDataAsync(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM052BlurSrchAsync(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM052LoadSelectedData(SessionInfo sessionInfo, SSM050Object input);

        Task<SSM020Object> SSM053GetOnloadEditData(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM020Object> SSM053OnBlurSearch( SessionInfo sessionInfo, SSM050Object input );

        Task<OperationStatus> SSM052SaveDataExcAsync(SessionInfo sessionInfo, SSM050Object input);
        Task<OperationStatus> SSM053SaveDataAsync(SessionInfo sessionInfo, SSM050Object input);

        Task<OperationStatus> SSM051SaveDataImg(SessionInfo sessionInfo, SSM051Overrides input, List<IFormFile> files);

        Task<OperationStatus> SSM051RemoveImage(SessionInfo sessionInfo, SSM020Overrides input);
    }
}

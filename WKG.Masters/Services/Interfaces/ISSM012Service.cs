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
    public interface ISSM012Service : IDisposable
    {
        //SSM012
        Task<SSM012InitLoad> LoadInitData( SessionInfo sessionInfo, SSM012TableFields input );
        Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SSM012TableFields input , List<IFormFile> files );
        //SSm013
        Task<SSM012TableFields> LoadInitData5( SessionInfo sessionInfo, SSM012TableFields input );
        Task<OperationStatus> SaveDataSec5Async( SessionInfo sessionInfo, SSM012TableFields input, List<IFormFile> files );
        Task<OperationStatus> SaveDataSec3Async( SessionInfo sessionInfo, SSM012TableFields input , List<IFormFile> files );
        Task<SSM012TableFields> LoadInitData3( SessionInfo sessionInfo, SSM012TableFields input );
        Task<OperationStatus> SaveDataSec2Async( SessionInfo sessionInfo, SSM012TableFields input , List<IFormFile> files );
        Task<SSM012TableFields> LoadInitDataSec2( SessionInfo sessionInfo, SSM012TableFields input );
        Task<PageInfo<SSM012TableFields>> TablePagination( SessionInfo sessionInfo, SSM012TableFields input );
        Task<SSM012TableFields> TodoExistSec2( SessionInfo sessionInfo, SSM012TableFields input );
        Task<SSM012TableFields> ContentTextExistSec5( SessionInfo sessionInfo, SSM012TableFields input );
        Task<SSM012TableFields> GetProductList( SessionInfo sessionInfo, SSM012TableFields input );
        //SSM014
        Task<PageInfo<SSM014TableFields>> SearchDataAsyncSSM014( SessionInfo sessionInfo, SSM014SearchFields input );
        Task<OperationStatus> SaveDataAsyncSSM014( SessionInfo sessionInfo, SSM014TableFields input );
        Task<SSM014TableFields> LoadDataAsyncSSM014( SessionInfo sessionInfo, SSM014TableFields input );
        Task<OperationStatus> DeleteDataAsyncSSM014( SessionInfo sessionInfo, SSM014TableFields input );
        //SSM023
        Task<SSM012InitLoad> LoadpreviewData(SessionInfo sessionInfo, SSM012TableFields input);
    }
}

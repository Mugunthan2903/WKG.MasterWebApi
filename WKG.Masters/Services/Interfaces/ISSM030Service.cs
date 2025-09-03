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
    public interface ISSM030Service : IDisposable
    {
        Task<SSM030OnloadObject> SearchData030( SessionInfo sessionInfo, SSM030SearchFields input );
        Task<OperationStatus> SaveDataAsync030( SessionInfo sessionInfo, SSM030TableFields input );
        Task<PageInfo<SSM031TableFields>> SearchData031( SessionInfo sessionInfo, SSM031SearchFields input );
        Task<SSM031TableFields> LoadSelectedData031( SessionInfo sessionInfo, SSM031TableFields input );
        Task<OperationStatus> SaveDataAsync031( SessionInfo sessionInfo, SSM031TableFields input );
        Task<PageInfo<SSM032TableFields>> SearchData032( SessionInfo sessionInfo, SSM032SearchFields input );
        Task<SSM032TableFields> LoadSelectedData032( SessionInfo sessionInfo, SSM032TableFields input );
        Task<OperationStatus> SaveDataAsync032( SessionInfo sessionInfo, SSM032TableFields input );
        Task<PageInfo<SSM034TableFields>> SearchData034( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM034TableFields> LoadInitData034( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM034TableFields> LoadSelectedData034( SessionInfo sessionInfo, SSM034TableFields input );
        Task<OperationStatus> SaveDataAsyncSSM034( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM034TableFields> SSM034BlurAsync( SessionInfo sessionInfo, SSM034TableFields input );
        Task<SSM033TableFields> LoadInitData033( SessionInfo sessionInfo, SSM033TableFields input );
        Task<OperationStatus> SaveDataAsyncSSM033( SessionInfo sessionInfo, SSM033TableFields input, List<IFormFile> files );
        Task<SSM033TableFields> LoadInitData036( SessionInfo sessionInfo, SSM033TableFields input );
        Task<OperationStatus> SaveDataAsyncSSM036( SessionInfo sessionInfo, SSM033TableFields input );
        Task<SSM033TableFields> ProdLangExistSSM036( SessionInfo sessionInfo, SSM033TableFields input );
        Task<OperationStatus> RemoveImage( SessionInfo sessionInfo, SSM033TableFields input );
    }
}

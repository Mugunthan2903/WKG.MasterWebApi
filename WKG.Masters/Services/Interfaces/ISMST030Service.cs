using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISMST030Service : IDisposable
    {
        Task<PageInfo<SMST031TableFields>> SearchData031( SessionInfo sessionInfo, SMST031SearchFields input );
        Task<SMST031TableFields> LoadSelectedData031( SessionInfo sessionInfo, SMST031TableFields input );
        Task<OperationStatus> SaveDataAsync031( SessionInfo sessionInfo, SMST031TableFields input );
        Task<PageInfo<SMST032TableFields>> SearchData032( SessionInfo sessionInfo, SMST032SearchFields input );
        Task<SMST032TableFields> LoadSelectedData032( SessionInfo sessionInfo, SMST032TableFields input );
        Task<OperationStatus> SaveDataAsync032( SessionInfo sessionInfo, SMST032TableFields input );
    }
}

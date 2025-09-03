using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces {
    public interface ISMST010Service : IDisposable {
        Task<SMST010Tables> InitLoadData( SessionInfo sessionInfo, SMST010InputFields input );
        Task<PageInfo<SMST010InputFields>> SearchData( SessionInfo sessionInfo, SMST010SearchFields input );
        Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SMST010InputFields input );
        Task<SMST010InputFields> LoadFormDataAsync( SessionInfo sessionInfo, SMST010InputFields input );
        Task<List<SMST010InputFields>> InitLoadDataConfig( SessionInfo sessionInfo, SMST010InputFields input );
        Task<OperationStatus> SaveConfigDataAsync( SessionInfo sessionInfo, SMST010InputFields input );
        Task<SMST010CheckPrimaryReturn> CheckPrimary( SessionInfo sessionInfo, SMST010InputFields input );
    }
}

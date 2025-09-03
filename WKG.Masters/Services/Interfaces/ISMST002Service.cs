using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces {
    public interface ISMST002Service: IDisposable {
        Task<PageInfo<SMST002TableFields>> GetSearchDataAsync( SessionInfo sessionInfo, SMST002SearchInputs input );
        Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SMST002TableFields input );
        Task<SMST002TableFields> ModifyDataAsync( SessionInfo sessionInfo, SMST002PopulateFormId input );
        Task<SMST002CheckPrimaryReturn> CheckPrimary( SessionInfo sessionInfo, SMST002TableFields input );
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISMST004Service : IDisposable
    {
        Task<SMST004Obj> Getsuppliercombo(SessionInfo sessionInfo, SMST004Obj input);
        Task<List<SMST004Obj>> EdittabledataAsync(SessionInfo sessionInfo, SMST004Obj input);
        Task<OperationStatus> PosSaveAsync(SessionInfo sessionInfo, SMST004Obj input);

        Task<SMST004Obj> Getsupposconfigdata(SessionInfo sessionInfo, SMST004Obj input);

        Task<OperationStatus> PosconfigSaveAsync(SessionInfo sessionInfo, SMST004Obj input);
    }
}

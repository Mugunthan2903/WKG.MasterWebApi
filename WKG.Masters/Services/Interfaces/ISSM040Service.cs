using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM040Service : IDisposable
    {
        Task<SSM040Object> GetComboSearchAsync(SessionInfo sessionInfo, SSM040Object input);
        Task<string> GetSearchrecordAsync(SessionInfo sessionInfo, SSM040Object input);
        Task<OperationStatus> SaveDataAsync(SessionInfo sessionInfo, SSM040Object input);

    }
}
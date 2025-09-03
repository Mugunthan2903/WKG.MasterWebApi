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
    public interface ISSM150Service : IDisposable
    {
        Task<SSM150loadObject> SSM150OnloadSearch(SessionInfo sessionInfo, SSM150Object input);
        Task<OperationStatus> SSM150DifferentialSaveGrid(SessionInfo sessionInfo, SSM150Object input);
        Task<SSM151loadObject> SSM151OnloadSearch(SessionInfo sessionInfo, SSM151Object input);
        Task<OperationStatus> SSM151FareSaveGrid(SessionInfo sessionInfo, SSM151Object input);


    }
}
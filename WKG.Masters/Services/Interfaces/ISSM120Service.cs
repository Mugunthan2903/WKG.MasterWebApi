using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM120Service : IDisposable
    {
       
        Task<SSM120Object> SSM120GetOnload(SessionInfo sessionInfo, SSM120Object input);
        Task<SSM120Object> SSM120GetsearchOnload(SessionInfo sessionInfo, SSM120Object input);
        Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, SSM120GriDdata input);
        //Task<OperationStatus> SaveDataAsync(SessionInfo sessionInfo, SSM120Object input);
        //Task<SSM120OnloadObject> GetSelectAsync(SessionInfo sessionInfo, SSM120Object input);

        //Task<SSM120OnloadObject> BlurAsync(SessionInfo sessionInfo, SSM120Object input);
        //


    }
}

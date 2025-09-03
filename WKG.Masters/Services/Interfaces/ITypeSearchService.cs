using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ITypeSearchService : IDisposable
    {
        Task<List<SSM101WKGCityList>> RPSCityTypeAndSearch(SessionInfo sessionInfo, SSM101WKGCityList input);
        Task<List<TypeAndSrchObject>> DistribusionStationTypeAndSrch(SessionInfo sessionInfo, TypeAndSrchObject input);
        Task<List<CombSrchObject>> CombinationStationTypeAndSrch(SessionInfo sessionInfo, CombSrchObject input);
    }
}

using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TypeSearchController : WKLBaseController
    {
        #region Private Elements

        private readonly ITypeSearchService _service;

        #endregion
        #region Constructor

        public TypeSearchController(ITypeSearchService service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods

        [HttpPost("RPSCityTypeAndSearch")]
        public async Task<List<SSM101WKGCityList>> RPSCityTypeAndSearch([FromBody] SSM101WKGCityList input)
        {
            return await this._service.RPSCityTypeAndSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("DistribusionStationTypeAndSrch")]
        public async Task<List<TypeAndSrchObject>> DistribusionStationTypeAndSrch([FromBody] TypeAndSrchObject input)
        {
            return await this._service.DistribusionStationTypeAndSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("CombinationStationTypeAndSrch")]
        public async Task<List<CombSrchObject>> CombinationStationTypeAndSrch([FromBody] CombSrchObject input)
        {
            return await this._service.CombinationStationTypeAndSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
        

    }
}

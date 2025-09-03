using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SMST030Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISMST030Service _service;

        #endregion

        #region Constructor

        public SMST030Controller( ISMST030Service service )
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SMST031SearchAsync")]
        public async Task<PageInfo<SMST031TableFields>> SearchData031( [FromBody] SMST031SearchFields input )
        {
            return await this._service.SearchData031(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST031LoadSelectedDataAsync")]
        public async Task<SMST031TableFields> LoadSelectedData031( [FromBody] SMST031TableFields input )
        {
            return await this._service.LoadSelectedData031(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST031SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync031( [FromBody] SMST031TableFields input )
        {
            return await this._service.SaveDataAsync031(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST032SearchAsync")]
        public async Task<PageInfo<SMST032TableFields>> SearchData032( [FromBody] SMST032SearchFields input )
        {
            return await this._service.SearchData032(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST032LoadSelectedDataAsync")]
        public async Task<SMST032TableFields> LoadSelectedData032( [FromBody] SMST032TableFields input )
        {
            return await this._service.LoadSelectedData032(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST032SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync032( [FromBody] SMST032TableFields input )
        {
            return await this._service.SaveDataAsync032(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

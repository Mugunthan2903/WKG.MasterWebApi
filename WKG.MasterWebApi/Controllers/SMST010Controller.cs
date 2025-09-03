using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class SMST010Controller : WKLBaseController {
        #region Private Elements

        private readonly ISMST010Service _service;

        #endregion

        #region Constructor

        public SMST010Controller( ISMST010Service service ) {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SMST010InitLoadDataAsync")]
        public async Task<SMST010Tables> InitLoadData( [FromBody] SMST010InputFields input ) {
            return await this._service.InitLoadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST010SearchDataAsync")]
        public async Task<PageInfo<SMST010InputFields>> SearchData( [FromBody] SMST010SearchFields input ) {
            return await this._service.SearchData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST010SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync( [FromBody] SMST010InputFields input ) {
            return await this._service.SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST010LoadFormDataAsync")]
        public async Task<SMST010InputFields> LoadFormDataAsync( [FromBody] SMST010InputFields input ) {
            return await this._service.LoadFormDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST010InitLoadDataConfigAsync")]
        public async Task<List<SMST010InputFields>> InitLoadDataConfig( [FromBody] SMST010InputFields input ) {
            return await this._service.InitLoadDataConfig(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST010SaveConfigDataAsync")]
        public async Task<OperationStatus> SaveConfigDataAsync( [FromBody] SMST010InputFields input ) {
            return await this._service.SaveConfigDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST010CheckPrimaryAsync")]
        public async Task<SMST010CheckPrimaryReturn> CheckPrimary( [FromBody] SMST010InputFields input )
        {
            return await this._service.CheckPrimary(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

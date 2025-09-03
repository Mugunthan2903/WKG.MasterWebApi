using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class SMST002Controller : WKLBaseController {
        #region Private Elements

        private readonly ISMST002Service _service;

        #endregion

        #region Constructor

        public SMST002Controller( ISMST002Service service ) {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SMST002GetSearchDataAsync")]
        public async Task<PageInfo<SMST002TableFields>> GetSearchDataAsync( [FromBody] SMST002SearchInputs input ) { 
            return await this._service.GetSearchDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST002GetSaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync( [FromBody] SMST002TableFields input ) {
            return await this._service.SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST002ModifyDataAsync")]
        public async Task<SMST002TableFields> ModifyDataAsync( [FromBody] SMST002PopulateFormId input ) {
            return await this._service.ModifyDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST002CheckPrimaryAsync")]
        public async Task<SMST002CheckPrimaryReturn> CheckPrimary( [FromBody] SMST002TableFields input )
        {
            return await this._service.CheckPrimary(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

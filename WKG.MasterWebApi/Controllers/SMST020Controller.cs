using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SMST020Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISMST020Service _service;

        #endregion

        #region Constructor

        public SMST020Controller(ISMST020Service service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods

        [HttpPost("SMST020GetTuiProductsAsync")]
        public async Task<PageInfo<SMST020Object>> GetTuiProductsAsync([FromBody] SMST020Object input)
        {
            return await this._service.GetTuiProductsAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST020SaveAsync")]
        public async Task<OperationStatus> SaveTuiAsync([FromBody] SMST020Object input)
        {
            return await this._service.SaveTuiAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST020_Srchcmbproduct")]
        public async Task<SMST020Object> GetSrchcmbproduct([FromBody] SMST020Object input)
        {
            return await this._service.GetSrchcmbproduct(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST023_Combobinding")]
        public async Task<SMST020Object> GetCombobinding([FromBody] SMST020Object input)
        {
            return await this._service.GetCombobinding(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST022_SearchDataAsync")]
        public async Task<PageInfo<SMST022TableFields>> SearchData( [FromBody] SMST022SearchInputs input )
        {
            return await this._service.SearchData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST022_SaveCategoryAsync")]
        public async Task<OperationStatus> SaveCategoryAsync( [FromBody] SMST022TableFields input )
        {
            return await this._service.SaveCategoryAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST022_LoadFormDataAsync")]
        public async Task<SMST022TableFields> LoadFormDataAsync( [FromBody] SMST022TableFields input )
        {
            return await this._service.LoadFormDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }

}

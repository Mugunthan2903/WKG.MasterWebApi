using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM020Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM020Service _service;

        #endregion
        #region Constructor

        public SSM020Controller(ISSM020Service service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods

        [HttpPost("SSM020GetTuiProductsAsync")]
        public async Task<PageInfo<SSM020Object>> GetTuiProductsAsync([FromBody] SSM020Object input)
        {
            return await this._service.GetTuiProductsAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM021GetEditTUICity")]
        public async Task<SSM020Object> SSM021GetEditTUICity([FromBody] SSM020Object input)
        {
            return await this._service.SSM021GetEditTUICity(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM020SaveAsync")]
        public async Task<OperationStatus> SaveTuiAsync([FromBody] SSM020Object input)
        {
            return await this._service.SaveTuiAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM020_Srchcmbproduct")]
        public async Task<SSM020Object> GetSrchcmbproduct([FromBody] SSM020Object input)
        {
            return await this._service.GetSrchcmbproduct(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM025Newseconloadcmb")]
        public async Task<SSM020Object> GetNewdatasectwo([FromBody] SSM020Object input)
        {
            return await this._service.GetNewdatasectwo(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM025OnBlurSearch")]
        public async Task<SSM020Object> SSM025OnBlurSearch([FromBody] SSM020Object input)
        {
            return await this._service.SSM025OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM023_Combobinding")]
        public async Task<SSM020Object> GetCombobinding([FromBody] SSM020Object input)
        {
            return await this._service.GetCombobinding(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM022OnloadAsync")]
        public async Task<SSM020OnloadObject> SSM022GetOnloadAsync([FromBody] SSM022SearchInputs input)
        {
            return await this._service.SSM022GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM022SearchDataAsync")]
        public async Task<PageInfo<SSM022Object>> SearchData( [FromBody] SSM022SearchInputs input )
        {
            return await this._service.SearchData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM022SaveCategoryAsync")]
        public async Task<OperationStatus> SaveCategoryAsync( [FromBody] SSM022Object input )
        {
            return await this._service.SaveCategoryAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM022LoadFormDataAsync")]
        public async Task<SSM022Object> LoadFormDataAsync( [FromBody] SSM022Object input )
        {
            return await this._service.LoadFormDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM023OnLoadDataAsync")]
        public async Task<SSM023Object> SSM023OnLoadDataAsync( [FromBody] SSM023Object input )
        {
            return await this._service.SSM023OnLoadDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM023SearchDataAsync")]
        public async Task<PageInfo<SSM023Object>> SSM023SearchDataAsync([FromBody] SSM023Object input)
        {
            return await this._service.SSM023SearchDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM023BlurSrchAsync")]
        public async Task<SSM023Object> SSM023BlurSrchAsync([FromBody] SSM023Object input)
        {
            return await this._service.SSM023BlurSrchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM023LoadSelectedData")]
        public async Task<SSM023Object> SSM023LoadSelectedData([FromBody] SSM023Object input)
        {
            return await this._service.SSM023LoadSelectedData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM023SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsyncSSM023( [FromBody] SSM023Object input )
        {
            return await this._service.SaveDataAsyncSSM023(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM024SaveDataSectionconfigandimg")]
        public async Task<OperationStatus> SaveDataSectionconfigandimg([FromBody] SSM020Overrides input)
        {
            return await this._service.SaveDataSectionconfigandimg(this.GetSessionInfo(), input ).ConfigureAwait(false);
        }
        [HttpPost("SSM024SaveDataSectionEdit")]
        public async Task<OperationStatus> SaveDataSectionEdit([FromBody] SSM020Overrides input, List<IFormFile> files)
        {
            return await this._service.SaveDataSectionEdit(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM024RemoveImage")]
        public async Task<OperationStatus> RemoveImage([FromBody] SSM020Overrides input)
        {
            return await this._service.RemoveImage(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }

}

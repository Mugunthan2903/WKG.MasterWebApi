using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM060Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM060Service _service;

        #endregion
        #region Constructor

        public SSM060Controller(ISSM060Service service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods

        [HttpPost("SSM060GetOnloadScrh")]
        public async Task<SSM060LoadObject> GetOnloadSrch([FromBody] SSM060Object input)
        {
            return await this._service.GetOnloadSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM061OnLoadDataAsync")]
        public async Task<SSM060LoadObject> SSM061OnLoadDataAsync([FromBody] SSM060Object input)
        {
            return await this._service.SSM061OnLoadDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM062SearchDataAsync")]
        public async Task<PageInfo<SSM034TableFields>> SSM062SearchData( [FromBody] SSM034TableFields input )
        {
            return await this._service.SSM062SearchData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM062LoadSelectedDataAsync")]
        public async Task<SSM034TableFields> SSM062LoadSelectedData( [FromBody] SSM034TableFields input )
        {
            return await this._service.SSM062LoadSelectedData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM062LoadInitDataAsync")]
        public async Task<SSM034TableFields> SSM062LoadInitData( [FromBody] SSM034TableFields input )
        {
            return await this._service.SSM062LoadInitData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM062BlurAsyncAsync")]
        public async Task<SSM034TableFields> SSM062BlurAsync( [FromBody] SSM034TableFields input )
        {
            return await this._service.SSM062BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM063OnloadData")]
        public async Task<SSM020Object> SSM063GetOnloadData([FromBody] SSM060Object input)
        {
            return await this._service.SSM063GetOnloadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM063OnBlurSearch")]
        public async Task<SSM020Object> SSM063OnBlurSearch( [FromBody] SSM020Object input )
        {
            return await this._service.SSM063OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM064OnLoadData")]
        public async Task<SSM064loadObject> SSM064OnLoadData([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM064OnLoadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM065OnLoadData")]
        public async Task<SSM064loadObject> SSM065GetOnloadData([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM065GetOnloadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM060SaveExcDataAsync")]
        public async Task<OperationStatus> SSM060SaveExcDataAsync([FromBody] SSM062Object input)
        {
            return await this._service.SSM060SaveExcDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM061SaveDataAsync")]
        public async Task<OperationStatus> SSM061SaveDataAsync( [FromBody] SSM060Object input )
        {
            return await this._service.SSM061SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM063SaveDataAsync")]
        public async Task<OperationStatus> SSM063SaveDataAsync([FromBody] SSM062Object input)
        {
            return await this._service.SSM063SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM064SaveImageData")]
        public async Task<OperationStatus> SSM064SaveImageData([FromBody] SSM064Image input, List<IFormFile> files)
        {
            return await this._service.SSM064SaveImageData(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM065SaveDataAsync")]
        public async Task<OperationStatus> SSM065SaveDataAsync([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM065SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM065OnBlurSearch")]
        public async Task<SSM064GridObject> SSM065OnBlurSearch([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM065OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM064RemoveImage")]
        public async Task<OperationStatus> SSM064RemoveImage([FromBody] SSM064Image input)
        {
            return await this._service.SSM064RemoveImage(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM065DeleteData")]
        public async Task<OperationStatus> SSM065DeleteData( [FromBody] SSM064GridObject input )
        {
            return await this._service.SSM065DeleteData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

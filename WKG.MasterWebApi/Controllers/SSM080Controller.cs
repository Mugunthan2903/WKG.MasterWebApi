using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM080Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM080Service _service;

        #endregion
        #region Constructor

        public SSM080Controller(ISSM080Service service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods

        [HttpPost("SSM080GetOnloadScrh")]
        public async Task<SSM060LoadObject> SSM080GetOnloadSrch([FromBody] SSM060Object input)
        {
            return await this._service.SSM080GetOnloadSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM081OnLoadDataAsync")]
        public async Task<SSM060LoadObject> SSM081OnLoadDataAsync([FromBody] SSM060Object input)
        {
            return await this._service.SSM081OnLoadDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM082LoadInitDataAsync")]
        public async Task<SSM034TableFields> SSM082LoadInitData([FromBody] SSM034TableFields input)
        {
            return await this._service.SSM082LoadInitData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM082BlurAsync")]
        public async Task<SSM034TableFields> SSM082BlurAsync([FromBody] SSM034TableFields input)
        {
            return await this._service.SSM082BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM082SearchDataAsync")]
        public async Task<PageInfo<SSM034TableFields>> SSM082SearchData([FromBody] SSM034TableFields input)
        {
            return await this._service.SSM082SearchData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM082LoadSelectedDataAsync")]
        public async Task<SSM034TableFields> SSM082LoadSelectedData([FromBody] SSM034TableFields input)
        {
            return await this._service.SSM082LoadSelectedData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM083OnloadData")]
        public async Task<SSM020Object> SSM083GetOnloadData([FromBody] SSM060Object input)
        {
            return await this._service.SSM083GetOnloadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM083OnBlurSearch")]
        public async Task<SSM020Object> SSM083OnBlurSearch([FromBody] SSM020Object input)
        {
            return await this._service.SSM083OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM084OnLoadData")]
        public async Task<SSM064loadObject> SSM084OnLoadData([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM084OnLoadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM085OnLoadData")]
        public async Task<SSM064loadObject> SSM085GetOnloadData([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM085GetOnloadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM085OnBlurSearch")]
        public async Task<SSM064GridObject> SSM085OnBlurSearch([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM085OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM080SaveExcDataAsync")]
        public async Task<OperationStatus> SSM080SaveExcDataAsync([FromBody] SSM062Object input)
        {
            return await this._service.SSM080SaveExcDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM081SaveDataAsync")]
        public async Task<OperationStatus> SSM081SaveDataAsync([FromBody] SSM060Object input)
        {
            return await this._service.SSM081SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM083SaveDataAsync")]
        public async Task<OperationStatus> SSM083SaveDataAsync([FromBody] SSM062Object input)
        {
            return await this._service.SSM083SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM084SaveImageData")]
        public async Task<OperationStatus> SSM084SaveImageData([FromBody] SSM064Image input, List<IFormFile> files)
        {
            return await this._service.SSM084SaveImageData(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM085SaveDataAsync")]
        public async Task<OperationStatus> SSM085SaveDataAsync([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM085SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM085DeleteData")]
        public async Task<OperationStatus> SSM085DeleteData([FromBody] SSM064GridObject input)
        {
            return await this._service.SSM085DeleteData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

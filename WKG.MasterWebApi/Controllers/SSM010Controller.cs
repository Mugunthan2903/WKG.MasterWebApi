using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM010Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM010Service _service;

        #endregion

        #region Constructor

        public SSM010Controller(ISSM010Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SSM010OnloadAsync")]
        public async Task<SSM010loadObject> SSM010GetOnloadAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM010GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM010BlurAsync")]
        public async Task<SSM010BlurObject> SSM010BlurAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM010BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM010SearchAsync")]
        public async Task<PageInfo<SSM010Object>> SSM010GetSearchAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM010GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM010SelectAsync")]
        public async Task<SSM010loadObject> SSM010GetSelectAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM010GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM010SaveAsync")]
        public async Task<OperationStatus> SSM010SaveAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM010SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM011SearchAsync")]
        public async Task<SSM011loadObject> SSM011GetSearchAsync([FromBody] SSM011Object input)
        {
            return await this._service.SSM011GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM011BlurAsync")]
        public async Task<SSM011BlurObject> SSM011BlurAsync([FromBody] SSM011Object input)
        {
            return await this._service.SSM011BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM011SaveAsync")]
        public async Task<OperationStatus> SSM011SaveAsync([FromBody] SSM011Object input, List<IFormFile> files)
        {
            return await this._service.SSM011SaveAsync(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM011GridAsync")]
        public async Task<SSM011GridSSMObject> SSM011GridAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM011GridAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM015ManageSSMAsync")]
        public async Task<SSM010loadObject> SSM015ManageSSMAsync([FromBody] SSM011Object input)
        {
            return await this._service.SSM015ManageSSMAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM016SaveCopyAsync")]
        public async Task<OperationStatus> SSM016SaveCopyAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM016SaveCopyAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM017GetOnloadSrchAsync")]
        public async Task<PageInfo<SSM010Object>> SSM017GetOnloadAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM017GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM017BlurSrchAsync")]
        public async Task<SSM010Object> SSM017BlurSrchAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM017BlurSrchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM017GetSelectDataAsync")]
        public async Task<PageInfo<SSM010Object>> SSM017GetSelectDataAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM017GetSelectDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM017SaveDeleteDataAsync")]
        public async Task<OperationStatus> SSM017SaveDeleteDataAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM017SaveDeleteDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM018GetOnloadAsync")]
        public async Task<SSM018loadObject> SSM018GetOnloadAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM018GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM018GetSearchAsync")]
        public async Task<SSM018loadObject> SSM018GetSearchAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM018GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM018BlurAsync")]
        public async Task<SSM018loadObject> SSM018BlurAsync([FromBody] SSM010Object input)
        {
            return await this._service.SSM018BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM018GetSelectDataAsync")]
        public async Task<SSM018Object> SSM018GetSelectDataAsync([FromBody] SSM018Object input)
        {
            return await this._service.SSM018GetSelectDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM018SaveData")]
        public async Task<OperationStatus> SSM018SaveData([FromBody] SSM018Object input, List<IFormFile> files)
        {
            return await this._service.SSM018SaveData(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM019OnloadSSMAsync")]
        public async Task<SSM010loadObject> SSM019OnloadSSMAsync([FromBody] SSM011Object input)
        {
            return await this._service.SSM019OnloadSSMAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM019SSMSaveAsync")]
        public async Task<OperationStatus> SSM019SSMSaveAsync([FromBody] SSM019Object input)
        {
            return await this._service.SSM019SSMSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM140OnloadSrchAsync")]
        public async Task<SSM140loadObject> SSM140OnloadSrchAsync([FromBody] SSM140DstrbnObject input)
        {
            return await this._service.SSM140OnloadSrchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM140StationBlurAsync")]
        public async Task<SSM011BlurObject> SSM140StationBlurAsync([FromBody] SSM140DstrbnObject input)
        {
            return await this._service.SSM140StationBlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM140ImageBlurSrch")]
        public async Task<SSM011BlurObject> SSM140ImageBlurSrch([FromBody] SSM140DstrbnObject input)
        {
            return await this._service.SSM140ImageBlurSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM140GetSelectAsync")]
        public async Task< SSM140DstrbnObject> SSM140GetSelectAsync([FromBody] SSM140DstrbnObject input)
        {
            return await this._service.SSM140GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM140DistrbtnSaveAsync")]
        public async Task<OperationStatus> SSM140DistrbtnSaveAsync([FromBody] SSM140DstrbnObject input, List<IFormFile> files)
        {
            return await this._service.SSM140DistrbtnSaveAsync(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        #endregion
    }
}

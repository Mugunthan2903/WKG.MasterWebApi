using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM070Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM070Service _service;

        #endregion
        #region Constructor

        public SSM070Controller( ISSM070Service service )
        {
            this._service = service;
        }
        #endregion
        #region Public Methods
        [HttpPost("SSM070GetOnloadAsync")]
        public async Task<SSM070loadObject> SSM070GetOnloadAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM070GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM070GetSearchAsync")]
        public async Task<SSM070loadObject> SSM070GetSearchAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM070GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM070GetSelectAsync")]
        public async Task<SSM070loadObject> SSM070GetSelectAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM070GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM070SaveAsync")]
        public async Task<OperationStatus> SSM070SaveAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM070SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM071GetOnloadAsync")]
        public async Task<SSM070loadObject> SSM071GetOnloadAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM071GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM071GetSearchAsync")]
        public async Task<SSM070loadObject> SSM071GetSearchAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM071GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM071GetSelectAsync")]
        public async Task<SSM070loadObject> SSM071GetSelectAsync([FromBody] SSM070Object input)
        {
            return await this._service.SSM071GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM071SaveAsync")]
        public async Task<OperationStatus> SSM071SaveAsync( [FromBody] SSM070Object input )
        {
            return await this._service.SSM071SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM071CheckPosExist")]
        public async Task<SSM070loadObject> SSM071CheckPosExistAsync( [FromBody] SSM070Object input )
        {
            return await this._service.SSM071CheckPosExistAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

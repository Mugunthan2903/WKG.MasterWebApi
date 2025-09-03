using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM090Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM090Service _service;

        #endregion

        #region Constructor

        public SSM090Controller(ISSM090Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods 

        [HttpPost("SSM090OnloadAsync")]
        public async Task<SSM090OnloadObject> SSM090OnloadAsync([FromBody] SSM090Object input)
        {
            return await this._service.SSM090OnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM090GetSearchAsync")]
        public async Task<SSM090OnloadObject> SSM090GetSearchAsync([FromBody] SSM090Object input)
        {
            return await this._service.SSM090GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM090GetSelectAsync")]
        public async Task<SSM090OnloadObject> SSM090GetSelectAsync([FromBody] SSM090Object input)
        {
            return await this._service.SSM090GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM090BlurAsync")]
        public async Task<SSM090OnloadObject> SSM090BlurAsync([FromBody] SSM090Object input)
        {
            return await this._service.SSM090BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM090SaveDataAsync")]
        public async Task<OperationStatus> SSM090SaveDataAsync([FromBody] SSM090Object input, List<IFormFile> files)
        {
            return await this._service.SSM090SaveDataAsync(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        #endregion
    }
}

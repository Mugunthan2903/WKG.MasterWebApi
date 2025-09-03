using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM110Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM110Service _service;

        #endregion

        #region Constructor

        public SSM110Controller(ISSM110Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods 

        [HttpPost("SSM110OnloadAsync")]
        public async Task<SSM110OnloadObject> SSM110OnloadAsync([FromBody] SSM110Object input)
        {
            return await this._service.SSM110OnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM110GetSelectAsync")]
        public async Task<SSM110OnloadObject> GetSelectAsync([FromBody] SSM110Object input)
        {
            return await this._service.GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST110BlurAsync")]
        public async Task<SSM110OnloadObject> BlurAsync([FromBody] SSM110Object input)
        {
            return await this._service.BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM110SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync([FromBody] SSM110Object input)
        {
            return await this._service.SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
       
        #endregion
    }
}

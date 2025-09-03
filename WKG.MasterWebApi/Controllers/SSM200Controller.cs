using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM200Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM200Service _service;

        #endregion

        #region Constructor

        public SSM200Controller(ISSM200Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SSM200OnloadAsync")]
        public async Task<SSM200loadObject> SSM200GetOnloadAsync([FromBody] SSM200Object input)
        {
            return await this._service.SSM200GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM200BlurAsync")]
        public async Task<SSM200BlurObject> SSM200BlurAsync([FromBody] SSM200Object input)
        {
            return await this._service.SSM200BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM200SearchAsync")]
        public async Task<PageInfo<SSM200Object>> SSM200GetSearchAsync([FromBody] SSM200Object input)
        {
            return await this._service.SSM200GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM200SelectAsync")]
        public async Task<SSM200loadObject> SSM200GetSelectAsync([FromBody] SSM200Object input)
        {
            return await this._service.SSM200GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM200SaveAsync")]
        public async Task<OperationStatus> SSM200SaveAsync([FromBody] SSM200Object input)
        {
            return await this._service.SSM200SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}
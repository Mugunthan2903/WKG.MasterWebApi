using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM120Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM120Service _service;

        #endregion

        #region Constructor

        public SSM120Controller(ISSM120Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods 

        [HttpPost("SSM120OnloadAsync")]
        public async Task<SSM120Object> SSM120GetOnload([FromBody] SSM120Object input)
        {
            return await this._service.SSM120GetOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM120GetProductSearch")]
        public async Task<SSM120Object> SSM120GetsearchOnload([FromBody] SSM120Object input)
        {
            return await this._service.SSM120GetsearchOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM120SaveAsync")]
        public async Task<OperationStatus>SaveAsync([FromBody] SSM120GriDdata input)
        {
            return await this._service.SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        //[HttpPost("SSM120GetSelectAsync")]
        //public async Task<SSM120OnloadObject> GetSelectAsync([FromBody] SSM120Object input)
        //{
        //    return await this._service.GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        //}

        //[HttpPost("SMST110BlurAsync")]
        //public async Task<SSM120OnloadObject> BlurAsync([FromBody] SSM120Object input)
        //{
        //    return await this._service.BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        //}
        //[HttpPost("SSM120SaveDataAsync")]
        //public async Task<OperationStatus> SaveDataAsync([FromBody] SSM120Object input)
        //{
        //    return await this._service.SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        //}

        #endregion
    }
}

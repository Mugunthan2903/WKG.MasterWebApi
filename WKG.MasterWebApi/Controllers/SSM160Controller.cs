using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM160Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM160Service _service;

        #endregion

        #region Constructor

        public SSM160Controller(ISSM160Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods 

        [HttpPost("SSM160OnloadAsync")]
        public async Task<SSM160OnloadObject> SSM160OnloadAsync([FromBody] SSM160Object input)
        {
            return await this._service.SSM160OnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM160GetSearchAsync")]
        public async Task<SSM160OnloadObject> SSM160GetSearchAsync([FromBody] SSM160Object input)
        {
            return await this._service.SSM160GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM160GetSelectAsync")]
        public async Task<SSM160OnloadObject> SSM160GetSelectAsync([FromBody] SSM160Object input)
        {
            return await this._service.SSM160GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        
        [HttpPost("SSM160GetSelectDefaultcheck")]
        public async Task<SSM160OnloadObject> SSM160GetSelectDefaultcheck([FromBody] SSM160Object input)
        {
            return await this._service.SSM160GetSelectDefaultcheck(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM160SaveDataAsync")]
        public async Task<OperationStatus> SSM160SaveDataAsync([FromBody] SSM160Object input)
        {
            return await this._service.SSM160SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }




        [HttpPost("SSM161SearchrecordAsync")]
        public async Task<SSM160OnloadObject> SSM161SearchrecordAsync([FromBody] SSM160Object input)
        {
            return await this._service.SSM161SearchrecordAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM161SaveDataAsync")]
        public async Task<OperationStatus> SSM161SaveDataAsync([FromBody] SSM160Object input)
        {
            return await this._service.SSM161SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    
        [Route("api/[controller]")]
        [ApiController]
        public class SSM005Controller : WKLBaseController
        {
            #region Private Elements

            private readonly ISSM005Service _service;

            #endregion

            #region Constructor

            public SSM005Controller(ISSM005Service service)
            {
                this._service = service;
            }

        #endregion

        #region Public Methods

        [HttpPost("SSM005OnloadAsync")]
        public async Task<SSM005loadObject> SSM005GetOnloadAsync([FromBody] SSM005Object input)
        {
            return await this._service.SSM005GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM005SearchAsync")]
        public async Task<PageInfo<SSM005Object>> SSM005GetSearchAsync([FromBody] SSM005Object input)
        {
            return await this._service.SSM005GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM005SaveAsync")]
        public async Task<OperationStatus> SSM005SaveAsync([FromBody] SSM005Object input)
        {
            return await this._service.SSM005SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}


using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM040Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM040Service _service;

        #endregion

        #region Constructor

        public SSM040Controller(ISSM040Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SSM040ComboSearchAsync")]
        public async Task<SSM040Object> GetComboSearchAsync([FromBody] SSM040Object input)
        {
            return await this._service.GetComboSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM040SearchrecordAsync")]
        public async Task<string> GetSearchrecordAsync([FromBody] SSM040Object input)
        {
            return await this._service.GetSearchrecordAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM040SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync([FromBody] SSM040Object input)
        {
            return await this._service.SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

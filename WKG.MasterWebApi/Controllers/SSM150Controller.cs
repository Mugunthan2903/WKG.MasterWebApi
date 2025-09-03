using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM150Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM150Service _service;

        #endregion

        #region Constructor

        public SSM150Controller(ISSM150Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods SSM150

        [HttpPost("SSM150OnloadSearch")]
        public async Task<SSM150loadObject> SSM150OnloadSearch([FromBody] SSM150Object input)
        {
            return await this._service.SSM150OnloadSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM150DifferentialSaveGrid")]
        public async Task<OperationStatus> SSM150DifferentialSaveGrid([FromBody] SSM150Object input)
        {
            return await this._service.SSM150DifferentialSaveGrid(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion


        #region Public Methods SSM151

        [HttpPost("SSM151OnloadSearch")]
        public async Task<SSM151loadObject> SSM151OnloadSearch([FromBody] SSM151Object input)
        {
            return await this._service.SSM151OnloadSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM151FareSaveGrid")]
        public async Task<OperationStatus> SSM151FareSaveGrid([FromBody] SSM151Object input)
        {
            return await this._service.SSM151FareSaveGrid(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion


    }
}

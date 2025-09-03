using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SMST001Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISMST001Service _service;

        #endregion

        #region Constructor

        public SMST001Controller(ISMST001Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SMST001SearchAsync")]
        public async Task<PageInfo<SMST001Object>> GetProductsAsync([FromBody] SearchInput input)
        {
            return await this._service.GetProductsAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST001SaveAsync")]
        public async Task<OperationStatus> PosSaveAsync([FromBody] SMST001Object input)
        {
            return await this._service.PosSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SMST003Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISMST003Service _service;

        #endregion

        #region Constructor

        public SMST003Controller(ISMST003Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SMST003OnloadAsync")]
        public async Task<SMST003loadObject> GetOnloadAsync([FromBody] SMST003Object input)
        {
            return await this._service.GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST003BlurSearchAsync")]
        public async Task<SMST003BlurObject> BlurSearchAsync([FromBody] SMST003Object input)
        {
            return await this._service.BlurSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST003SearchAsync")]
        public async Task<PageInfo<SMST003Object>> GetSearchAsync([FromBody] SMST003Object input)
        {
            return await this._service.GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST003ProductsAsync")]
        public async Task<List<SMST003Object>> GetProductsAsync([FromBody] SMST003Object input)
        {
            return await this._service.GetProductsAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST003SaveAsync")]
        public async Task<OperationStatus> SaveAsync([FromBody] SMST003Object input)
        {
            return await this._service.SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

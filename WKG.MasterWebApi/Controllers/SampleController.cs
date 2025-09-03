using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using Microsoft.AspNetCore.Mvc;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SampleController : WKLBaseController
    {
        #region Private Elements

        private readonly ISampleService _service;

        #endregion

        #region Constructor

        public SampleController(ISampleService service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("GetPageDataAsync")]
        public async Task<PageInfo<BaseObject<string>>> GetPageDataAsync([FromBody] ProductObject.PageSearchInfo input)
        {
            return await this._service.GetPageDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("GetSearchDataAsync")]
        public async Task<List<BaseObject<string>>> GetSearchDataAsync([FromBody] ProductObject.SimpleSearchInput input)
        {
            return await this._service.GetSearchDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("GetProductsAsync")]
        public async Task<List<ProductObject.Product>> GetProductsAsync([FromBody] ProductObject.SearchInput input)
        {
            return await this._service.GetProductsAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SaveAsync")]
        public async Task<OperationStatus> SaveAsync([FromBody] ProductObject.Product input)
        {
            return await this._service.SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SaveImageAsync")]
        public async Task<OperationStatus> SaveImageAsync([FromBody] ProductObject.Product input, List<IFormFile> files)
        {
            return await this._service.SaveImageAsync(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }

        #endregion
    }
}

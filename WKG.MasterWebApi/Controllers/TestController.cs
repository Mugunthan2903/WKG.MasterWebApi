using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : WKLBaseController {
        #region Private Elements

        private readonly ITestService _service;

        #endregion

        #region Constructor

        public TestController( ITestService service ) {
            this._service = service;
        }

        #endregion

        #region Public Methods
        [HttpPost("TestGetSearchDataAsync")]
        public async Task<PageInfo<SMST002TableFields>> GetSearchDataAsync( [FromBody] SMST002SearchInputs input ) { 
            return await this._service.GetSearchDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("TestSaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync( [FromBody] SMST002TableFields input ) {
            return await this._service.SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("TestOnloadAsync")]
        public async Task<SMST003loadObject> GetOnloadAsync( [FromBody] SMST003Object input ) {
            return await this._service.GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("TestSearchAsync")]
        public async Task<List<SMST003Object>> GetSearchAsync( [FromBody] SMST003Object input ) {
            return await this._service.GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("TestProductsAsync")]
        public async Task<List<SMST003Object>> GetProductsAsync( [FromBody] SMST003Object input ) {
            return await this._service.GetProductsAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("TestSaveAsync")]
        public async Task<OperationStatus> SaveAsync( [FromBody] SMST003Object input ) {
            return await this._service.SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

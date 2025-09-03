using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM030Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM030Service _service;

        #endregion

        #region Constructor

        public SSM030Controller( ISSM030Service service )
        {
            this._service = service;
        }

        #endregion

        #region Public Methods
        [HttpPost("SSM030SearchAsync")]
        public async Task<SSM030OnloadObject> SearchData030( [FromBody] SSM030SearchFields input )
        {
            return await this._service.SearchData030(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM030SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync030( [FromBody] SSM030TableFields input )
        {
            return await this._service.SaveDataAsync030(this.GetSessionInfo(), input).ConfigureAwait(false);

        }
        [HttpPost("SSM031SearchAsync")]
        public async Task<PageInfo<SSM031TableFields>> SearchData031( [FromBody] SSM031SearchFields input )
        {
            return await this._service.SearchData031(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM031LoadSelectedDataAsync")]
        public async Task<SSM031TableFields> LoadSelectedData031( [FromBody] SSM031TableFields input )
        {
            return await this._service.LoadSelectedData031(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM031SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync031( [FromBody] SSM031TableFields input )
        {
            return await this._service.SaveDataAsync031(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM032SearchAsync")]
        public async Task<PageInfo<SSM032TableFields>> SearchData032( [FromBody] SSM032SearchFields input )
        {
            return await this._service.SearchData032(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM032LoadSelectedDataAsync")]
        public async Task<SSM032TableFields> LoadSelectedData032( [FromBody] SSM032TableFields input )
        {
            return await this._service.LoadSelectedData032(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM032SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync032( [FromBody] SSM032TableFields input )
        {
            return await this._service.SaveDataAsync032(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM033LoadInitDataAsync")]
        public async Task<SSM033TableFields> LoadInitData033( [FromBody] SSM033TableFields input )
        {
            return await this._service.LoadInitData033(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM033SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsyncSSM033( [FromBody] SSM033TableFields input, List<IFormFile> files )
        {
            return await this._service.SaveDataAsyncSSM033(this.GetSessionInfo(), input,files).ConfigureAwait(false);
        }
        [HttpPost("SSM034SearchDataAsync")]
        public async Task<PageInfo<SSM034TableFields>> SearchData034( [FromBody] SSM034TableFields input )
        {
            return await this._service.SearchData034(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM034LoadInitData034Async")]
        public async Task<SSM034TableFields> LoadInitData034( [FromBody] SSM034TableFields input )
        {
            return await this._service.LoadInitData034(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM034LoadSelectedDataAsync")]
        public async Task<SSM034TableFields> LoadSelectedData034( [FromBody] SSM034TableFields input )
        {
            return await this._service.LoadSelectedData034(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM034SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsyncSSM034( [FromBody] SSM034TableFields input )
        {
            return await this._service.SaveDataAsyncSSM034(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM034BlurCheck")]
        public async Task<SSM034TableFields> SSM034BlurAsync( [FromBody] SSM034TableFields input )
        {
            return await this._service.SSM034BlurAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM036LoadInitDataAsync")]
        public async Task<SSM033TableFields> LoadInitData036( [FromBody] SSM033TableFields input )
        {
            return await this._service.LoadInitData036(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM036SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsyncSSM036( [FromBody] SSM033TableFields input )
        {
            return await this._service.SaveDataAsyncSSM036(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM036ProdLangExistAsync")]
        public async Task<SSM033TableFields> ProdLangExistSSM036( [FromBody] SSM033TableFields input )
        {
            return await this._service.ProdLangExistSSM036(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM033RemoveImage")]
        public async Task<OperationStatus> RemoveImage( [FromBody] SSM033TableFields input )
        {
            return await this._service.RemoveImage(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

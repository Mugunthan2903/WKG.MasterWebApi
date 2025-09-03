using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM012Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM012Service _service;

        #endregion

        #region Constructor

        public SSM012Controller( ISSM012Service service )
        {
            this._service = service;
        }

        #endregion

        #region Public Methods
        [HttpPost("SSM012InitLoadDataAsync")]
        public async Task<SSM012InitLoad> LoadInitData( [FromBody] SSM012TableFields input )
        {
            return await this._service.LoadInitData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM012SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsync( [FromBody] SSM012TableFields input , List<IFormFile> files )
        {
            return await this._service.SaveDataAsync(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        //SSM013
        [HttpPost("SSM012LoadInitData5Async")]
        public async Task<SSM012TableFields> LoadInitData5( [FromBody] SSM012TableFields input )
        {
            return await this._service.LoadInitData5(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM012ContentTextExistAsync")]
        public async Task<SSM012TableFields> ContentTextExistSec5( [FromBody] SSM012TableFields input )
        {
            return await this._service.ContentTextExistSec5(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM012SaveDataSec5Async")]
        public async Task<OperationStatus> SaveDataSec5Async( [FromBody] SSM012TableFields input, List<IFormFile> files )
        {
            return await this._service.SaveDataSec5Async(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM012SaveDataSec3Async")]
        public async Task<OperationStatus> SaveDataSec3Async( [FromBody] SSM012TableFields input, List<IFormFile> files )
        {
            return await this._service.SaveDataSec3Async(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM012LoadInitData3Async")]
        public async Task<SSM012TableFields> LoadInitData3( [FromBody] SSM012TableFields input )
        {
            return await this._service.LoadInitData3(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM012SaveDataSec2Async")]
        public async Task<OperationStatus> SaveDataSec2Async( [FromBody] SSM012TableFields input , List<IFormFile> files )
        {
            return await this._service.SaveDataSec2Async(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM012LoadInitDataSec2Async")]
        public async Task<SSM012TableFields> LoadInitDataSec2( [FromBody] SSM012TableFields input )
        {
            return await this._service.LoadInitDataSec2(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM012TodoExistSec2Async")]
        public async Task<SSM012TableFields> TodoExistSec2( [FromBody] SSM012TableFields input )
        {
            return await this._service.TodoExistSec2(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM012TablePagination")]
        public async Task<PageInfo<SSM012TableFields>> TablePagination( [FromBody] SSM012TableFields input )
        {
            return await this._service.TablePagination(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM013GetProductList")]
        public async Task<SSM012TableFields> GetProductList( [FromBody] SSM012TableFields input )
        {
            return await this._service.GetProductList(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        //SSM014
        [HttpPost("SSM014SearchDataAsync")]
        public async Task<PageInfo<SSM014TableFields>> SearchDataAsyncSSM014( [FromBody] SSM014SearchFields input )
        {
            return await this._service.SearchDataAsyncSSM014(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM014LoadDataAsync")]
        public async Task<SSM014TableFields> LoadDataAsyncSSM014( [FromBody] SSM014TableFields input )
        {
            return await this._service.LoadDataAsyncSSM014(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM014SaveDataAsync")]
        public async Task<OperationStatus> SaveDataAsyncSSM014( [FromBody] SSM014TableFields input )
        {
            return await this._service.SaveDataAsyncSSM014(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM014DeleteDataAsync")]
        public async Task<OperationStatus> DeleteDataAsyncSSM014( [FromBody] SSM014TableFields input )
        {
            return await this._service.DeleteDataAsyncSSM014(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        //SSM023
        [HttpPost("LoadpreviewData")]
        public async Task<SSM012InitLoad> LoadpreviewData([FromBody] SSM012TableFields input)
        {
            return await this._service.LoadpreviewData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion
    }
}

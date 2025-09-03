using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM050Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM050Service _service;

        #endregion
        #region Constructor

        public SSM050Controller(ISSM050Service service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods


        [HttpPost("SSM050GetOnloadScrh")]
        public async Task<SSM050loadObject> GetOnloadSrchprod([FromBody] SSM050Object input)
        {
            return await this._service.GetOnloadSrchprod(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM051_Gridbinding")]
        public async Task<SSM050loadObject> SSM051Gridbinding([FromBody] SSM050Object input)
        {
            return await this._service.SSM051Gridbinding(this.GetSessionInfo(), input).ConfigureAwait(false);
        } 
        [HttpPost("SSM052OnLoadDataAsync")]
        public async Task<SSM023Object> SSM052OnLoadDataAsync([FromBody] SSM050Object input)
        {
            return await this._service.SSM052OnLoadDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM052SearchDataAsync")]
        public async Task<PageInfo<SSM023Object>> SSM052SearchDataAsync([FromBody] SSM050Object input)
        {
            return await this._service.SSM052SearchDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM052BlurSrchAsync")]
        public async Task<SSM023Object> SSM052BlurSrchAsync([FromBody] SSM050Object input)
        {
            return await this._service.SSM052BlurSrchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM052LoadSelectedData")]
        public async Task<SSM023Object> SSM052LoadSelectedData([FromBody] SSM050Object input)
        {
            return await this._service.SSM052LoadSelectedData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM053GetOnloadEditData")]
        public async Task<SSM020Object> SSM053GetOnloadEditData([FromBody] SSM050Object input)
        {
            return await this._service.SSM053GetOnloadEditData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM053OnBlurSearch")]
        public async Task<SSM020Object> SSM053OnBlurSearch( [FromBody] SSM050Object input )
        {
            return await this._service.SSM053OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM050_SaveAsyncMinex")]
        public async Task<OperationStatus> SSM052SaveDataExcAsync([FromBody] SSM050Object input)
        {
            return await this._service.SSM052SaveDataExcAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM053SaveDataEdit")]
        public async Task<OperationStatus> SSM053SaveDataAsync([FromBody] SSM050Object input)
        {
            return await this._service.SSM053SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM051SaveDataImg")]
        public async Task<OperationStatus> SSM051SaveDataImg([FromBody] SSM051Overrides input, List<IFormFile> files)
        {
            return await this._service.SSM051SaveDataImg(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }
        [HttpPost("SSM051RemoveImage")]
        public async Task<OperationStatus> SSM051RemoveImage([FromBody] SSM020Overrides input)
        {
            return await this._service.SSM051RemoveImage(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

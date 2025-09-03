using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM100Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM100Service _service;

        #endregion
        #region Constructor

        public SSM100Controller(ISSM100Service service)
        {
            this._service = service;
        }
        #endregion
        #region Public Methods SSM100

        [HttpPost("SSM100GetProductOnload")]
        public async Task<SSM100Object> SSM100GetProductOnload([FromBody] SSM100Object input)
        {
            return await this._service.SSM100GetProductOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM100GetProductSearch")]
        public async Task<SSM100Object> SSM100GetProductSearch([FromBody] SSM100Object input)
        {
            return await this._service.SSM100GetProductSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM100SaveProductGrid")]
        public async Task<OperationStatus> SSM100SaveProductGrid([FromBody] SSM100Object input)
        {
            return await this._service.SSM100SaveProductGrid(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SSM101
        [HttpPost("SSM101GetCityOnload")]
        public async Task<SSM101CityOnloadObject> SSM101GetCityOnload([FromBody] SSM101CityObject input)
        {
            return await this._service.SSM101GetCityOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM101GetCitySearch")]
        public async Task<PageInfo<SSM101CityObject>> SSM101GetCitySearch([FromBody] SSM101CityObject input)
        {
            return await this._service.SSM101GetCitySearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM101GetEditCity")]
        public async Task<SSM101CityObject> SSM101GetEditCity([FromBody] SSM101CityObject input)
        {
            return await this._service.SSM101GetEditCity(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM101SaveCityForm")]
        public async Task<OperationStatus> SSM101SaveCityForm([FromBody] SSM101CityObject input)
        {
            return await this._service.SSM101SaveCityForm(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SSM102
        [HttpPost("SSM102GetCategoryOnload")]
        public async Task<SSM102OnloadObject> SSM102GetCategoryOnload([FromBody] SSM102CategoryObject input)
        {
            return await this._service.SSM102GetCategoryOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM102GetCategorySearch")]
        public async Task<PageInfo<SSM102CategoryObject>> SSM102GetCategorySearch([FromBody] SSM102CategoryObject input)
        {
            return await this._service.SSM102GetCategorySearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM102GetEditCategory")]
        public async Task<SSM102CategoryObject> SSM102GetEditCategory([FromBody] SSM102CategoryObject input)
        {
            return await this._service.SSM102GetEditCategory(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM102SaveCategoryForm")]
        public async Task<OperationStatus> SSM102SaveCategoryForm([FromBody] SSM102CategoryObject input)
        {
            return await this._service.SSM102SaveCategoryForm(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion

        #region Public Methods SSM103
        [HttpPost("SSM103Gridbinding")]
        public async Task<SSM103loadObject> SSM103Gridbinding([FromBody] SSM103Overrides input)
        {
            return await this._service.SSM103Gridbinding(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM103SaveOvrdImgData")]
        public async Task<OperationStatus> SSM103SaveOvrdImgData([FromBody] SSM103Overrides input, List<IFormFile> files)
        {
            return await this._service.SSM103SaveOvrdImgData(this.GetSessionInfo(), input, files).ConfigureAwait(false);
        }

        #endregion

        #region Public Methods SSM104
        [HttpPost("SSM104OnLoadExcep")]
        public async Task<SSM023Object> SSM104OnLoadExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM104OnLoadExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM104SearchExcep")]
        public async Task<PageInfo<SSM023Object>> SSM104SearchExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM104SearchExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM104BlurSrchExcep")]
        public async Task<SSM023Object> SSM104BlurSrchExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM104BlurSrchExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM104LoadSelectExcep")]
        public async Task<SSM023Object> SSM104LoadSelectExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM104LoadSelectExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM104SaveExcepData")]
        public async Task<OperationStatus> SSM104SaveExcepData([FromBody] SSM050Object input)
        {
            return await this._service.SSM104SaveExcepData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion

        #region Public Methods SSM105
        [HttpPost("SSM105GetOnloadData")]
        public async Task<SSM020Object> SSM105GetOnloadData([FromBody] SSM103Overrides input)
        {
            return await this._service.SSM105GetOnloadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM105OnBlurSearch")]
        public async Task<SSM020Object> SSM105OnBlurSearch([FromBody] SSM103Overrides input)
        {
            return await this._service.SSM105OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM105SaveLangData")]
        public async Task<OperationStatus> SSM105SaveLangData([FromBody] SSM103Overrides input)
        {
            return await this._service.SSM105SaveLangData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion
    }

}

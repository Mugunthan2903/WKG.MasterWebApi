using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM130Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM130Service _service;

        #endregion

        #region Constructor

        public SSM130Controller(ISSM130Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods SSM130

        [HttpPost("SSM130OnloadSearch")]
        public async Task<SSM130loadObject> SSM130OnloadSearch([FromBody] SSM130Object input)
        {
            return await this._service.SSM130OnloadSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM130CarriageSaveGrid")]
        public async Task<OperationStatus> SSM130CarriageSaveGrid([FromBody] SSM130Object input)
        {
            return await this._service.SSM130CarriageSaveGrid(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SSM131-Override

        [HttpPost("SSM131OverrideOnload")]
        public async Task<SSM130loadObject> SSM131OverrideOnload([FromBody] SSM131Overrides input)
        {
            return await this._service.SSM131OverrideOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM131SaveOverride")]
        public async Task<OperationStatus> SSM131SaveOverride([FromBody] SSM131Overrides input)
        {
            return await this._service.SSM131SaveOverride(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SSM132-Exception
        [HttpPost("SSM132OnLoadExcep")]
        public async Task<SSM023Object> SSM132OnLoadExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM132OnLoadExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM132SearchExcep")]
        public async Task<PageInfo<SSM023Object>> SSM132SearchExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM132SearchExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM132BlurSrchExcep")]
        public async Task<SSM023Object> SSSM132BlurSrchExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM132BlurSrchExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM132LoadSelectExcep")]
        public async Task<SSM023Object> SSM132LoadSelectExcep([FromBody] SSM050Object input)
        {
            return await this._service.SSM132LoadSelectExcep(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM132SaveExcepData")]
        public async Task<OperationStatus> SSM132SaveExcepData([FromBody] SSM050Object input)
        {
            return await this._service.SSM132SaveExcepData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion

        #region Public Methods SSM133-LangEdit
        [HttpPost("SSM133GetOnloadData")]
        public async Task<SSM020Object> SSM133GetOnloadData([FromBody] SSM131Overrides input)
        {
            return await this._service.SSM133GetOnloadData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM133OnBlurSearch")]
        public async Task<SSM020Object> SSM133OnBlurSearch([FromBody] SSM131Overrides input)
        {
            return await this._service.SSM133OnBlurSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM133SaveLangData")]
        public async Task<OperationStatus> SSM133SaveLangData([FromBody] SSM131Overrides input)
        {
            return await this._service.SSM133SaveLangData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion

        #region Public Methods SSM134-Differential
        [HttpPost("SSM134DifferentialOnload")]
        public async Task<SSM130DifferentialOnload> SSM134DifferentialOnload([FromBody] SSM130DifferentialObject input)
        {
            return await this._service.SSM134DifferentialOnload(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM134DifferentialSearch")]
        public async Task<PageInfo<SSM130DifferentialObject>> SSM134DifferentialSearch([FromBody] SSM130DifferentialObject input)
        {
            return await this._service.SSM134DifferentialSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM134DifferentialEdit")]
        public async Task<SSM130DifferentialObject> SSM134DifferentialEdit([FromBody] SSM130DifferentialObject input)
        {
            return await this._service.SSM134DifferentialEdit(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM134DifferentialSave")]
        public async Task<OperationStatus> SSM134DifferentialSave([FromBody] SSM130DifferentialObject input)
        {
            return await this._service.SSM134DifferentialSave(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SSM135-Facilities
        [HttpPost("SSM135FacilitiesOnloadSrch")]
        public async Task<SSM130loadObject> SSM135FacilitiesOnloadSrch([FromBody] SSM130FacilityObject input)
        {
            return await this._service.SSM135FacilitiesOnloadSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM135FacilitiesGridSave")]
        public async Task<OperationStatus> SSM135FacilitiesGridSave([FromBody] SSM130FacilityObject input)
        {
            return await this._service.SSM135FacilitiesGridSave(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SSM136-Facilities Images
        [HttpPost("SSM136FacilitiesImageOnloadSrch")]
        public async Task<SSM130loadObject> SSM136FacilitiesImageOnloadSrch([FromBody] SSM130FacilityObject input)
        {
            return await this._service.SSM136FacilitiesImageOnloadSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM136FacilitiesImageBlurSrch")]
        public async Task<SSM130loadObject> SSM136FacilitiesImageBlurSrch([FromBody] SSM130FacilityObject input)
        {
            return await this._service.SSM136FacilitiesImageBlurSrch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM136FacilitiesImageSave")]
        public async Task<OperationStatus> SSM136FacilitiesImageSave([FromBody] SSM130FacilityObject input, List<IFormFile> files)
        {
            return await this._service.SSM136FacilitiesImageSave(this.GetSessionInfo(), input,files).ConfigureAwait(false);
        }
        #endregion


        #region Public Methods SSM137-Distribusion Location
        [HttpPost("SSM137OnloadCntrySearch")]
        public async Task<SSM137loadObject> SSM137OnloadCntrySearch([FromBody] SSM137LocationObject input)
        {
            return await this._service.SSM137OnloadCntrySearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM137OnloadSearch")]
        public async Task<SSM137loadObject> SSM137OnloadSearch([FromBody] SSM137LocationObject input)
        {
            return await this._service.SSM137OnloadSearch(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM137LocationSaveGrid")]
        public async Task<OperationStatus> SSM137LocationSaveGrid([FromBody] SSM130Object input)
        {
            return await this._service.SSM137LocationSaveGrid(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion


        #region Public Methods SSM138-Group Station Combinations
        [HttpPost("SSM138OnloadAsync")]
        public async Task<SSM138loadObject> SSM138OnloadAsync([FromBody] SSM138Object input)
        {
            return await this._service.SSM138OnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM138GetSearchAsync")]
        public async Task<SSM138loadObject> SSM138GetSearchAsync([FromBody] SSM138Object input)
        {
            return await this._service.SSM138GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SSM138GetSelectAsync")]
        public async Task<SSM138loadObject> SSM138GetSelectAsync([FromBody] SSM138Object input)
        {
            return await this._service.SSM138GetSelectAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM138SaveDataAsync")]
        public async Task<OperationStatus> SSM138SaveDataAsync([FromBody] SSM138Object input)
        {
            return await this._service.SSM138SaveDataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        #endregion
    }
}


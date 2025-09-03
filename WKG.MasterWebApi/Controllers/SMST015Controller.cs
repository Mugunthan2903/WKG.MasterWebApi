using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SMST015Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISMST015Service _service;

        #endregion

        #region Constructor

        public SMST015Controller(ISMST015Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods SMST015
        [HttpPost("SMST015OnloadAsync")]
        public async Task<SMST015loadObject> GetOnloadAsync([FromBody] SMST015Object input)
        {
            return await this._service.GetOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST015BlurSearchAsync")]
        public async Task<SMST015BlurObject> BlurSearchAsync([FromBody] SMST015Object input)
        {
            return await this._service.BlurSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST015SearchAsync")]
        public async Task<PageInfo<SMST015Object>> GetSearchAsync([FromBody] SMST015Object input)
        {
            return await this._service.GetSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST015SaveAsync")]
        public async Task<OperationStatus> SaveAsync([FromBody] SMST015Object input)
        {
            return await this._service.SaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SMST016

        [HttpPost("SMST016OnloadAsync")]
        public async Task<SMST016loadObject> GetLangOnloadAsync([FromBody] SMST016Object input)
        {
            return await this._service.GetLangOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST016BlurSearchAsync")]
        public async Task<SMST016BlurObject> LangBlurSearchAsync([FromBody] SMST016Object input)
        {
            return await this._service.LangBlurSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST016SearchAsync")]
        public async Task<PageInfo<SMST016Object>> GetLangSearchAsync([FromBody] SMST016Object input)
        {
            return await this._service.GetLangSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST016SaveAsync")]
        public async Task<OperationStatus> LangSaveAsync([FromBody] SMST016Object input)
        {
            return await this._service.LangSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SMST017

        [HttpPost("SMST017OnloadAsync")]
        public async Task<SMST017loadObject> GetSlideOnloadAsync([FromBody] SMST017Object input)
        {
            return await this._service.GetSlideOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST017BlurSearchAsync")]
        public async Task<SMST017BlurObject> SlideBlurSearchAsync([FromBody] SMST017Object input)
        {
            return await this._service.SlideBlurSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST017SearchAsync")]
        public async Task<PageInfo<SMST017Object>> GetSlideSearchAsync([FromBody] SMST017Object input)
        {
            return await this._service.GetSlideSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST017SaveAsync")]
        public async Task<OperationStatus> SlideSaveAsync([FromBody] SMST017Object input)
        {
            return await this._service.SlideSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion

        #region Public Methods SMST018

        [HttpPost("SMST018OnloadAsync")]
        public async Task<SMST018loadObject> GetTodoOnloadAsync([FromBody] SMST018Object input)
        {
            return await this._service.GetTodoOnloadAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST018BlurSearchAsync")]
        public async Task<SMST018BlurObject> TodoBlurSearchAsync([FromBody] SMST018Object input)
        {
            return await this._service.TodoBlurSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST018SearchAsync")]
        public async Task<PageInfo<SMST018Object>> GetTodoSearchAsync([FromBody] SMST018Object input)
        {
            return await this._service.GetTodoSearchAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST018SaveAsync")]
        public async Task<OperationStatus> TodoSaveAsync([FromBody] SMST018Object input)
        {
            return await this._service.TodoSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

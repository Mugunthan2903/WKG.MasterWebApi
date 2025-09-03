using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;
using WKL.Service.Domain;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SMST004Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISMST004Service _service;

        #endregion

        #region Constructor

        public SMST004Controller(ISMST004Service service)
        {
            this._service = service;
        }

        #endregion

        #region Public Methods

        [HttpPost("SMST004_Srchcmbsupmpid")]
        public async Task<SMST004Obj> Getsuppliercombo([FromBody] SMST004Obj input)
        {
            return await this._service.Getsuppliercombo(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST004_Edittabledata")]
        public async Task<List<SMST004Obj>> EdittabledataAsync([FromBody] SMST004Obj input)
        {
            return await this._service.EdittabledataAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST004SaveAsync")]
        public async Task<OperationStatus> PosSaveAsync([FromBody] SMST004Obj input)
        {
            return await this._service.PosSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SMST005_Getsupposconfigdata")]
        public async Task<SMST004Obj> Getsupposconfigdata([FromBody] SMST004Obj input)
        {
            return await this._service.Getsupposconfigdata(this.GetSessionInfo(), input).ConfigureAwait(false);
        }

        [HttpPost("SMST005_PosconfigSaveAsync")]
        public async Task<OperationStatus> PosconfigSaveAsync([FromBody] SMST004Obj input)
        {
            return await this._service.PosconfigSaveAsync(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        #endregion
    }
}

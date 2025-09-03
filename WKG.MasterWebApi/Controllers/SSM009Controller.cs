using Microsoft.AspNetCore.Mvc;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core;

namespace WKG.MasterWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSM009Controller : WKLBaseController
    {
        #region Private Elements

        private readonly ISSM009Service _service;

        #endregion

        #region Constructor

        public SSM009Controller(ISSM009Service service)
        {
            this._service = service;
        }

        [HttpPost("SSM009OnloadImageAsync")]
        public async Task<List<SSM020Overrides>> SSM009OnloadImageData([FromBody] SSM020Overrides input)
        {
            return await this._service.SSM009OnloadImageData(this.GetSessionInfo(), input).ConfigureAwait(false);
        }
        [HttpPost("SSM009DownloadFileAsync")]
        public async Task<string> SSM009DownloadFileAsync([FromBody] SSM020Overrides input)
        {
            return await this._service.SSM009DownloadFileAsync(this.GetSessionInfo(), input).ConfigureAwait(false); ;
        }
        
        #endregion

    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISMST015Service : IDisposable
    {

        Task<SMST015loadObject> GetOnloadAsync(SessionInfo sessionInfo, SMST015Object input);
        Task<SMST015BlurObject> BlurSearchAsync(SessionInfo sessionInfo, SMST015Object input);
        Task<PageInfo<SMST015Object>> GetSearchAsync(SessionInfo sessionInfo, SMST015Object input);
        Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, SMST015Object input);

        Task<SMST016loadObject> GetLangOnloadAsync(SessionInfo sessionInfo, SMST016Object input);
        Task<SMST016BlurObject> LangBlurSearchAsync(SessionInfo sessionInfo, SMST016Object input);
        Task<PageInfo<SMST016Object>> GetLangSearchAsync(SessionInfo sessionInfo, SMST016Object input);
        Task<OperationStatus> LangSaveAsync(SessionInfo sessionInfo, SMST016Object input);

        Task<SMST017loadObject> GetSlideOnloadAsync(SessionInfo sessionInfo, SMST017Object input);
        Task<SMST017BlurObject> SlideBlurSearchAsync(SessionInfo sessionInfo, SMST017Object input);
        Task<PageInfo<SMST017Object>> GetSlideSearchAsync(SessionInfo sessionInfo, SMST017Object input);
        Task<OperationStatus> SlideSaveAsync(SessionInfo sessionInfo, SMST017Object input);


        Task<SMST018loadObject> GetTodoOnloadAsync(SessionInfo sessionInfo, SMST018Object input);
        Task<SMST018BlurObject> TodoBlurSearchAsync(SessionInfo sessionInfo, SMST018Object input);
        Task<PageInfo<SMST018Object>> GetTodoSearchAsync(SessionInfo sessionInfo, SMST018Object input);
        Task<OperationStatus> TodoSaveAsync(SessionInfo sessionInfo, SMST018Object input);



    }
}

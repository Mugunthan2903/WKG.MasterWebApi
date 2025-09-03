using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISSM100Service : IDisposable
    {
        Task<SSM100Object> SSM100GetProductOnload(SessionInfo sessionInfo, SSM100Object input);
        Task<SSM100Object> SSM100GetProductSearch(SessionInfo sessionInfo, SSM100Object input);
        Task<OperationStatus> SSM100SaveProductGrid(SessionInfo sessionInfo, SSM100Object input);
        Task<SSM101CityOnloadObject> SSM101GetCityOnload(SessionInfo sessionInfo, SSM101CityObject input);
        Task<PageInfo<SSM101CityObject>> SSM101GetCitySearch(SessionInfo sessionInfo, SSM101CityObject input);
        Task<SSM101CityObject> SSM101GetEditCity(SessionInfo sessionInfo, SSM101CityObject input);
        Task<OperationStatus> SSM101SaveCityForm(SessionInfo sessionInfo, SSM101CityObject input);
        Task<SSM102OnloadObject> SSM102GetCategoryOnload(SessionInfo sessionInfo, SSM102CategoryObject input);
        Task<PageInfo<SSM102CategoryObject>> SSM102GetCategorySearch(SessionInfo sessionInfo, SSM102CategoryObject input);
        Task<SSM102CategoryObject> SSM102GetEditCategory(SessionInfo sessionInfo, SSM102CategoryObject input);
        Task<OperationStatus> SSM102SaveCategoryForm(SessionInfo sessionInfo, SSM102CategoryObject input);
        Task<SSM103loadObject> SSM103Gridbinding(SessionInfo sessionInfo, SSM103Overrides input);
        Task<OperationStatus> SSM103SaveOvrdImgData(SessionInfo sessionInfo, SSM103Overrides input, List<IFormFile> files);
        Task<SSM023Object> SSM104OnLoadExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<PageInfo<SSM023Object>> SSM104SearchExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM104BlurSrchExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM104LoadSelectExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<OperationStatus> SSM104SaveExcepData(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM020Object> SSM105GetOnloadData(SessionInfo sessionInfo, SSM103Overrides input);
        Task<SSM020Object> SSM105OnBlurSearch(SessionInfo sessionInfo, SSM103Overrides input);
        Task<OperationStatus> SSM105SaveLangData(SessionInfo sessionInfo, SSM103Overrides input);
    }
}

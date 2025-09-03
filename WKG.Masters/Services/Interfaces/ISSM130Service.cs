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
    public interface ISSM130Service : IDisposable
    {

        Task<SSM130loadObject> SSM130OnloadSearch(SessionInfo sessionInfo, SSM130Object input);
        Task<OperationStatus> SSM130CarriageSaveGrid(SessionInfo sessionInfo, SSM130Object input);

        Task<SSM130loadObject> SSM131OverrideOnload(SessionInfo sessionInfo, SSM131Overrides input);
        Task<OperationStatus> SSM131SaveOverride(SessionInfo sessionInfo, SSM131Overrides input);

        Task<SSM023Object> SSM132OnLoadExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<PageInfo<SSM023Object>> SSM132SearchExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM132BlurSrchExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<SSM023Object> SSM132LoadSelectExcep(SessionInfo sessionInfo, SSM050Object input);
        Task<OperationStatus> SSM132SaveExcepData(SessionInfo sessionInfo, SSM050Object input);

        Task<SSM020Object> SSM133GetOnloadData(SessionInfo sessionInfo, SSM131Overrides input);
        Task<SSM020Object> SSM133OnBlurSearch(SessionInfo sessionInfo, SSM131Overrides input);
        Task<OperationStatus> SSM133SaveLangData(SessionInfo sessionInfo, SSM131Overrides input);

        Task<SSM130DifferentialOnload> SSM134DifferentialOnload(SessionInfo sessionInfo, SSM130DifferentialObject input);
        Task<PageInfo<SSM130DifferentialObject>> SSM134DifferentialSearch(SessionInfo sessionInfo, SSM130DifferentialObject input);
        Task<SSM130DifferentialObject> SSM134DifferentialEdit(SessionInfo sessionInfo, SSM130DifferentialObject input);
        Task<OperationStatus> SSM134DifferentialSave(SessionInfo sessionInfo, SSM130DifferentialObject input);

        Task<SSM130loadObject> SSM135FacilitiesOnloadSrch(SessionInfo sessionInfo, SSM130FacilityObject input);
        Task<OperationStatus> SSM135FacilitiesGridSave(SessionInfo sessionInfo, SSM130FacilityObject input);

        Task<SSM130loadObject> SSM136FacilitiesImageOnloadSrch(SessionInfo sessionInfo, SSM130FacilityObject input);
        Task<SSM130loadObject> SSM136FacilitiesImageBlurSrch(SessionInfo sessionInfo, SSM130FacilityObject input);
        Task<OperationStatus> SSM136FacilitiesImageSave(SessionInfo sessionInfo, SSM130FacilityObject input, List<IFormFile> files);

        Task<SSM137loadObject> SSM137OnloadCntrySearch(SessionInfo sessionInfo, SSM137LocationObject input);
        Task<SSM137loadObject> SSM137OnloadSearch(SessionInfo sessionInfo, SSM137LocationObject input);
        Task<OperationStatus> SSM137LocationSaveGrid(SessionInfo sessionInfo, SSM130Object input);

        Task<SSM138loadObject> SSM138OnloadAsync(SessionInfo sessionInfo, SSM138Object input);
        Task<SSM138loadObject> SSM138GetSearchAsync(SessionInfo sessionInfo, SSM138Object input);
        Task<SSM138loadObject> SSM138GetSelectAsync(SessionInfo sessionInfo, SSM138Object input);
        Task<OperationStatus> SSM138SaveDataAsync(SessionInfo sessionInfo, SSM138Object input);
        
    }
}
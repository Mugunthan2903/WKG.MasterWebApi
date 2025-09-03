using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces {
    public interface ITestService : IDisposable {
        Task<PageInfo<SMST002TableFields>> GetSearchDataAsync( SessionInfo sessionInfo, SMST002SearchInputs input );
        Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SMST002TableFields input );

        Task<SMST003loadObject> GetOnloadAsync( SessionInfo sessionInfo, SMST003Object input );
        Task<List<SMST003Object>> GetProductsAsync( SessionInfo sessionInfo, SMST003Object input );
        Task<List<SMST003Object>> GetSearchAsync( SessionInfo sessionInfo, SMST003Object input );
        Task<OperationStatus> SaveAsync( SessionInfo sessionInfo, SMST003Object input );

    }
}

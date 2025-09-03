using Microsoft.AspNetCore.Http;
using WKG.Masters.Model;
using WKL.Service.Domain;

namespace WKG.Masters.Services.Interfaces
{
    public interface ISampleService : IDisposable
    {
        Task<List<ProductObject.Product>> GetProductsAsync(SessionInfo sessionInfo, ProductObject.SearchInput input);
        Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, ProductObject.Product input);

        Task<OperationStatus> SaveImageAsync(SessionInfo sessionInfo, ProductObject.Product input, List<IFormFile> files);

        Task<List<BaseObject<string>>> GetSearchDataAsync(SessionInfo sessionInfo, ProductObject.SimpleSearchInput input);
        Task<PageInfo<BaseObject<string>>> GetPageDataAsync(SessionInfo sessionInfo, ProductObject.PageSearchInfo input);
    }
}

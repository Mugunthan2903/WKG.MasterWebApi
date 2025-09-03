using WKG.MasterWebApi.Model;

namespace WKG.MasterWebApi.Core.Services.Interfaces
{
    public interface ITokenStoreService
    {
        Task<bool> AddTokenAsync(TokenInfo tokenInfo);
        Task<bool> IsValidTokenAsync(string userID, string refreshToken);
        Task RevokeBearerTokensAsync(string userID, string refreshToken);
        Task<TokenInfo> FindUserAsync(string userID, string refreshToken);
    }
}

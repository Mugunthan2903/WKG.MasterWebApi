using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace WKG.MasterWebApi.Core.Services.Interfaces
{
    public interface ITokenValidatorService
    {
        Task<bool> ValidateAsync(TokenValidatedContext context);
    }
}

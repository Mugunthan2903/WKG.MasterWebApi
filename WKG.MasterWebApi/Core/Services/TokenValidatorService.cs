using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using WKL.Web.Security.Interfaces;

namespace WKG.MasterWebApi.Core.Services
{
    public class TokenValidatorService : ITokenValidatorService
    {
        private readonly IUserService _userService;
        private readonly ITokenStoreService _tokenStoreService;
        private readonly IJwtTokenFactory _jwtTokenFactory;
        private readonly ILogger _logger;

        public TokenValidatorService(IUserService service, ITokenStoreService tokenStoreService, IJwtTokenFactory jwtTokenFactory, ILogger<TokenValidatorService> logger)
        {
            this._userService = service;
            this._tokenStoreService = tokenStoreService;
            this._jwtTokenFactory = jwtTokenFactory;
            this._logger = logger;
        }

        public async Task<bool> ValidateAsync(TokenValidatedContext context)
        {
            var claimsIdentity = context.Principal.Identity as ClaimsIdentity;
            string userID = claimsIdentity.FindFirst($"{this._jwtTokenFactory.JWT_CLAIM_KEY}_ID").Value;
            var refreshToken = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier).Value;

            if (!(await this._userService.HasAccessAsync(userID)))
            {
                context.Fail("Access denied!");
                return false;
            }
            if (!(await this._tokenStoreService.IsValidTokenAsync(userID, refreshToken)))
            {
                context.Fail("Access denied!");
                return false;
            }
            return true;
        }


        private T GetValue<T>(ClaimsIdentity claimsIdentity, string key, T defaultValue = default(T))
        {
            T t = defaultValue;
            try
            {
                if (claimsIdentity != null && claimsIdentity.Claims != null)
                {
                    var claim = claimsIdentity.FindFirst(key);
                    if (claim != null)
                        t = (T)Convert.ChangeType(claim.Value, typeof(T));
                }
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Method: {nameof(this.GetValue)}.");
            }
            return t;
        }
    }
}

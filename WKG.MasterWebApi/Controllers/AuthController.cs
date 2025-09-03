using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKG.MasterWebApi.Core.Services.Interfaces;
using WKG.MasterWebApi.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WKL.Security.Interfaces;
using WKL.Web.Security.Domain;
using WKL.Web.Security.Interfaces;

namespace PMSWebApi.Controllers
{
    [Authorize()]
    //#if !DEBUG
    //    [EnableCors(Startup.CROS_POLICY_NAME)]
    //#endif
    [EnableCors(AppConstants.CROS_POLICY_NAME)]
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        #region Private Elements

        private readonly IUserService _userService;
        private readonly ITokenStoreService _tokenStoreService;
        private readonly IJwtTokenFactory _jwtTokenFactory;
        private readonly ILogger<AuthController> _logger;
        private readonly IOptions<JwtOptions> _jwtOptions;
        private readonly ICryptoService _cryptoService;

        #endregion

        #region Constructor

        public AuthController(ILogger<AuthController> logger, IOptions<JwtOptions> jwtOptions, IUserService service,
            ITokenStoreService tokenStoreService, IJwtTokenFactory jwtTokenFactory,
            ICryptoService cryptoService)
        {
            this._userService = service;
            this._tokenStoreService = tokenStoreService;
            this._jwtTokenFactory = jwtTokenFactory;
            this._logger = logger;
            this._jwtOptions = jwtOptions;
            this._cryptoService = cryptoService;
        }

        #endregion

        #region Public Methods

        [AllowAnonymous]
        [IgnoreAntiforgeryToken]
        [HttpPost("sign-in")]
        public async Task<TokenResult> SigninAsync([FromBody] Login login)
        {
            return await this.SigninExAsync(login).ConfigureAwait(false);
        }
        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<TokenResult> RefreshTokenAsync([FromBody] JwtToken token)
        {
            if (!this._jwtTokenFactory.IsvalidRefreshToken(token.AccessToken, token.RefreshToken))
            {
                return new TokenResult { IsValid = false };
            }
            return await this.RefreshTokenExAsync(token).ConfigureAwait(false);
        }
        [AllowAnonymous]
        [IgnoreAntiforgeryToken]
        [HttpPost("sign-out")]
        public async Task<SignoutResult> SignoutAsync([FromBody] JwtToken token)
        {
            return await this.SignoutExAsync(token).ConfigureAwait(false);
        }

        #endregion

        #region Private Methods

        private async Task<TokenResult> SigninExAsync(Login input)
        {
            TokenResult tokenResult = new TokenResult { IsValid = false };
            try
            {
                if (input != null)
                {
                    var userInput = new User.LoginInput();
                    if (!string.IsNullOrWhiteSpace(input.Token))
                    {
                        input.Token = this._cryptoService.Decrypt(input.Token);
                        if (!string.IsNullOrWhiteSpace(input.Password))
                        {
                            userInput.Password = input.Password;
                            if (!string.IsNullOrWhiteSpace(input.Token))
                            {
                                var st = input.Token.ToJsonObject<SignoutToken>();
                                if (st != null)
                                {
                                    userInput.UserID = st.UID;
                                }
                            }
                        }
                        if (string.IsNullOrWhiteSpace(userInput.UserID) || string.IsNullOrWhiteSpace(userInput.Password))
                            return tokenResult;

                        userInput.MachineID = this.HttpContext.GetIPAddress();
                        userInput.BrowserInfo = this.HttpContext.GetBrowserInfo();
                    }
                    else
                    {
                        userInput.LoginID = input.LoginID;
                        userInput.Password = input.Password;

                        if (string.IsNullOrWhiteSpace(userInput.LoginID) || string.IsNullOrWhiteSpace(userInput.Password))
                            return tokenResult;
                    }

                    var userInfo = await this._userService.SigninAsync(userInput);
                    if (userInfo != null)
                    {
                        var jwtToken = this._jwtTokenFactory.CreateJwtToken(new JwtUser
                        {
                            ID = userInfo.ID.ToString(),
                            Name = userInfo.Name
                        });
                        bool isSaved = await this._tokenStoreService.AddTokenAsync(new TokenInfo
                        {
                            MachineID = this.HttpContext.GetIPAddress(),
                            Version = "v1.0.0",
                            ExpiryDate = new DateTime(),
                            RefreshTokenID = jwtToken.RefreshToken,
                            UserID = userInfo.ID,
                            Timeout = (this._jwtOptions.Value?.RefreshTokenExpirationMinutes) ?? 20
                        });
                        if (isSaved)
                        {
                            tokenResult.UserValid = true;
                            tokenResult.IsValid = true;
                            tokenResult.User = userInfo;
                            tokenResult.Token = new WKLToken
                            {
                                AccessToken = jwtToken.AccessToken,
                                RefreshToken = jwtToken.RefreshToken,
                                User = userInfo
                            };
                        }
                    }
                    else
                    {
                        tokenResult.ErrorMessage = "Invalid login id / password";
                    }
                }
            }
            catch (Exception ex)
            {
                if (input != null && !string.IsNullOrWhiteSpace(input.Password))
                    input.Password = "".PadLeft(input.Password.Length, '*');

                this._logger.LogError(ex, $"Sign in. Method: {nameof(SigninExAsync)}, Input:{input?.ToJsonText()}");
            }
            return tokenResult;
        }
        private async Task<TokenResult> RefreshTokenExAsync(JwtToken token)
        {
            TokenResult tokenResult = new TokenResult { IsValid = false };
            try
            {
                var jwtTokenInfo = this._jwtTokenFactory.GetJwtTokenInfo(token.AccessToken);
                if (jwtTokenInfo != null && jwtTokenInfo.User != null)
                {
                    var userToken = await this._tokenStoreService.FindUserAsync(jwtTokenInfo.User.ID, token.RefreshToken);
                    if (userToken != null)
                    {
                        var userInput = new User.LoginInput() { UserID = jwtTokenInfo.User.ID, IsRefreshSession = true };

                        var userInfo = await this._userService.SigninAsync(userInput);
                        if (userInfo != null)
                        {
                            var jwtToken = this._jwtTokenFactory.CreateJwtToken(jwtTokenInfo.User);
                            bool isSaved = await this._tokenStoreService.AddTokenAsync(new TokenInfo
                            {
                                MachineID = this.HttpContext.GetIPAddress(),
                                Version = "v1.0.0",
                                ExpiryDate = new DateTime(),
                                RefreshTokenID = jwtToken.RefreshToken,
                                OldRefreshTokenID = token.RefreshToken,
                                UserID = userInfo.ID,
                                Timeout = (this._jwtOptions.Value?.RefreshTokenExpirationMinutes) ?? 20
                            });
                            if (isSaved)
                            {
                                tokenResult.IsValid = true;
                                tokenResult.Token = new WKLToken
                                {
                                    AccessToken = jwtToken.AccessToken,
                                    RefreshToken = jwtToken.RefreshToken,
                                    User = userInfo
                                };
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Token refresh. Method: {nameof(RefreshTokenAsync)}, Input:{token?.ToJsonText()}");
            }
            return tokenResult;
        }
        private async Task<SignoutResult> SignoutExAsync(JwtToken token)
        {
            var output = new SignoutResult() { IsValid = true };
            try
            {
                if (token != null)
                {
                    var jwtTokenInfo = this._jwtTokenFactory.GetJwtTokenInfo(token.AccessToken);
                    if (jwtTokenInfo != null && jwtTokenInfo.User != null)
                    {
                        await this._tokenStoreService.RevokeBearerTokensAsync(jwtTokenInfo.User.ID, token.RefreshToken);
                        output.IsValid = true;
                        output.User = new SignoutUser
                        {
                            Token = this._cryptoService.Encrypt(new SignoutToken { UID = jwtTokenInfo.User.ID }.ToJsonText()),
                            Name = jwtTokenInfo.User.Name
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sign out. Method: {nameof(SignoutExAsync)}, Input:{token?.ToJsonText()}");
            }
            return output;
        }

        #endregion

        #region Nested Types

        class SignoutToken
        {
            public string UID { get; set; }
        }

        #endregion
    }
}

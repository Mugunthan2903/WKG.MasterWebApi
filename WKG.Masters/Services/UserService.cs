using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace WKG.Masters.Services
{
    public class UserService : WKLServiceManger, IUserService
    {
        #region Constructor

        public UserService(IServiceProvider serviceProvider, ILogger<UserService> logger)
            : base(serviceProvider, logger)
        {
        }

        #endregion

        #region Public Methods

        public async Task<bool> HasAccessAsync(string userID)
        {
            return await Task.FromResult(true);
        }

        public async Task<User.Info> SigninAsync(User.LoginInput input)
        {
            User.Info output = null;
            try
            {
                if (input.IsRefreshSession)
                {
                    if (input.UserID == "13036")
                        output = new User.Info { ID = "13036", Name = "Mr. Administrator", IsMale = true };
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(input.UserID))
                    {
                        if (string.Compare(input.LoginID, "13036", true) == 0 && string.Compare(input.Password, "ssm24@!3036", true) == 0)
                            output = new User.Info { ID = "13036", Name = "Mr. Administrator", IsMale = true };
                    }
                    else
                    {
                        if (input.UserID == "13036" && string.Compare(input.Password, "ssm24@!3036", true) == 0)
                            output = new User.Info { ID = "13036", Name = "Mr. Administrator", IsMale = true };
                    }
                }
            }
            catch (Exception ex)
            {

                this.Logger.LogError(ex, $"Method: {nameof(SigninAsync)}, Input: {input?.ToJsonText()}");
            }
            return await Task.FromResult<User.Info>(output);
        }

        #endregion
    }
}

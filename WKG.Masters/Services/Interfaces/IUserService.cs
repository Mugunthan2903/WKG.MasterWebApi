using WKG.Masters.Model;

namespace WKG.Masters.Services.Interfaces
{
    public interface IUserService
    {
        Task<bool> HasAccessAsync(string userID);
        Task<User.Info> SigninAsync(User.LoginInput input);
    }
}

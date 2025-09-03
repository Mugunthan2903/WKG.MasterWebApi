using WKG.Masters.Model;
using WKL.Web.Security.Domain;

namespace WKG.MasterWebApi.Model
{
    public class WKLToken : JwtToken
    {
        public User.Info User { get; set; }
        public SignoutUser Token { get; set; }
    }
}

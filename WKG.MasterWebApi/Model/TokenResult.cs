using WKG.Masters.Model;

namespace WKG.MasterWebApi.Model
{
    public class TokenResult
    {
        public bool IsValid { get; set; }
        public bool UserValid { get; set; }
        public string ErrorMessage { get; set; }
        public WKLToken Token { get; set; }
        public User.Info User { get; set; }
    }
}

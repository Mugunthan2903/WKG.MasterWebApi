namespace WKG.MasterWebApi.Model
{
    public class SignoutResult
    {
        public bool IsValid { get; set; }
        public SignoutUser User { get; set; }
    }
}

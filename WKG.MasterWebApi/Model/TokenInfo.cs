namespace WKG.MasterWebApi.Model
{
    public class TokenInfo
    {
        public TokenInfo()
        {
            this.Timeout = 20;
        }
        public string UserID { get; set; }
        public string RefreshTokenID { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Version { get; set; }
        public string MachineID { get; set; }
        public int Timeout { get; set; }
        public string OldRefreshTokenID { get; set; }
    }
}

namespace WKG.Masters.Model
{
    public class User
    {
        public class LoginInput
        {
            public string UserID { get; set; }
            public string LoginID { get; set; }
            public string Password { get; set; }
            public string MachineID { get; set; }
            public string BrowserInfo { get; set; }
            public bool IsRefreshSession { get; set; }
        }
        public class Info
        {
            public string ID { get; set; }
            public string Name { get; set; }
            public bool IsMale { get; set; }
        }
    }
}

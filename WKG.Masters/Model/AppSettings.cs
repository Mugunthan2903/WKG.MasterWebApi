using WKL.Data;

namespace WKG.Masters.Model
{
    public class AppSettings
    {
        public List<string> CorsIPs { get; set; }
        public DBConfiguration DBConfiguration { get; set; }
        public string SqliteConnection { get; set; }
        public string ImageSavePath { get; set; }
        public string ImageReadPath { get; set; }
        public string ImageUid { get; set; }
        public string ImagePwd { get; set; }
    }
}

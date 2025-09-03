using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class TypeAndSrchObject
    {
        public string GrpID { get; set; }
        public bool ConnectStn { get; set; }
        public string ID { get; set; }
        public string Text { get; set; }
        public string id { get; set; }
        public string stationtype { get; set; }
        public string name { get; set; }
        public string stnDesc { get; set; }
        public string address { get; set; }
        public string post { get; set; }
        public string latitude { get; set; }
        public string longitude { get; set; }
        public string city { get; set; }
        public string area { get; set; }
        public string iata { get; set; }
        public string lang_cd { get; set; }
        public string type { get; set; }
        public bool act_inact_ind { get; set; }
        public string stn_aval { get; set; }
    }

    public class CombSrchObject
    {
        public string ID { get; set; }
        public string Text { get; set; }
    }
}

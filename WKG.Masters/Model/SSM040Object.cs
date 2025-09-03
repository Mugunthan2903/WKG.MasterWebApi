using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM040Object
    {
        public dynamic DynamicValues { get; set; }
        public string data_srl { get; set; }

        public string mod_by_usr_cd { get; set; }
        public string data_typ_cd { get; set; }
        public string crrg_id { get; set; }
        public bool html_data { get; set; }
        public string data_typ_nam { get; set; }
        public List<SSM040Srchcmbo> Srchcmbrslt { get; set; }
        public List<CarriageTypesList> CarriageTypesList { get; set; }
        public Dictionary<string, (string Value, int SortOrder)> GroupList { get; set; }

    }

    // Define a class for dynamic column
    public class DynamicValues
    {
        public string ColumnName { get; set; }
        public object ColumnValue { get; set; }
    }

    public class SSM040Srchcmbo
    {
        public string data_typ_cd { get; set; }
        public string data_typ_nam { get; set; }
        public bool allw_data_add { get; set; }
        public bool multln_data { get; set; }
        public bool html_data { get; set; }
        public string data_grp_cd { get; set; }
    }
    public class CarriageTypesList
    {
        public string crrg_id { get; set; }
        public string crrg_nam { get; set; }
    }
}

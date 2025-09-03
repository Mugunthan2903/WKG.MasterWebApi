using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM160Object
    {
        public dynamic DynamicValues { get; set; }
        public string trm_srl { get; set; }
        public string trm_nam { get; set; }
        public string lang_cd { get; set; }
        public string trm_desc { get; set; }
        public bool trm_dflt { get; set; }
        public bool act_inact_ind { get; set; }
        public string appl_supp_cds { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public string existSrl { get; set; }
        public bool? SortTyp { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }


    }

    public class SSM160OnloadObject
    {
        public List<SSM161Object> LangItems { get; set; }
        public List<SSM160Object> Items { get; set; }
        public List<SSM160ApiEnableObject> ApiEnableItem { get; set; }
        public string Lang_Cd { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalRecords { get; set; }
        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }

    }

    public class SSM160ApiEnableObject
    {
        public string supp_nam { get; set; }
        public string supp_map_id { get; set; }
        public bool act_inact_ind { get; set; }
    }

    public class SSM161Object
    {
        public List<SSM161Object> DynamicValues { get; set; }
        public string trm_srl { get; set; }
        public string trm_nam { get; set; }
        public string lang_cd { get; set; }
        public string trm_desc { get; set; }
        public bool recordExists { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }

    }

}

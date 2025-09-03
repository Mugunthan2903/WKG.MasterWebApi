using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM090Object
    {
        public string loc_srl { get; set; }
        public string loc_nam { get; set; }
        public string img_srl { get; set; }
        public string data_srl { get; set; }
        public string sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public dynamic LangData { get; set; }
        public bool SortTyp { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string ImageChanged { get; set; }
        public string LangChanged { get; set; }
        public string OldImg { get; set; }
        public string img_nam { get; set; }
        public string img_dir { get; set; }
    }

    public class SSM090OnloadObject
    {
        public List<SSM090Object> Items { get; set; }
        public string Lang_types { get; set; }
        public string img_dir { get; set; }
        public string ImageName { get; set; }
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

}

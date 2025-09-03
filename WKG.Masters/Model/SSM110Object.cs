using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM110Object
    {
        public string lang_data_srl {  get; set; }
        public string tour_ctgry_id { get; set; }
        public string tour_ctgry_nam { get; set; }
        public string sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public string data_srl { get; set; }
        public string en_GB { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
       public int PageSize { get; set; }
        public bool SortTyp { get; set; }
       
    }
    public class SSM110OnloadObject
    {
        public bool Isavailable { get; set; }
        public int ErrorNo { get; set; }
        public List<SSM110Object> Combdata { get; set; }
        public List<SSM110Object> Items { get; set; } = new List<SSM110Object>();
        public SSM110Object Item { get; set; } 
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

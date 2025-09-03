using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SMST004Obj
    {
        public string Status { get; set; }
        public bool ISEdit { get; set; }
        public string Mode { get; set; }
        public List<string> supp_map_id_col { get; set; }
        public List<string> end_pnt_nam_col { get; set; }
        public List<SMST004SrchRsltColl> srch_rslt_col { get; set; }
        public List<SMST004CmbRsltColl> srch_cmb_col { get; set; }
        public string act_inact_ind { get; set; }
        public string supp_map_id { get; set; }
        public string sndbx_end_pnt_nam { get; set; }
        public string prod_end_pnt_nam { get; set; }
        public string lst_pull_dt { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string pos_cd { get; set; }
        public string pos_actv_end_pnt { get; set; }
        public string pos_nam { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
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

    public class SMST004SrchRsltColl
    {
        public string act_inact_ind { get; set; }
        public string supp_map_id { get; set; }
        public string lst_pull_dt { get; set; }
        public string pos_cd { get; set; }
        public string pos_actv_end_pnt { get; set; }
        public string pos_nam { get; set; }
    }
    public class SMST004CmbRsltColl
    {
        public string pos_cd { get; set; }
        public string pos_nam { get; set; }
    }
}


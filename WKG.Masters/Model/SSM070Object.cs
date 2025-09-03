using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM070Object
    {
        public string supp_map_id {  get; set; }
        public string supp_nam {  get; set; }
        public string pos_cd {  get; set; }
        public string pos_nam {  get; set; }
        public string prod_end_pnt_nam { get; set; }
        public string sndbx_end_pnt_nam { get; set; }
        public string supp_ftp_img_dir { get; set; }
        public string lst_pull_dt { get; set; }
        public string pos_actv_end_pnt { get; set; }
        public bool act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public bool email_req { get; set; }
        public bool mobile_req { get; set; }
        public int PageNo {  get; set; }
        public int PageSize {  get; set; }
        public bool SortTyp {  get; set; }
        public string bkng_fee {  get; set; }
        public string bkng_fee_typ {  get; set; }

    }
    public class SSM070loadObject
    {
        public List<SSM070Object> Items { get; set; }
        public List<SSM070Object> SuppConfigList { get; set; }
        public List<SSM070Object> PosmastList { get; set; }
        public List<string> EndPointList { get; set; }
        public bool pos_avail { get; set; }
        public int CurrentPage { get; set; }

        public int TotalPages { get; set; }

        public int TotalRecords { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }
        public Dictionary<string, string> radios { get; set; }
       

    }
}

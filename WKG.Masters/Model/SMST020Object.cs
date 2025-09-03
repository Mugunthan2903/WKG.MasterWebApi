using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SMST020Object
    {
        public List<SMST020SrchRsltHome> srch_rslt { get; set; }
        public List<SMST020CmbRsltColl> Lng_cmb_rslt { get; set; }
        public List<SMST020CmbRsltExpGrpname> Exc_cmb_grp_name { get; set; }
        public List<SMST020CmbRsltExptuicat> Exc_cmb_tui_cat { get; set; }
        public List<SMST020CmbRsltExpvchtyp> Exc_cmb_vch_typ { get; set; }

        public List<SMST020ExpSrchdata> Exc_cmb_srch_data { get; set; }
        public string prod_id { get; set; }
        public dynamic Selectedrow { get; set; }
        public string tui_city_cd { get; set; }
        public string tui_city_nam { get; set; }
        public string tui_cntry_cd { get; set; }
        public string tui_cntry_nam { get; set; }
        public string act_inact_ind { get; set; }
        public string tui_city_aval { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
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
    public class SMST020SrchRsltHome
    {
        public string tui_prod_id { get; set; }
        public string tui_prod_nam { get; set; }
        public string tui_city_cd { get; set; }

        public string tui_city_nam { get; set; }
        public string cutoff_time { get; set; }
        public string tui_ctgry_ids { get; set; }
        public string act_inact_ind { get; set; }
        public string tui_prod_dtls { get; set; }
        public string tui_prod_aval { get; set; }
        public string mod_dttm { get; set; }
        public string mod_by_usr_cd { get; set; }

    }
    public class SMST020CmbRsltColl
    {
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
    }
    public class SMST020CmbRsltExpGrpname
    {
        public string pos_cd { get; set; }
        public string pos_grp_nam { get; set; }

    }
    public class SMST020CmbRsltExptuicat
    {
        public string tui_ctgry_id { get; set; }
        public string tui_ctgry_nam { get; set; }

    }
    public class SMST020CmbRsltExpvchtyp
    {
        public string vchr_typ_cd { get; set; }
        public string vchr_typ_nam { get; set; }

    }
    public class SMST020ExpSrchdata
    {
        public string prod_id { get; set; }
        public string mod_dttm { get; set; }
        public string pos_grp_id { get; set; }
        public string tui_ctgry_ids { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string wkg_markup { get; set; }
        public string vchr_typ_cd { get; set; }
        public string prod_featrd { get; set; }
        public string latitude { get; set; }
        public string longitude { get; set; }
        public string sort_ordr { get; set; }
        public string act_inact_ind { get; set; }

    }
    public class SMST022TableFields
    {
        public string tui_ctgry_id {  get; set; }
        public string tui_ctgry_nam { get; set; }
        public string tui_ctgry_lvl { get; set; }
        public string tui_prnt_id { get; set; }
        public string ctgry_typ { get; set; }
        public short sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public string shrt_nam { get; set; }
        public bool tui_ctgry_aval { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
    }
    public class SMST022SearchInputs
    {
        public int PageNo { get; set;}
        public int PageSize { get; set;}
        public string tui_ctgry_nam { get; set;}
        public bool sortType { get; set;}
    }
    
}


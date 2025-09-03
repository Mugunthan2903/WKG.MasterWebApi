using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM020Object
    {
        public List<SSM020SrchRsltHome> srch_rslt { get; set; }
        public List<SSM020SrchRsltHome> CityList { get; set; }
        public List<SSM020CmbRsltColl> Lng_cmb_rslt { get; set; }
        public List<SSM020CmbRsltExpGrpname> Exc_cmb_grp_name { get; set; }
        public List<SSM020CmbRsltExptuicat> Exc_cmb_tui_cat { get; set; }
        public List<SSM020GridExpLang> ExpLanggrid { get; set; }
        public List<SSM020Imagedata> GetImagedata { get; set; }
        public List<SSM020Overrides> GetOvrride { get; set; }
        public List<SSM020Overrides> Exc_cmb_srch_data { get; set; }
        public string ImageName { get; set; }
        public List<SSM020Newdatasectwo> Nwrsltsec { get; set; }
        public string lang_cd { get; set; }
        public string Savedata { get; set; }
        public string prod_id { get; set; }
        public dynamic Selectedrow { get; set; }
        public string tui_prod_id { get; set; }
        public string tui_prod_nam { get; set; }
        public string tui_city_cd { get; set; }
        public string dtl_tui_ctgry_ids { get; set; }
        public string tui_city_nam { get; set; }
        public string tui_cntry_cd { get; set; }
        public string tui_cntry_nam { get; set; }
        public string wkg_city_cd { get; set; }
        public string wkg_city_nam { get; set; }
        public string act_inact_ind { get; set; }
        public string tui_city_aval { get; set; }
        public string tui_prod_aval { get; set; }
        public string img_dir { get; set; }
        public string supp_map_id { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }

        public bool Isavailable { get; set; }

        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public bool? SortTypCity { get; set; }
        public Dictionary<string,string> BookingFeeType { get; set; }
        public string SupplierMapID { get; set; }
        public string ImageDirectory { get; set; }
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
    public class SSM020SrchRsltHome
    {
        public string tui_prod_id { get; set; }
        public string tui_prod_nam { get; set; }
        public string tui_city_cd { get; set; }
        public string ctgry_nam { get; set; }
        public string ctgry_typ_nam { get; set; }
        
        public string tui_city_nam { get; set; }
        public string cutoff_time { get; set; }
        public string tui_ctgry_ids { get; set; }
        public string act_inact_ind { get; set; }
        public string tui_prod_dtls { get; set; }
        public string tui_prod_aval { get; set; }
        public string mod_dttm { get; set; }
        public string mod_by_usr_cd { get; set; }

    }
    public class SSM020CmbRsltColl
    {
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
    }
    public class SSM020CmbRsltExpGrpname
    {
        public string pos_cd { get; set; }
        public string pos_grp_nam { get; set; }

    }
    public class SSM020CmbRsltExptuicat
    {
        public string tui_ctgry_id { get; set; }
        public string tui_ctgry_nam { get; set; }
        public bool tui_ctgry_aval { get; set; }
        public bool act_inact_ind { get; set; }

    }
    public class SSM020GridExpLang
    {
        public string tui_prod_id { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string tui_prod_nam { get; set; }

    }
    public class SSM020Imagedata
    {
        public string img_srl { get; set; }
        public string img_nam { get; set; }
        public string img_path { get; set; }
    }
    public class SSM020Overrides
    {
        public string Savedata { get; set; }
        public string ovrd_srl { get; set; }
        public string tui_prod_nam { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string tui_ctgry_ids { get; set; }
        public string prod_featrd { get; set; }
        public string sort_ordr { get; set; }       
        public string latitude { get; set; }
        public string longitude { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string img_srl { get; set; }
        public string img_url { get; set; }
        public string img_Ftp_url { get; set; }
        public string img_dir { get; set; }
        public string img_nam { get; set; }
        public string tui_prod_id { get; set; }
        public string lp_prod_typ { get; set; }
        public string lang_cd { get; set; }
        public string lang_srl { get; set; }
        public string ImageChanged { get; set; }
        public string OldImg { get; set; }
        public string prod_nam { get; set; }
        public string mod_dttm { get; set; }
        public string bkng_fee { get; set; }
        public string bkng_fee_typ { get; set; }
        public bool is_video { get; set; }
        public bool mnl_upld { get; set; }

    }
    public class SSM020Newdatasectwo
    {
        public string tui_prod_id { get; set; }
        public string lang_cd { get; set; }
        public string tui_prod_nam { get; set; }
        public string lang_srl { get; set; }
        public string supp_map_id { get; set; }
        public string prod_id { get; set; }
        public string prod_nam { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }

    }
    public class SSM020ExpSrchdata
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
    public class SSM022Object
    {
        public string tui_ctgry_id { get; set; }
        public string tui_ctgry_nam { get; set; }
        public string tui_ctgry_lvl { get; set; }
        public string tui_prnt_id { get; set; }
        public string ctgry_typ { get; set; }
        public string wkg_ctgry_ids { get; set; }
        public string ctgry_nam { get; set; }
        public string sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public string shrt_nam { get; set; }
        public bool tui_ctgry_aval { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
    }
    public class SSM022SearchInputs
    {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string tui_ctgry_nam { get; set; }
        public string act_inact_ind { get; set; }
        public string tui_ctgry_aval { get; set; }
        public bool sortType { get; set; }
    }
    public class SSM022TypeObject
    {
        public string tour_ctgry_id { get; set; }
        public string tour_ctgry_nam { get; set; }
        public bool act_inact_ind { get; set; }

    }

    public class SSM020OnloadObject
    {
        public List<SSM022Object> Items { get; set; }

        public List<SSM022TypeObject> CtgryType { get; set; }
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
    public class SSM023Object
    {
        
        public string excptn_srl { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string pos_grp_id { get; set; }
        public string pos_grp_nam { get; set; }
        public string wkg_markup { get; set; }
        public string wkg_markup_typ { get; set; }
        public string sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public bool prod_exist { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string mode { get; set; }
        public bool sortType { get; set; }
        public bool Isavailable { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public SSM023Object data { get; set; }
        public List<SSM023Object> comboList { get; set; }
        public PageInfo<SSM023Object> grid { get; set; }
        public Dictionary<string,string> BookingFeeType { get; set; }




    }

}


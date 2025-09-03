using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM130loadObject
    {
        public List<SSM130Object> Items { get; set; }
        public List<SSM135ExceptionLang> ExpLanggrid { get; set; }
        public List<SSM131Overrides> GetOvrride { get; set; }
        public List<SSM130FacilityObject> Facilities { get; set; }
        public int CurrentPage { get; set; }

        public int TotalPages { get; set; }

        public int TotalRecords { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }
        public string SupplierMapID { get; set; }
        public string ImageDirectory { get; set; }
        public string ImageName { get; set; }
        public Dictionary<string, string> BookingFeeType { get; set; }
    }

    public class SSM130Object
    {
        public string crrg_id { get; set; }
        public string supp_map_id { get; set; }
        public string crrg_nam { get; set; }
        public string crrg_vhcl_typs { get; set; }
        public string crrg_trms_url { get; set; }
        public bool act_inact_ind { get; set; }
        public bool crrg_prod_aval { get; set; }
        public bool? cpy_lead_gst { get; set; }
        public string lang_cd { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public dynamic Selectedrow { get; set; }

    }

    public class SSM130DifferentialOnload
    {
        public List<SSM130DifferentialObject> Items { get; set; }
        public List<SSM130DifferentialObject> WKG_Diff_ComboList { get; set; }

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
    public class SSM130DifferentialObject
    {
        public string diffrt_cd { get; set; }
        public string crrg_id { get; set; }
        public int diffrt_nam_srl { get; set; }
        public string diffrt_nam { get; set; }
        public int diffrt_min_age { get; set; }
        public int diffrt_max_age { get; set; }
        public int diffrt_desc_srl { get; set; }
        public string diffrt_desc { get; set; }
        public string sort_ordr { get; set; }
        public string wkg_diffrt_cd { get; set; }
        public bool act_inact_ind { get; set; }
        public bool diffrt_aval { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public string Mode { get; set; }
    }

    public class SSM130FacilityObject
    {
        public string fclty_id { get; set; }
        public string crrg_id { get; set; }
        public string fclty_cd { get; set; }
        public string supp_map_id { get; set; }
        public int fclty_nam_srl { get; set; }
        public string fclty_nam { get; set; }
        public int fclty_desc_srl { get; set; }
        public string fclty_desc { get; set; }
        public int wkg_img_srl { get; set; }
        public string img_nam { get; set; }
        public string img_dir { get; set; }
        public bool act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string Mode { get; set; }
        public bool? SortTyp { get; set; }
        public dynamic Selectedrow { get; set; }
    }
    public class SSM131Overrides
    {
        public string Mode { get; set; }
        public string ovrd_srl { get; set; }
        public string prod_nam { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string lang_cd { get; set; }
        public string lang_srl { get; set; }
        public string mod_dttm { get; set; }
        public string sort_ordr { get; set; }
        public string dstrbsn_srvc_untl { get; set; }
        public string bkng_fee { get; set; }
        public string bkng_fee_typ { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
    }
    public class SSM135ExceptionLang
    {
        public string prod_id { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string prod_nam { get; set; }
    }

    public class SSM137loadObject
    {
        public List<SSM137LocationObject> Items { get; set; }
    }
    public class SSM137LocationObject
    {
        public string Loc_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool Loc_prod_aval { get; set; }
        public string lang_cd { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public bool City_Srch { get; set; }
        public bool Area_Srch { get; set; }
        public bool Statn_Srch { get; set; }


        public string stn_cd { get; set; }
        public string stn_typ { get; set; }
        public string stn_nam { get; set; }
        public string stn_addr { get; set; }
        public string stn_lat { get; set; }
        public string stn_long { get; set; }
        public string stn_post { get; set; }
        public bool stn_aval { get; set; }

        public string Cntry_Cd { get; set; }
        public string Cntry_desc { get; set; }

        public string Cntry { get; set; }
    }

    public class SSM138loadObject
    {
        public List<SSM138Object> Items { get; set; }

        public List<SSM138PosGroupObject> PosGrpItem { get; set; }
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
    public class SSM138Object
    {
        public string combi_srl { get; set; }
        public string combi_nam { get; set; }
        public string pos_grp_ids { get; set; }
        public string dprt_stn_cds { get; set; }
        public string arvl_stn_cds { get; set; }
        public bool act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }

        public string Mode { get; set; }
    }
    public class SSM138PosGroupObject
    {
        public string pos_grp_id { get; set; }
        public string pos_grp_nam { get; set; }
        public bool act_inact_ind { get; set; }
    }
    
}

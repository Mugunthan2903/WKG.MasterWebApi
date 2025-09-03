using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM100Object
    {
        public List<SSM100Object> Product_Dtls { get; set; }
        public List<SSM101CityObject> City_List { get; set; }
        public List<SSM100SupplierList> Supplier_List { get; set; }
        public string vntrt_prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string vntrt_prod_nam { get; set; }
        public string vntrt_prod_cty_cd { get; set; }
        public string vntrt_city_nam { get; set; }
        public string vntrt_prod_dtls { get; set; }
        public bool act_inact_ind { get; set; }
        public bool vntrt_prod_aval { get; set; }
        public string vntrt_ctgry_nam { get; set; }
        public string tour_ctgry_nam { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string img_dir { get; set; }
        public bool Isavailable { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public bool? SortTypCity { get; set; }
        public dynamic Selectedrow { get; set; }
        public string SupplierMapID { get; set; }
        public string ImageDirectory { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalRecords { get; set; }
        public string ToothBus { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }
    }
    public class SSM100SupplierList
    {
        public string supp_map_id { get; set; }
        public string supp_nam { get; set; }

    }

    public class SSM101CityOnloadObject
    {
        public List<SSM101CityObject> Items { get; set; }
        public List<SSM101WKGCityList> WKG_City_List { get; set; }

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
    public class SSM101CityObject
    {
        public string vntrt_city_cd { get; set; }
        public string supp_map_id { get; set; }
        public string vntrt_city_nam { get; set; }
        public string vntrt_cntry_cd { get; set; }
        public string vntrt_cntry_nam { get; set; }
        public string wkg_city_cd { get; set; }
        public string wkg_city_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool vntrt_city_aval { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public bool? SortTyp { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
    }

    public class SSM101WKGCityList
    {
        public string ID { get; set; }
        public string Text { get; set; }
        public string act_inact_ind { get; set; }

    }

    public class SSM102OnloadObject
    {
        public List<SSM102CategoryObject> Items { get; set; }
        public List<SSM102TourCtgryMastObject> Tour_Ctgry_List { get; set; }

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
    public class SSM102CategoryObject
    {
        public string vntrt_ctgry_id { get; set; }
        public string supp_map_id { get; set; }
        public string vntrt_ctgry_nam { get; set; }
        public string wkg_ctgry_ids { get; set; }
        public string tour_ctgry_nam { get; set; }
        public string sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public bool vntrt_ctgry_aval { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string Mode { get; set; }
        public string mod_dttm { get; set; }
        public bool? SortTyp { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public dynamic Selectedrow { get; set; }
    }
    public class SSM102TourCtgryMastObject
    {
        public string tour_ctgry_id { get; set; }
        public string tour_ctgry_nam { get; set; }
        public bool act_inact_ind { get; set; }

    }
    public class SSM103loadObject
    {

        public List<SSM103ExceptionLang> ExpLanggrid { get; set; }
        public List<SSM103Imagedata> GetImagedata { get; set; }
        public List<SSM103Overrides> GetOvrride { get; set; }
        public List<SSM102TourCtgryMastObject> WKGCtgryList { get; set; }
        public List<SSM100Object> Items { get; set; }
        public string ImageName { get; set; }
        public int CurrentPage { get; set; }
        public Dictionary<string, string> BookingFeeType { get; set; }
        public string ImageDirectory { get; set; }
        public string wkg_ctgry_ids { get; set; }
        public int TotalPages { get; set; }

        public int TotalRecords { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }

    }
    public class SSM103Overrides
    {
        public string Savedata { get; set; }
        public string ovrd_srl { get; set; }
        public string prod_nam { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string lang_cd { get; set; }
        public string lang_srl { get; set; }
        public string img_srl { get; set; }
        public string img_url { get; set; }
        public string img_dir { get; set; }
        public string img_nam { get; set; }
        public string ImageChanged { get; set; }
        public string OldImg { get; set; }
        public string mod_dttm { get; set; }
        public bool prod_featrd { get; set; }
        public string latitude { get; set; }
        public string longitude { get; set; }
        public string cncl_plcy { get; set; }
        public bool cncl_rfnd { get; set; }
        public string sort_ordr { get; set; }
        public string bkng_fee { get; set; }
        public string bkng_fee_typ { get; set; }
        public string tui_ctgry_ids { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }

    }
    public class SSM103Imagedata
    {
        public string img_srl { get; set; }
        public string img_nam { get; set; }
        public string img_path { get; set; }

    }

    public class SSM103ExceptionLang
    {
        public string prod_id { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string prod_nam { get; set; }


    }

}
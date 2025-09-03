using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM200loadObject
    {
        public List<SSM200Object> Items { get; set; }

        public List<SSM200LangObject> LangItems { get; set; }

        public List<SSM200LangObject> LangItemsAll { get; set; }

        public List<SSM200SSMObject> SSMItems { get; set; }
        public List<SSM200AirportObject> AirportItem { get; set; }
        public List<SSM200AirportObject> AirportItemAll { get; set; }

        public List<SSM200EndpointObject> EndpointItem { get; set; }
        public List<SSM020SrchRsltHome> TuiCityItem { get; set; }
        public List<SSM200ApiEnableObject> ApiEnableItem { get; set; }
        public List<SelectBox> PosNameList { get; set; }
        public int CurrentPage { get; set; }

        public int TotalPages { get; set; }

        public int TotalRecords { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }
        public List<SSM200ObjectEndpnts> Endpoint { get; set; }
        public List<SSM200ObjectEndpnts> SignalREndpoint { get; set; }
        public List<SSM200Objectcntrl> Cntrlmst { get; set; }

        public string end_pnt_nam { get; set; }
        public string end_pnt_key { get; set; }
        public string end_pnt_url { get; set; }
        public string gmap_key { get; set; }
        public string gmap_stylid { get; set; }
        public string ssm_pwd { get; set; }
        public string apis_enbld { get; set; }
        public string lang_cd { get; set; }
        public string pos_cntry_cd { get; set; }

        public string Pos_code { get; set; }
        public List<SelectBox> JourneyTpyeList { get; set; }
        public List<SelectBox> HomePageList { get; set; }
        public List<SelectBox> CartypeList { get; set; }
        public List<SelectBox> HomescreenList { get; set; }
        public List<SelectBox> PaymentTypList { get; set; }
        public List<SelectBox> CountryCodeList { get; set; }
        public List<SelectBox> UberSupplierList { get; set; }
        public List<SelectBox> UberPricingList { get; set; }
        public Dictionary<string, string> CarType { get; set; }

        public int SessionTimeoutSec { get; set; }
        public int AutoCloseTimeoutSec { get; set; }
        public int OnlineTimeoutMilliSec { get; set; }
        public int OnlineCheckMilliSec { get; set; }
        public int PaymentWaitMin { get; set; }
        public List<SelectBox> ThemeList { get; set; }
        public List<SelectBox> GmapCountryCodeList { get; set; }
        public List<SelectBox> PaymentDeviceLocation { get; set; }
        public List<SelectBox> PosconfigList { get; set; }
        public SSM219Object SSMAppConfig { get; set; }
        public string DBSuppMapID { get; set; }
        public Dictionary<string, string> HomeScreenTypes { get; set; }

    }
    public class SSM200ObjectEndpnts
    {
        public string end_pnt_nam { get; set; }
        public string end_pnt_key { get; set; }
        public string end_pnt_url { get; set; }
        public string end_pnt_typ { get; set; }
    }
    public class SSM200ApiEnableObject
    {
        public string supp_nam { get; set; }
        public string supp_map_id { get; set; }
        public bool act_inact_ind { get; set; }
    }

    public class SSM200Objectcntrl
    {
        public string gmap_key { get; set; }
        public string gmap_stylid { get; set; }
        public string img_dmn_path { get; set; }
        public string ftp_supp_img_url { get; set; }
        public string ftp_uid { get; set; }
        public string ftp_pwd { get; set; }
    }
    public class SSM200BlurObject
    {
        public bool Isavailable { get; set; }

        public SSM200Object Items { get; set; }
    }
    public class SSM200Object
    {
        public string pos_grp_id { get; set; }
        public string pos_grp_nam { get; set; }
        public string pos_cd { get; set; }
        public string lang_cds { get; set; }
        public string dflt_lang_cd { get; set; }
        public string end_pnt_nam { get; set; }
        public string tui_city_cds { get; set; }
        public string tour_city_nam { get; set; }
        public string auto_rfrsh_tm { get; set; }
        public string apis_enbld { get; set; }
        public string trm_appl_cds { get; set; }
        public string hmpg_typ { get; set; }
        public string hmpg_todo { get; set; }
        public string hmpg_slide { get; set; }
        public string hmpg_hlp { get; set; }
        public string hmpg_flght { get; set; }
        public string hmpg_cncl { get; set; }
        public string appl_arpt_srls { get; set; }
        public string dflt_arpt_srl { get; set; }
        public string dflt_arpt_jrny_typ { get; set; }
        public string dflt_car_typ { get; set; }
        public string ubr_all_cars { get; set; }
        public string ubr_supp { get; set; }
        public string ubr_bkngfee_dsply { get; set; }
        public string pos_pymnt_typ { get; set; }
        public string pos_cntry_cd { get; set; }
        public string bkng_fee { get; set; }
        public string act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
        public string post_cd { get; set; }
        public string car_typ { get; set; }
        public string dflt_arpt { get; set; }
        public string dflt_htl { get; set; }
        public string eshuttle { get; set; }
        public bool Isavailable { get; set; }
        public bool Homepg_Config { get; set; }
        public bool Popular_Dest { get; set; }
        public bool Trans_Config { get; set; }
        public bool Banner_Config { get; set; }
        public Dictionary<string, string> CarType { get; set; }
        public string img_nam { get; set; }
        public string img_dir { get; set; }
    }

    public class SSM200LangObject
    {
        public string lang_cd_mast { get; set; }
        public string lang_nam_mast { get; set; }

    }

    public class SSM200AirportObject
    {
        public string arpt_srl_mast { get; set; }

        public string arpt_nam_mast { get; set; }

    }

    public class SSM200EndpointObject
    {
        public string end_pnt_nam { get; set; }
        public string end_pnt_url { get; set; }
        public string end_pnt_key { get; set; }
    }

    public class SSM200SSMObject
    {
        public string ssm_id_mast { get; set; }
        public string ssm_nam_mast { get; set; }
        public string dflt_lang_cd_mast { get; set; }
        public string ssm_status_mast { get; set; }
    }

    public class SSM219Object
    {
        public string ssm_id { get; set; }
        public int ssn_tmout_scnd { get; set; }
        public int auto_cls_tmout_scnd { get; set; }
        public int onln_tmout_mscnd { get; set; }
        public int onln_chck_intrvl_mscnd { get; set; }
        public int pay_wt_mnts { get; set; }
        public int? barcd_rtry { get; set; }
        public string pay_dvc_loc { get; set; }
        public string gmap_key { get; set; }
        public string gmap_styl_id { get; set; }
        public string gmap_cntry_cd { get; set; }
        public string theme_nam { get; set; }
        public string apis_enbld { get; set; }
        public string ftp_url { get; set; }
        public string ftp_uid { get; set; }
        public string ftp_pwd { get; set; }
        public string lang_enbld { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public bool recordExists { get; set; }
    }
}
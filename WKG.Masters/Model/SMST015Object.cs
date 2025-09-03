using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    #region Object SMST015
    public class SMST015Object
    {

        public int ssm_srl { get; set; }
        public string ssm_id { get; set; }
        public string ssm_nam { get; set; }
        public string hmpg_car_typ { get; set; }
        public string hmpg_todo { get; set; }
        public string hmpg_slide { get; set; }
        public string hmpg_concier_hlp { get; set; }
        public string hmpg_concier_flght { get; set; }
        public string hmpg_concier_cncl { get; set; }
        public string email_req { get; set; }
        public string dflt_arpt_srl { get; set; }
        public string appl_arpt_srls { get; set; }
        public string arpt_jrny_typ { get; set; }
        public string ubr_all_cars { get; set; }
        public string ubr_bkng_fee { get; set; }
        public string mj_bkng_fee { get; set; }
        public string dflt_loc_desc { get; set; }
        public string dflt_loc_lat { get; set; }
        public string dflt_loc_lon { get; set; }
        public string dflt_loc_post_cd { get; set; }
        public string dflt_loc_shrt_nam { get; set; }
        public string act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }

    }
    public class SMST015SSMObject
    {
        public string ssm_id_mast { get; set; }
        public string ssm_nam_mast { get; set; }

    }
    public class SMST015AirportObject
    {
        public string arpt_srl_mast { get; set; }

        public string arpt_nam_mast { get; set; }

    }
    public class SMST015loadObject
    {
        public List<SMST015Object> Items { get; set; }

        public List<SMST015SSMObject> SSMItem { get; set; }

        public List<SMST015AirportObject> AirportItem { get; set; }
        public List<SMST015AirportObject> AirportItemAll { get; set; }
        
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
    public class SMST015BlurObject
    {
        public List<SMST015Object> Items { get; set; }

        public bool Isavailable { get; set; }
    }

    #endregion

    #region Object SMST016
    public class SMST016loadObject
    {
        public List<SMST016Object> Items { get; set; }

        public List<SMST016LangObject> LangItems { get; set; }

        //public List<SMST016LangObject> LangItemsAll { get; set; }
        
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
    public class SMST016LangObject
    {
        public string lang_cd_mast { get; set; }
        public string lang_nam_mast { get; set; }

    }
    public class SMST016BlurObject
    {
        public List<SMST016Object> Items { get; set; }

        public bool Isavailable { get; set; }
    }
    public class SMST016Object
    {

        public int lang_srl { get; set; }
        public int ssm_srl { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string car_head { get; set; }
        public string todo_head { get; set; }
        public string slide_head { get; set; }
        public string concier_head { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string act_inact_ind { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }

    }
    #endregion

    #region Object SMST017
    public class SMST017loadObject
    {
        public List<SMST017Object> Items { get; set; }

        public List<SMST016LangObject> LangItems { get; set; }

        public List<SMST017SlideObject> SlideItems { get; set; }
        

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
    public class SMST017Object
    {

        public int slide_srl { get; set; }
        public int ssm_srl { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string slide_img { get; set; }
        public string form_id { get; set; }
        public string prod_id { get; set; }
        public string sort_ordr { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string act_inact_ind { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }

    }
    public class SMST017BlurObject
    {
        public List<SMST017Object> Items { get; set; }

        public bool Isavailable { get; set; }
    }
    public class SMST017SlideObject
    {
        public string form_id_mast { get; set; }
        public string form_nam_mast { get; set; }
        public string prod_dtl_aval { get; set; }

    }
    #endregion

    #region Object SMST018

    public class SMST018loadObject
    {
        public List<SMST018Object> Items { get; set; }

        public List<SMST016LangObject> LangItems { get; set; }
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

    public class SMST018BlurObject
    {
        public List<SMST018Object> Items { get; set; }

        public bool Isavailable { get; set; }
    }
    public class SMST018Object
    {
       // public int slide_srl { get; set; }
        public int ssm_srl { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string slide_img { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string act_inact_ind { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
    }

    #endregion

}

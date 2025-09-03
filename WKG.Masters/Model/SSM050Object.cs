using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM050Object
    {
        public string EXSavedata { get; set; }
        public dynamic Selectedrow { get; set; }
        public string bg_prod_id { get; set; }
        public string bg_prod_nam { get; set; }
        public string lang_cd { get; set; }
        public string bg_prod_dtls { get; set; }
        public string bg_prod_aval { get; set; }
        public string act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public bool sortType { get; set; }
        public string pos_grp_id { get; set; }
        public string prod_id { get; set; }
        public string excptn_srl { get; set; }
        public string wkg_markup { get; set; }
        public string wkg_markup_typ { get; set; }
        public string img_dir { get; set; }

        public string lang_srl { get; set; }
        public string prod_nam { get; set; }
        public string supp_map_id { get; set; }

        public string sort_ordr { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
    }

    public class SSM050loadObject
    {

        public List<SSM050GridExpLang> ExpLanggrid { get; set; }
        public List <SSM050Imagedata> GetImagedata { get; set; }
        public List<SSM051Overrides> GetOvrride { get; set; }
        public List<SSM050Object> Items { get; set; }
        public string ImageName { get; set; }
        public int CurrentPage { get; set; }
        public Dictionary<string,string> BookingFeeType { get; set; }
        public string BigbusSuppID { get; set; }
        public string ImageDirectory { get; set; }

        public int TotalPages { get; set; }

        public int TotalRecords { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }

    }
    public class SSM050GridExpLang
    {
        public string bg_prod_id { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string bg_prod_nam { get; set; }

    }
    public class SSM050Imagedata
    {
        public string img_srl { get; set; }
        public string img_nam { get; set; }
        public string img_path { get; set; }

    }

    public class SSM051Overrides
    {
        public string Savedata { get; set; }
        public string ovrd_srl { get; set; } 
        public string bg_prod_id { get; set; }
        public string bg_prod_nam { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string mod_by_usr_cd { get; set; }
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

    }
}

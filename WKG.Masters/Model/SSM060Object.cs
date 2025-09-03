using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM060Object
    {
        public string lp_prod_id { get; set; }
        public string lp_prod_nam { get; set; }
        public string supp_map_id { get; set; }
        public string lang_cd { get; set; }
        public string adult_aval { get; set; }
        public string child_aval { get; set; }
        public string act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public string sort_ordr { get; set; }
        public string adult_price { get; set; }
        public string child_price { get; set; }
        public string bkng_fee { get; set; }
        public string bkng_fee_typ { get; set; }
        public string ovrd_srl { get; set; }

        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
    }
    public class SSM060LoadObject
    {
        public List<SSM061GridObject> EditGrid { get; set; }
        public List<SSM060Object> Items { get; set; }
        public SSM060Object PrdDtl { get; set; }
        public SSM060Object PrdOvrdDtl { get; set; }

        public int CurrentPage { get; set; }

        public int TotalPages { get; set; }

        public int TotalRecords { get; set; }

        public void SetPages(int totalRecords, int pageSize)
        {
            TotalRecords = totalRecords;
            TotalPages = totalRecords / pageSize;
            TotalPages += ((totalRecords % pageSize > 0) ? 1 : 0);
        }
        public Dictionary<string,string> radios { get; set; }
        public string SupplierMapID { get; set; }
        public string ImageDirectory { get; set; }

    }
    public class SSM061GridObject
    {
        public string lp_prod_id { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string lp_prod_nam { get; set; }

    }
    public class SSM062Object
    {
        public string Mode { get; set; }
        public dynamic Selectedrow { get; set; }
        public string lp_prod_id { get; set; }
        public string lp_prod_nam { get; set; }
        public string pos_grp_id { get; set; }
        public string excptn_srl { get; set; }
        public string wkg_markup { get; set; }
        public string wkg_markup_typ { get; set; }
        public string sort_ordr { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string act_inact_ind { get; set; }
        public string prod_id { get; set; }
        public string lang_cd { get; set; }
        public string prod_nam { get; set; }
        public string lang_srl { get; set; }
        public string supp_map_id { get; set; }

    }
    public class SSM064loadObject
    {
        public List<SSM064GridObject> EditGrid { get; set; }
        public List<SSM064Image> Image { get; set; }
        public List<SSM020CmbRsltColl> LangList { get; set; }
        public List<SSM065NoteObject> Notes { get; set; }
        public Dictionary<string, string> LP_Prod_Type { get; set; }
        public string ImageName { get; set; }
        public string lp_prod_id { get; set; }
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

    public class SSM064Image
    {
        public string img_url { get; set; }
        public string img_srl { get; set; }
        public string img_srl_old { get; set; }
        public string img_nam { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string img_dir { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string OldImg { get; set; }
        public string ImageChanged { get; set; }
        public string Mode { get; set; }

    }
    public class SSM064GridObject
    {
        public string lp_prod_id { get; set; }
        public string lp_prod_nam { get; set; }
        public string lp_srl { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string lang_srl { get; set; }
        public string supp_map_id { get; set; }
        public string lp_info_head { get; set; }
        public string lp_info_desc { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string Mode { get; set; }
        public string note_srl { get; set; }
        public string note { get; set; }
        public string sort_ordr { get; set; }
        public string img_dir { get; set; }
        public dynamic Selectedrow { get; set; }
        public string InfoChanged { get; set; }
        public string NotesChanged { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
        public bool Isavailable { get; set; }

    }

    public class SSM065NoteObject
    {
        public string note_srl { get; set; }
        public string lp_srl { get; set; }
        public string note { get; set; }
        public string sort_ordr { get; set; }
    }
}





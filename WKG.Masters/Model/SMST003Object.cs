using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SMST003Object
    {

        public int pos_grp_id { get; set; }
        public string pos_cd { get; set; }
        public string pos_grp_nam { get; set; }
        public string act_inact_ind { get; set; }
        public string lang_cds { get; set; }
        public string dflt_lang_cd { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public bool IsEdit { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }

    }

    public class SMST003posObject
    {
        public string pos_cd_mast { get; set; }
        public string pos_nam_mast { get; set; }

    }

    public class SMST003langObject
    {
        public string lang_name_mast { get; set; }

        public string lang_cds_mast { get; set; }

    }

    public class SMST003loadObject
    {
        public List<SMST003Object> Items { get; set; }

        public List<SMST003langObject> LangItem { get; set; }

        public List<SMST003langObject> LangItemAll { get; set; }

        public List<SMST003posObject> PosItem { get; set; }
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

    public class SMST003BlurObject
    {
        public List<SMST003Object> Items { get; set; }

        public bool Isavailable { get; set; }
    }



}

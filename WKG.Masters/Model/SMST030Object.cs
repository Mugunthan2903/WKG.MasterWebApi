using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SMST031TableFields
    {
        public string evnt_typ_id { get; set; }
        public string evnt_typ_nam { get; set; }
        public string evnt_shrt_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool evnt_typ_aval {  get; set; }
        public string sort_ordr { get; set; }
        public string mod_dttm { get; set; }
        public string mod_by_usr_cd { get; set; }
    }
    public class SMST031SearchFields
    {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string evnt_typ_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool sortType { get; set; }
    }
    public class SMST032TableFields
    {
        public string dlvry_typ_id { get; set; }
        public string dlvry_typ_nam { get; set; }
        public string dlvry_shrt_nam { get; set; }
        public string dlvry_price { get; set; }
        public string dlvry_wkg_markup { get; set; }
        public bool act_inact_ind { get; set; }
        public bool dlvry_typ_aval { get; set; }
        public string mod_dttm { get; set; }
        public string mod_by_usr_cd { get; set; }
    }
    public class SMST032SearchFields
    {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string dlvry_typ_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool sortType { get; set; }
    }
}

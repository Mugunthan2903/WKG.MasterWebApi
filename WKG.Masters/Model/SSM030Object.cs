using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM031TableFields
    {
        public string evnt_typ_id { get; set; }
        public string evnt_typ_nam { get; set; }
        public string evnt_shrt_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool evnt_typ_aval { get; set; }
        public string sort_ordr { get; set; }
        public string mod_dttm { get; set; }
        public string mod_by_usr_cd { get; set; }
    }
    public class SSM031SearchFields
    {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string evnt_typ_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool evnt_typ_aval { get; set; }
        public bool sortType { get; set; }
    }
    public class SSM032TableFields
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
    public class SSM032SearchFields
    {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string dlvry_typ_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool dlvry_typ_aval { get; set; }
        public bool sortType { get; set; }
    }
    public class SSM030TableFields
    {
        public string ltd_prod_id {  get; set; }
        public string supp_map_id {  get; set; }
        public string start_dt {  get; set; }
        public string end_dt {  get; set; }
        public dynamic gridItems { get; set; }
        public string ltd_evnt_nam {  get; set; }
        public string evnt_typ_nam {  get; set; }
        public bool act_inact_ind { get; set; }
        public bool ltd_prod_aval { get; set; }
        public string mod_dttm { get; set; }
        public string mod_by_usr_cd { get; set; }
    }
    public class SSM030SearchFields
    {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string ltd_evnt_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public bool ltd_prod_aval { get; set; }
        public bool? sortType { get; set; }
        public bool? stdtsortType { get; set; }
        public bool? endtsortType { get; set; }
    }
    public class SSM034TableFields
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
        public bool sortType { get; set; }
        public bool Isavailable { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public SSM034TableFields data { get; set; }
        public List<SSM034TableFields> comboList { get; set; }
        public PageInfo<SSM034TableFields> grid { get; set; }
        public Dictionary<string,string> radios { get; set; }
    }
    public class SSM033TableFields
    {
        public string ovrd_srl { get; set; }
        public int lang_srl { get; set; }
        public string img_srl { get; set; }
        public string prod_id { get; set; }
        public string supp_map_id { get; set; }
        public string lang_cd { get; set; }
        public string lang_nam { get; set; }
        public string prod_nam { get; set; }
        public string latitude { get; set; }
        public string longitude { get; set; }
        public short? sort_ordr { get; set; }
        public string mode { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string img_url { get; set; }
        public string ImageName { get; set; }
        public string img_nam { get; set; }
        public string ImageChanged { get; set; }
        public string OldImg { get; set; }
        public string img_dir { get; set; }
        public string bkng_fee_typ { get; set; }
        public string bkng_fee { get; set; }
        public bool prod_exist { get; set; }
        public bool prod_featrd { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public PageInfo<SSM033TableFields> table2 { get; set; }
        public SSM033TableFields data { get; set; }
        public List<SSM033TableFields> comboList { get; set; }
        public SSM033ImageDetails image {  get; set; }
        public Dictionary<string, string> radios { get; set; }

    }
    public class SSM033ImageDetails
    {
        public string img_srl { get; set; }
        public string img_nam { get; set; }
        public string img_path { get; set; }
    }

    public class SSM030OnloadObject
    {
        public List<SSM030TableFields> Items { get; set; }
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
    }
}

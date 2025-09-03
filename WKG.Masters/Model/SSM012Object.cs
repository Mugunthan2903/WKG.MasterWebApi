using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM012SecExistIndex
    {
        public int Sec1Index { get; set; }
        public int Sec1hmpgsrl { get; set; }
        public bool Sec2Exist { get; set; }
        public int Sec2Index { get; set; }
        public int Sec2hmpgsrl { get; set; }
        public bool Sec3Exist { get; set; }
        public int Sec3Index { get; set; }
        public int Sec3hmpgsrl { get; set; }
        public bool Sec4Exist { get; set; }
        public int Sec4Index { get; set; }
        public int Sec4hmpgsrl { get; set; }
    }
    public class SSM012TableFields
    {
        public int? head_data_srl_sec1 { get; set; }
        public int? head_data_srl_sec2 { get; set; }
        public int? head_data_srl_sec3 { get; set; }
        public int? head_data_srl_sec4 { get; set; }
        public int? cptn_data_srl { get; set; }
        public int? cptn_data_srl_sec2 { get; set; }
        public string head_img_srl { get; set; }
        public string sec_typ { get; set; }
        public string tot_aval_txt { get; set; }
        public int? aval_typ_data_srl { get; set; }
        public string aval_typ_data { get; set; }
        public string Image { get; set; }
        public string BackgroundColor { get; set; }
        public string Button { get; set; }
        public string head_img_nam { get; set; }
        public string? bg_img { get; set; }
        public string? hdr_img { get; set; }
        public string img_dir { get; set; }
        public string? cptn_bg_clr { get; set; }
        public string? form_id { get; set; }
        public string? mode { get; set; }
        public short? pos_grp_id { get; set; }
        public string? mod_by_usr_cd { get; set; }
        public string? mod_dttm { get; set; }
        public string form_nam { get; set; }
        public string ImageName { get; set; }
        public string? sort_ordr { get; set; }
        public int? hmpg_srl { get; set; }
        public bool? act_inact_ind { get; set; }
        public bool isImageChanged { get; set; }
        public bool oldImage { get; set; }
        public bool oldhdrImage { get; set; }
        public bool Sec2Exist { get; set; }
        public bool Sec3Exist { get; set; }
        public bool Sec4Exist { get; set; }
        public bool todoExist { get; set; }
        public bool cntTxtExist { get; set; }
        public int? slide_srl { get; set; }
        public int? todo_srl { get; set; }
        public int? img_srl { get; set; }
        public string? todo_bg_clr { get; set; }
        public string? todo_grdnt_clr { get; set; }
        public string? todo_img { get; set; }
        public int? data_srl { get; set; }
        public string? todoName { get; set; }
        public string? slide_img { get; set; }
        public string? en_GB { get; set; }
        public int PageSize { get; set; }
        public int PageNo { get; set; }
        public int TableNo { get; set; }
        public List<SSM012ComboBoxes> todoList { get; set; }
        public List<SSM012ComboBoxes> supplierList { get; set; }
        public List<SSM012ComboBoxes> ProductList { get; set; }
        public List<SSM012ComboBoxes> TourCategoryList { get; set; }
        public SSM012TableFields data { get; set; }
        public int? Sec1hmpgsrl { get; set; }
        public int? Sec2hmpgsrl { get; set; }
        public int? Sec3hmpgsrl { get; set; }
        public int? Sec4hmpgsrl { get; set; }
        public bool hdrImgRm { get; set; }
        public string supp_map_id { get; set; }
        public string prod_id { get; set; }
        public string linkType { get; set; }
        public string wkg_ctgry_id { get; set; }

        public string hmpg_sctn_cd { get; set; }
        public string head_data { get; set; }
        public string cptn_data { get; set; }
        public string img_nam { get; set; }
        public string fnl_path_img { get; set; }
        public string todo_nam { get; set; }
        public Dictionary<string, string> LinkTypeSC { get; set; }
        public List<SelectBox> TypeList { get; set; }
    }
    public class imageDir
    {
        public string sld_img_dir { get; set; }
        public string todo_img_dir { get; set; }
        public string ssm_img_dir { get; set; }
        public int LastInsertedID { get; set; }
    }
    public class SSM012ComboBoxes
    {
        public int data_srl { get; set; }
        public string enGB { get; set; }
        public string form_id { get; set; }
        public string form_nam { get; set; }
        public string id { get; set; }
        public string supp_map_id { get; set; }
        public string prod_id { get; set; }
        public string prod_nam { get; set; }
        public string tour_ctgry_id { get; set; }
        public string tour_ctgry_nam { get; set; }
        public bool act_inact_ind { get; set; }
    }
    public class SSM012CheckExist
    {
        public bool isPosGrpIdExist { get; set; }
        public SSM012SecExistIndex SectionExist { get; set; }
        public List<SSM012TableFields> FormData { get; set; }
    }
    public class SSM012InitLoad
    {
        public List<SSM012ComboBoxes> HeaderTextSec1 { get; set; }
        public List<SSM012ComboBoxes> HeaderCitySec2 { get; set; }
        public List<SSM012ComboBoxes> TodoSec2 { get; set; }
        public List<SSM012ComboBoxes> FormId { get; set; }
        public SSM012CheckExist posIdExist { get; set; }
        public string ImageName { get; set; }
        public string Grphmpgtyp { get; set; }
        public PageInfo<SSM012TableFields> Section2Table { get; set; }
        public PageInfo<SSM012TableFields> Section3Table { get; set; }
        public PageInfo<SSM012TableFields> Section4Table { get; set; }
        public SSM010Object Grpmastinfo { get; set; }
        public List<SSM012TableFields> Homepage { get; set; }
        public List<SSM012TableFields> Slide { get; set; }
        public List<SSM012TableFields> Todo { get; set; }
        public Dictionary<string, string> HomeScreenList { get; set; }
    }
    public class SSM014TableFields
    {
        public string poplr_srl { get; set; }
        public short pos_grp_id { get; set; }
        public string loc_desc { get; set; }
        public string loc_shrt_nam { get; set; }
        public string loc_lat { get; set; }
        public string loc_lon { get; set; }
        public string loc_post_cd { get; set; }
        public string? sort_ordr { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public string mode { get; set; }

    }
    public class SSM014SearchFields
    {
        public string loc_desc { get; set; }
        public short pos_grp_id { get; set; }
        public int PageNo;
        public int PageSize;
    }
    //SSM023

}

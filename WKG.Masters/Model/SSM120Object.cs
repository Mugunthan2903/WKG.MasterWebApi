using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model
{
    public class SSM120Object
    {
        public List<SSM120GriDdata> Grid_List { get; set; }
        public List<SSM120SupplierData> Supplier_List { get; set; }
        public string Mode { get; set; }
        public string supp_map_id { get; set; }
        public string dtl_srl { get; set; }
        public string act_inact_ind { get; set; }
        public string wkg_city_cd { get; set; }
        public string prod_nam { get; set; }
        public bool? SortTyp { get; set; }
        public bool? SortTypCity { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
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
    public class SSM120GriDdata
    {
        public string ovrd_srl { get; set; }
        public string dtl_srl { get; set; }
        public string wkg_city_cd { get; set; }
        public string wkg_city_cds { get; set; }
        public string wkg_city_nams { get; set; }
        public string city_desc { get; set; }
        public string supp_map_id { get; set; }
        public string supp_nam { get; set; }
        public string prod_id { get; set; }
        public string prod_nam { get; set; }
        public string sort_ordr { get; set; }
        public bool act_inact_ind { get; set; }
        public bool prod_featrd { get; set; }
        public string mod_by_usr_cd { get; set; }
        public dynamic Selectedrow { get; set; }
    }
    public class SSM120SupplierData
    {
        public string supp_map_id { get; set; }
        public string supp_nam { get; set; }
    }

}

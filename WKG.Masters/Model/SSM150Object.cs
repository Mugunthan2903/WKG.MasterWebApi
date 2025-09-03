using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM150loadObject
    {
        public List<SSM150Object> Items { get; set; }

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

    public class SSM151loadObject
    {
       public List<SSM151Object> Items { get; set; }

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

    public class SSM150Object
    {
        public string diff_id { get; set; }
        public string diff_nam { get; set; }
        public bool act_inact_ind { get; set; }
        public  string loc_typ_nam { get; set; }
        public string loc_typ_cd { get; set; }   
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public dynamic Selectedrow { get; set; }

    }

    public class SSM151Object
    {
        public string fare_nam { get; set; }
        public string fare_cd { get; set; }
        public bool act_inact_ind { get; set; }
        public string supp_map_id { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool? SortTyp { get; set; }
        public dynamic Selectedrow { get; set; }

    }

}

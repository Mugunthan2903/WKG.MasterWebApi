using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SSM005Object
    {
        public string ssm_id { get; set; }
        public string ssm_nam { get; set; }
        public string pos_grp_id { get; set; }
        public string rfrsh_crtd { get; set; }
        public string rfrsh_schdld { get; set; }
        public string rfrsh_compl { get; set; }
        public string schdld_date { get; set; }
        public string schdld_time { get; set; }
        public string ver_num { get; set; }
        public string Mode { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }

        public string rfrsh_by_usr_cd { get; set; }
        public dynamic Selectedrow { get; set; }


    }
    public class SSM005GroupObject
    {
        public string pos_grp_id { get; set; }
        public string pos_grp_nam { get; set; }

    }
    public class SSM005SSMObject
    {
        public string ssm_id { get; set; }
        public string ssm_nam { get; set; }

    }

    public class SSM005loadObject
    {
        public List<SSM005Object> Items { get; set; }
        public List<SSM005GroupObject> GroupItems { get; set; }

        public List<SSM005SSMObject> SSMItems { get; set; }
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


}



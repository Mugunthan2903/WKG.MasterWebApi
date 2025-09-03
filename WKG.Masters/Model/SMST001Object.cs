using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model
{
    public class SearchInput
    {
        public string Name { get; set; }
        public string Status { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }
        public string pos_cd { get; set; }
        public string Mode { get; set; }
        
    }
    public class SMST001Object
    {
        public string ISEdit { get; set; }
        public string pos_cd { get; set; }
        public string pos_nam { get; set; }
        public string act_inact_ind { get; set; }
        public string mod_by_usr_cd { get; set; }
        public string mod_dttm { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public bool SortTyp { get; set; }


    }
}

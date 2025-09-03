using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WKG.Masters.Model {
        public class SMST002TableFields {
            public string lang_cd;
            public string lang_nam;
            public string tui_lang_cd;
            public bool act_inact_ind;
            public string mod_by_usr_cd;
            public string mod_dttm;
            public bool isEdit;
        }
        public class SMST002SearchInputs {
            public string lang_name;
            public string act_inact_ind;
            public int PageNo;
            public int PageSize;
            public bool TuiAsc;
        }
        public class SMST002PopulateFormId {
            public string lang_cd;
        }
        public class SMST002CheckPrimaryReturn
        {
            public bool isPrimaryExist {  get; set; }
            public List<SMST002TableFields> editFields { get; set;}
        }
    
}

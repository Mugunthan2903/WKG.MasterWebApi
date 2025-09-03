using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKL.Service.Domain;

namespace WKG.Masters.Model {
    public class SMST010InputFields {
            public string ssm_id;
            public short pos_grp_id;
            public string pos_grp_nam;
            public string ssm_nam;
            public string ssm_status;
            public string refresh_type;
            public string schedule_date;
            public string endpoint;
            public string mod_by_usr_cd;
            public string mod_dttm;
            public string last_rfrsh;
            public bool isEdit;
            public string mode;
            public int PageSize;
            public int PageNo;
    }
    public class SMST010PosGroupFields {
        public short pos_grp_id;
        public string pos_grp_nam;
    }
    public class SMST010EndPointFields {
        public string end_pnt_nam;
    }
    public class SMST010SearchFields {
        public string pos_grp_nam;
        public string ssm_status;
        public bool ssmAsc;
        public int PageNo;
        public int PageSize;
    }
    public class SMST010Tables {
        public PageInfo<SMST010InputFields> InputFields;
        public List<SMST010PosGroupFields> GroupFields;
        public List<SMST010EndPointFields> EndPointFields;
    }
    public class SMST010CheckPrimaryReturn
    {
        public bool isPrimaryExist { get; set; }
        public List<SMST010InputFields> editFields { get; set; }
    }
}

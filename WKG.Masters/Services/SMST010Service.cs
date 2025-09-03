using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using WKL.Service.Domain;

namespace WKG.Masters.Services {
    public class SMST010Service : WKLServiceManger, ISMST010Service {
        #region Constructor
        public SMST010Service( IServiceProvider serviceProvider, ILogger<SMST010Service> logger ) : base(serviceProvider, logger) { }
        #endregion
        #region Private Methods
        #endregion
        #region Public Methods
        public async Task<SMST010Tables> InitLoadData( SessionInfo sessionInfo, SMST010InputFields input ) {
            var output = new SMST010Tables();
            try {
                var dbParamters = new DBParameters();
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY sm.ssm_id) AS cnt,gm.pos_grp_nam,sm.ssm_nam,sm.ssm_id,sm.ssm_status,sm.last_rfrsh, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_config sm INNER JOIN wkg_pos_grp_mast gm on gm.act_inact_ind = 1 and gm.pos_grp_id = sm.pos_grp_id and sm.ssm_status = 1) AS temp WHERE temp.cnt BETWEEN 1 AND 10;select pos_grp_id,pos_grp_nam from wkg_pos_grp_mast where act_inact_ind=1;select end_pnt_nam from wkg_pos_end_pnts";

                PageInfo<SMST010InputFields> tbl1 = null;
                List<SMST010PosGroupFields> tbl2 = null;
                List<SMST010EndPointFields> tbl3 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0) {
                    tbl1 = new PageInfo<SMST010InputFields>();
                    int tolR = 0;
                    tbl1.Items = new List<SMST010InputFields>();
                        
                    foreach (DataRow r in DS.Tables[0].Rows) {
                        tolR= r.GetValue<int>("total_count");
                        SMST010InputFields obj1 = new SMST010InputFields();
                        obj1.ssm_nam = r.GetValue<string>("ssm_nam");
                        obj1.ssm_id = r.GetValue<string>("ssm_id");
                        obj1.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj1.ssm_status = r.GetValue<string>("ssm_status");
                        obj1.last_rfrsh = r.GetValue<string>("last_rfrsh");
                        tbl1.Items.Add(obj1);
                    }
                    tbl1.TotalRecords = tolR;
                    tbl1.TotalPages = (int)Math.Ceiling((double)tbl1.TotalRecords / input.PageSize);
                    tbl1.CurrentPage = input.PageNo;
                    tbl1.SetPages(tbl1.TotalRecords, input.PageSize);

                    tbl2 = new List<SMST010PosGroupFields>();
                    foreach (DataRow r in DS.Tables[1].Rows) {
                        SMST010PosGroupFields obj2 = new SMST010PosGroupFields();
                        obj2.pos_grp_id = r.GetValue<short>("pos_grp_id");
                        obj2.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        tbl2.Add(obj2);

                    }
                    tbl3 = new List<SMST010EndPointFields>();
                    foreach (DataRow r in DS.Tables[2].Rows) {
                        SMST010EndPointFields obj3 = new SMST010EndPointFields();
                        obj3.end_pnt_nam = r.GetValue<string>("end_pnt_nam");
                        tbl3.Add(obj3);
                    }
                    output.InputFields = tbl1;
                    output.GroupFields = tbl2;
                    output.EndPointFields = tbl3;
                }

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<PageInfo<SMST010InputFields>> SearchData( SessionInfo sessionInfo, SMST010SearchFields input ) {
            var output = new PageInfo<SMST010InputFields>();
            try {
                var dbParameters = new DBParameters();
                dbParameters.Add("@pos_grp_nam", input.pos_grp_nam);
                dbParameters.Add("@ssm_status", input.ssm_status == "true" ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                if (input.pos_grp_nam != "") {
                    query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY sm.ssm_id {(input.ssmAsc?"ASC":"DESC")}) AS cnt,gm.pos_grp_nam,sm.ssm_nam,sm.ssm_id,sm.ssm_status,sm.last_rfrsh, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_config sm INNER JOIN wkg_pos_grp_mast gm on gm.act_inact_ind = 1 and gm.pos_grp_id = sm.pos_grp_id and sm.ssm_status = @ssm_status and gm.pos_grp_nam = @pos_grp_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }else {
                    query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY sm.ssm_id {(input.ssmAsc ? "ASC" : "DESC")}) AS cnt,gm.pos_grp_nam,sm.ssm_nam,sm.ssm_id,sm.ssm_status,sm.last_rfrsh, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_config sm INNER JOIN wkg_pos_grp_mast gm on gm.act_inact_ind = 1 and gm.pos_grp_id = sm.pos_grp_id and sm.ssm_status = @ssm_status) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST010InputFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SMST010InputFields {
                        ssm_nam = r.GetValue<string>("ssm_nam"),
                        ssm_id = r.GetValue<string>("ssm_id"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        ssm_status = r.GetValue<string>("ssm_status"),
                        last_rfrsh = r.GetValue<string>("last_rfrsh"),
                    };
                });
                output.TotalRecords = tolR;
                output.TotalPages = (int)Math.Ceiling((double)output.TotalRecords / input.PageSize);
                output.CurrentPage = tolR == 0 ? 1 : input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SMST010InputFields input ) {
            var output = new OperationStatus();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", input.ssm_id);
                dbParamters.Add("@ssm_nam", input.ssm_nam==""?null: input.ssm_nam);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@refresh_type", input.refresh_type);
                dbParamters.Add("@schedule_date", input.schedule_date);
                dbParamters.Add("@endpoint", input.endpoint);
                dbParamters.Add("@ssm_status", input.ssm_status=="true"?1:0);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query="";
                if (input.mode == "UPDATE") {
                    if (input.refresh_type == "1") {
                        query = $"UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = null,hrd_rfrsh_schdld=null,emrgncy_rfrsh_crtd=null,rfrsh_crtd=null,rfrsh_schdld=null where ssm_id=@ssm_id;UPDATE wkg_pos_ssm_config SET pos_grp_id = @pos_grp_id,hrd_rfrsh_crtd = getdate(),hrd_rfrsh_schdld = FORMAT(CONVERT(datetime, @schedule_date, 127), 'yyyy-MM-dd HH:mm:ss'),ssm_nam = @ssm_nam,ssm_status = @ssm_status,end_pnt_nam=@endpoint,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where ssm_id=@ssm_id;";
                    } else if(input.refresh_type == "2") {
                        query = $"UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = null,hrd_rfrsh_schdld=null,emrgncy_rfrsh_crtd=null,rfrsh_crtd=null,rfrsh_schdld=null where ssm_id=@ssm_id;UPDATE wkg_pos_ssm_config SET pos_grp_id = @pos_grp_id,emrgncy_rfrsh_crtd = getdate(),ssm_nam = @ssm_nam,ssm_status = @ssm_status,end_pnt_nam=@endpoint,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where ssm_id=@ssm_id;";
                    } else if(input.refresh_type == "3") {
                        query = $"UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = null,hrd_rfrsh_schdld=null,emrgncy_rfrsh_crtd=null,rfrsh_crtd=null,rfrsh_schdld=null where ssm_id=@ssm_id;UPDATE wkg_pos_ssm_config SET pos_grp_id = @pos_grp_id,rfrsh_crtd = getdate(),rfrsh_schdld = FORMAT(CONVERT(datetime, @schedule_date, 127), 'yyyy-MM-dd HH:mm:ss'),ssm_nam = @ssm_nam,ssm_status = @ssm_status,end_pnt_nam=@endpoint,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where ssm_id=@ssm_id;";
                    } else if (input.refresh_type == "4") {
                        query = $"UPDATE wkg_pos_ssm_config SET pos_grp_id = @pos_grp_id,ssm_nam = @ssm_nam,ssm_status = @ssm_status,end_pnt_nam=@endpoint,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where ssm_id=@ssm_id;";
                    }
                } else {
                    if(input.refresh_type == "1") {
                        query = $"INSERT INTO wkg_pos_ssm_config(ssm_id,pos_grp_id,hrd_rfrsh_crtd,hrd_rfrsh_schdld,ssm_nam,ssm_status,end_pnt_nam,mod_by_usr_cd,mod_dttm) VALUES(@ssm_id,@pos_grp_id,getdate(),FORMAT(CONVERT(datetime, @schedule_date, 127), 'yyyy-MM-dd HH:mm:ss'),@ssm_nam,@ssm_status,@endpoint,@mod_by_usr_cd,getdate());";
                    } else if(input.refresh_type == "2") {
                        query = $"INSERT INTO wkg_pos_ssm_config(ssm_id,pos_grp_id,emrgncy_rfrsh_crtd,ssm_nam,ssm_status,end_pnt_nam,mod_by_usr_cd,mod_dttm) VALUES(@ssm_id,@pos_grp_id,getdate(),@ssm_nam,@ssm_status,@endpoint,@mod_by_usr_cd,getdate());";
                    } else if(input.refresh_type == "3") {
                        query = $"INSERT INTO wkg_pos_ssm_config(ssm_id,pos_grp_id,rfrsh_crtd,rfrsh_schdld,ssm_nam,ssm_status,end_pnt_nam,mod_by_usr_cd,mod_dttm) VALUES(@ssm_id,@pos_grp_id,getdate(),FORMAT(CONVERT(datetime, @schedule_date, 127), 'yyyy-MM-dd HH:mm:ss'),@ssm_nam,@ssm_status,@endpoint,@mod_by_usr_cd,getdate());";
                    } else if(input.refresh_type == "4") {
                        query = $"INSERT INTO wkg_pos_ssm_config(ssm_id,pos_grp_id,ssm_nam,ssm_status,end_pnt_nam,mod_by_usr_cd,mod_dttm) VALUES(@ssm_id,@pos_grp_id,@ssm_nam,@ssm_status,@endpoint,@mod_by_usr_cd,getdate());";
                    }
                }
                using (var dbService = this.GetDBService()) {
                    using (var dbTran = dbService.BeginTransaction()) {
                        try {
                            await dbService.ExecuteSqlCommandAsync(query, dbParamters);

                            dbTran.Commit();
                            output.IsSuccess = true;
                        } catch (Exception ex) {
                            try {
                                dbTran.Rollback();
                            } catch (Exception ex1) { }
                        }
                    }
                }
            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<SMST010InputFields> LoadFormDataAsync( SessionInfo sessionInfo, SMST010InputFields input ) {
            var output = new List<SMST010InputFields>();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                string query = $"SELECT grp.ssm_id,grp.pos_grp_id,grp.ssm_nam,grp.ssm_status,end_pnt_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.hrd_rfrsh_schdld,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.hrd_rfrsh_schdld,108) AS hrd_rfrsh_schdld,REPLACE(CONVERT(VARCHAR,grp.emrgncy_rfrsh_crtd,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.emrgncy_rfrsh_crtd,108) AS emrgncy_rfrsh_crtd,REPLACE(CONVERT(VARCHAR,grp.rfrsh_schdld,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.rfrsh_schdld,108) AS rfrsh_schdld,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_config grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where grp.ssm_id = @ssm_id;";
                output = await this.DBUtils(true).GetEntityDataListAsync<SMST010InputFields>(query, dbParamters, r => {
                    var temp = new SMST010InputFields();
                    temp.ssm_id = r.GetValue<string>("ssm_id");
                    temp.ssm_nam = r.GetValue<string>("ssm_nam");
                    temp.pos_grp_id = r.GetValue<short>("pos_grp_id");
                    temp.endpoint = r.GetValue<string>("end_pnt_nam");
                    temp.ssm_status = r.GetValue<string>("ssm_status");
                    temp.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                    temp.mod_dttm = r.GetValue<string>("mod_dttm");
                    string hrsd_temp = r.GetValue<string>("hrd_rfrsh_schdld");
                    string ersd_temp = r.GetValue<string>("emrgncy_rfrsh_crtd");
                    string rsd_temp = r.GetValue<string>("rfrsh_schdld");
                    if(hrsd_temp == null && ersd_temp == null && rsd_temp == null) {
                        temp.refresh_type = "4";
                    }else if (hrsd_temp != null) {
                        temp.refresh_type = "1";
                        temp.schedule_date = hrsd_temp;
                    } else if(ersd_temp != null) {
                        temp.refresh_type = "2";
                    }else if(rsd_temp != null) {
                        temp.refresh_type = "3";
                        temp.schedule_date = rsd_temp;
                    }
                    return temp;
                });

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output[0];
        }
        public async Task<SMST010CheckPrimaryReturn> CheckPrimary( SessionInfo sessionInfo, SMST010InputFields input )
        {
            var output = new SMST010CheckPrimaryReturn();
            var temp = new List<SMST010InputFields>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                string query = $"SELECT grp.ssm_id,grp.pos_grp_id,grp.ssm_nam,grp.ssm_status,end_pnt_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.hrd_rfrsh_schdld,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.hrd_rfrsh_schdld,108) AS hrd_rfrsh_schdld,REPLACE(CONVERT(VARCHAR,grp.emrgncy_rfrsh_crtd,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.emrgncy_rfrsh_crtd,108) AS emrgncy_rfrsh_crtd,REPLACE(CONVERT(VARCHAR,grp.rfrsh_schdld,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.rfrsh_schdld,108) AS rfrsh_schdld,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_config grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where grp.ssm_id = @ssm_id;";
                temp = await this.DBUtils(true).GetEntityDataListAsync<SMST010InputFields>(query, dbParamters, r => {
                    var temp = new SMST010InputFields();
                    temp.ssm_id = r.GetValue<string>("ssm_id");
                    temp.ssm_nam = r.GetValue<string>("ssm_nam");
                    temp.pos_grp_id = r.GetValue<short>("pos_grp_id");
                    temp.endpoint = r.GetValue<string>("end_pnt_nam");
                    temp.ssm_status = r.GetValue<string>("ssm_status");
                    temp.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                    temp.mod_dttm = r.GetValue<string>("mod_dttm");
                    string hrsd_temp = r.GetValue<string>("hrd_rfrsh_schdld");
                    string ersd_temp = r.GetValue<string>("emrgncy_rfrsh_crtd");
                    string rsd_temp = r.GetValue<string>("rfrsh_schdld");
                    if (hrsd_temp == null && ersd_temp == null && rsd_temp == null)
                    {
                        temp.refresh_type = "4";
                    }
                    else if (hrsd_temp != null)
                    {
                        temp.refresh_type = "1";
                        temp.schedule_date = hrsd_temp;
                    }
                    else if (ersd_temp != null)
                    {
                        temp.refresh_type = "2";
                    }
                    else if (rsd_temp != null)
                    {
                        temp.refresh_type = "3";
                        temp.schedule_date = rsd_temp;
                    }
                    return temp;
                });
                if(temp.Count == 0)
                {
                    output.isPrimaryExist = false;
                    output.editFields = null;
                }
                else
                {
                    output.isPrimaryExist = true;
                    output.editFields = temp;
                }

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<List<SMST010InputFields>> InitLoadDataConfig( SessionInfo sessionInfo, SMST010InputFields input ) {
            var output = new List<SMST010InputFields>();
            try {
                var dbParamters = new DBParameters();
                string query = "select DISTINCT grp.pos_grp_id,grp.pos_grp_nam from wkg_pos_ssm_config ssm INNER JOIN wkg_pos_grp_mast grp ON grp.pos_grp_id=ssm.pos_grp_id WHERE ssm_status=1 AND grp.act_inact_ind=1";
                output = await this.DBUtils(true).GetEntityDataListAsync<SMST010InputFields>(query, dbParamters, r => {
                    return new SMST010InputFields {
                        pos_grp_id = r.GetValue<short>("pos_grp_id"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                    };
                });

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> SaveConfigDataAsync( SessionInfo sessionInfo, SMST010InputFields input ) {
            var output = new OperationStatus();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@refresh_type", input.refresh_type);
                dbParamters.Add("@schedule_date", input.schedule_date);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.refresh_type == "1") {
                    query = $"UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = null,hrd_rfrsh_schdld=null,emrgncy_rfrsh_crtd=null,rfrsh_crtd=null,rfrsh_schdld=null where pos_grp_id=@pos_grp_id;UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = getdate(),hrd_rfrsh_schdld = FORMAT(CONVERT(datetime, @schedule_date, 127), 'yyyy-MM-dd HH:mm:ss'),mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where pos_grp_id=@pos_grp_id;";
                } else if (input.refresh_type == "2") {
                    query = $"UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = null,hrd_rfrsh_schdld=null,emrgncy_rfrsh_crtd=null,rfrsh_crtd=null,rfrsh_schdld=null where pos_grp_id=@pos_grp_id;UPDATE wkg_pos_ssm_config SET emrgncy_rfrsh_crtd = getdate(),mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where pos_grp_id=@pos_grp_id;";
                } else if (input.refresh_type == "3") {
                    query = $"UPDATE wkg_pos_ssm_config SET hrd_rfrsh_crtd = null,hrd_rfrsh_schdld=null,emrgncy_rfrsh_crtd=null,rfrsh_crtd=null,rfrsh_schdld=null where pos_grp_id=@pos_grp_id;UPDATE wkg_pos_ssm_config SET rfrsh_crtd = getdate(),rfrsh_schdld = FORMAT(CONVERT(datetime, @schedule_date, 127), 'yyyy-MM-dd HH:mm:ss'),mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where pos_grp_id=@pos_grp_id;";
                }
                using (var dbService = this.GetDBService()) {
                    using (var dbTran = dbService.BeginTransaction()) {
                        try {
                            await dbService.ExecuteSqlCommandAsync(query, dbParamters);

                            dbTran.Commit();
                            output.IsSuccess = true;
                        } catch (Exception ex) {
                            try {
                                dbTran.Rollback();
                            } catch (Exception ex1) { }
                        }
                    }
                }

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        #endregion
    }
}

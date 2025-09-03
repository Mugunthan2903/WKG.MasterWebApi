using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;

namespace WKG.Masters.Services
{
    internal class SMST004Service : WKLServiceManger, ISMST004Service
    {
        #region Constructor

        public SMST004Service(IServiceProvider serviceProvider, ILogger<SMST004Service> logger)
            : base(serviceProvider, logger)
        {
        }
        public async Task<SMST004Obj> Getsuppliercombo(SessionInfo sessionInfo, SMST004Obj input)
        {
            var output = new SMST004Obj();
            try
            {
                List<string> tbl1 = null;
                List<string> tbl2 = null;
                List<SMST004SrchRsltColl> tbl3 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = $"SELECT DISTINCT supp_map_id FROM wkg_supp_config; SELECT end_pnt_nam FROM wkg_supp_end_pnts; SELECT * FROM (SELECT supp_map_id,lst_pull_dt,act_inact_ind,ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY supp_map_id" : "ORDER BY supp_map_id DESC")}) AS cnt,COUNT(*) OVER() AS total_count FROM wkg_supp_config WHERE act_inact_ind = " + input.Status + ") AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<string>();
                    foreach (DataRow DR in DS.Tables[0].Rows)
                    {
                        tbl1.Add(DR.GetValue<string>("supp_map_id"));
                    }
                    tbl2 = new List<string>();
                    foreach (DataRow DR1 in DS.Tables[1].Rows)
                    {
                        tbl2.Add(DR1.GetValue<string>("end_pnt_nam"));
                    }
                    tbl3 = new List<SMST004SrchRsltColl>();

                    foreach (DataRow DR2 in DS.Tables[2].Rows)
                    {
                        SMST004SrchRsltColl obj1 = new SMST004SrchRsltColl();
                        totalrecords = DR2.GetValue<int>("total_count");
                        obj1.act_inact_ind = DR2.GetValue<string>("act_inact_ind");
                        obj1.supp_map_id = DR2.GetValue<string>("supp_map_id");
                        obj1.lst_pull_dt = DR2.GetValue<string>("lst_pull_dt");
                        tbl3.Add(obj1);
                    }
                }
                

                SMST004Obj obj = new SMST004Obj();
                obj.supp_map_id_col = tbl1;
                obj.end_pnt_nam_col = tbl2;
                obj.srch_rslt_col = tbl3;

                output = obj;
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
                

            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<List<SMST004Obj>> EdittabledataAsync(SessionInfo sessionInfo, SMST004Obj input)
        {
            var output = new List<SMST004Obj>();
            try
            {
                var dbParamters = new DBParameters();
                if (input.Status == "E")
                {
                    string query = $"SELECT wpc.supp_map_id,wpc.pos_cd,wpc.pos_actv_end_pnt,wpm.pos_nam,wsc.mod_by_usr_cd,wsc.mod_dttm FROM wkg_supp_pos_config wpc INNER JOIN wkg_pos_mast wpm ON wpc.pos_cd = wpm.pos_cd INNER JOIN wkg_supp_config wsc ON wpc.supp_map_id = wsc.supp_map_id WHERE wpc.supp_map_id ='" + input.supp_map_id + "' AND wpc.pos_cd ='" + input.pos_cd + "';";
                    output = await this.DBUtils(true).GetEntityDataListAsync<SMST004Obj>(query, dbParamters, r =>
                    {
                        return new SMST004Obj
                        {
                            supp_map_id = r.GetValue<string>("supp_map_id"),
                            pos_cd = r.GetValue<string>("pos_cd"),
                            pos_nam = r.GetValue<string>("pos_nam"),
                            pos_actv_end_pnt = r.GetValue<string>("pos_actv_end_pnt"),
                            mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                            mod_dttm = r.GetValue<string>("mod_dttm"),
                        };
                    });
                }
                else
                {
                    string query = $"SELECT grp.supp_map_id,grp.prod_end_pnt_nam,grp.sndbx_end_pnt_nam,grp.lst_pull_dt,grp.act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd, REPLACE(CONVERT(VARCHAR, grp.mod_dttm, 106), ' ', '-') +' ' + CONVERT(VARCHAR(5), grp.mod_dttm, 108) AS mod_dttm FROM wkg_supp_config grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE grp.supp_map_id = '" + input.supp_map_id + "'";
                    output = await this.DBUtils(true).GetEntityDataListAsync<SMST004Obj>(query, dbParamters, r =>
                    {
                        return new SMST004Obj
                        {
                            supp_map_id = r.GetValue<string>("supp_map_id"),
                            lst_pull_dt = r.GetValue<string>("lst_pull_dt"),
                            act_inact_ind = r.GetValue<string>("act_inact_ind"),
                            prod_end_pnt_nam = r.GetValue<string>("prod_end_pnt_nam"),
                            sndbx_end_pnt_nam = r.GetValue<string>("sndbx_end_pnt_nam"),
                            mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                            mod_dttm = r.GetValue<string>("mod_dttm"),
                        };
                    });
                }

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> PosSaveAsync(SessionInfo sessionInfo, SMST004Obj input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_end_pnt_nam", input.prod_end_pnt_nam);
                dbParamters.Add("@sndbx_end_pnt_nam", input.sndbx_end_pnt_nam);
                //dbParamters.Add("@lst_pull_dt", input.lst_pull_dt);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind.ToUpper() == "TRUE" ? 1 : 0);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                if (input.Mode == "UPDATE")
                {
                    query = $"UPDATE wkg_supp_config SET prod_end_pnt_nam = @prod_end_pnt_nam,sndbx_end_pnt_nam = @sndbx_end_pnt_nam,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = getdate() WHERE supp_map_id = @supp_map_id;";
                }
                else
                {
                    query = $"INSERT INTO wkg_supp_config (supp_map_id,prod_end_pnt_nam,sndbx_end_pnt_nam,act_inact_ind,mod_by_usr_cd,mod_dttm)VALUES (@supp_map_id,@prod_end_pnt_nam,@sndbx_end_pnt_nam,@act_inact_ind,@mod_by_usr_cd,getdate());";
                }

                using (var dbService = this.GetDBService())
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(query, dbParamters);
                            dbTran.Commit();
                            output.IsSuccess = true;
                        }
                        catch (Exception ex)
                        {
                            try
                            {
                                dbTran.Rollback();
                            }
                            catch (Exception ex1)
                            {
                                this.Logger.LogError(ex1, $"Method: {nameof(this.PosSaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.PosSaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            output.Message = "Something went wrong";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SMST004Obj> Getsupposconfigdata(SessionInfo sessionInfo, SMST004Obj input)
        {
            var output = new SMST004Obj();
            try
            {
                List<SMST004CmbRsltColl> tbl1 = null;
                List<SMST004SrchRsltColl> tbl2 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = "";
                if (input.pos_cd == "" || input.pos_cd == null)
                {
                    query = $"SELECT pos_cd,pos_nam FROM wkg_pos_mast WHERE act_inact_ind =" + 1 + $";SELECT * FROM (SELECT wpc.supp_map_id,wpc.pos_cd,wpc.pos_actv_end_pnt,wpm.pos_nam,ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY pos_nam" : "ORDER BY pos_nam DESC")}) AS cnt,COUNT(*) OVER() AS total_count FROM wkg_supp_pos_config wpc INNER JOIN wkg_pos_mast wpm ON wpc.pos_cd = wpm.pos_cd WHERE wpc.supp_map_id = '" + input.supp_map_id + "') AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }
                else
                {
                    query = $"SELECT pos_cd,pos_nam FROM wkg_pos_mast WHERE act_inact_ind =" + 1 + $";SELECT * FROM (SELECT wpc.supp_map_id,wpc.pos_cd,wpc.pos_actv_end_pnt,wpm.pos_nam,ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY pos_nam" : "ORDER BY pos_nam DESC")}) AS cnt,COUNT(*) OVER() AS total_count FROM wkg_supp_pos_config wpc INNER JOIN wkg_pos_mast wpm ON wpc.pos_cd = wpm.pos_cd WHERE wpc.pos_cd = '" + input.pos_cd + "') AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SMST004CmbRsltColl>();
                    foreach (DataRow DR in DS.Tables[0].Rows)
                    {
                        SMST004CmbRsltColl Tobj = new SMST004CmbRsltColl();
                        Tobj.pos_cd = DR.GetValue<string>("pos_cd");
                        Tobj.pos_nam = DR.GetValue<string>("pos_nam");
                        tbl1.Add(Tobj);
                    }
                    tbl2 = new List<SMST004SrchRsltColl>();
                    foreach (DataRow DR1 in DS.Tables[1].Rows)
                    {
                        SMST004SrchRsltColl obj1 = new SMST004SrchRsltColl();
                        totalrecords = DR1.GetValue<int>("total_count");
                        obj1.supp_map_id = DR1.GetValue<string>("supp_map_id");
                        obj1.pos_cd = DR1.GetValue<string>("pos_cd");
                        obj1.pos_actv_end_pnt = DR1.GetValue<string>("pos_actv_end_pnt");
                        obj1.pos_nam = DR1.GetValue<string>("pos_nam");
                        tbl2.Add(obj1);
                    }
                }

                SMST004Obj Pobj = new SMST004Obj();
             
                Pobj.srch_cmb_col = tbl1;
                Pobj.srch_rslt_col = tbl2;
                output = Pobj;
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> PosconfigSaveAsync(SessionInfo sessionInfo, SMST004Obj input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                string query = "";
                if (input.Mode == "UPDATE")
                {
                    query = $"UPDATE wkg_supp_pos_config SET pos_actv_end_pnt = '" + input.pos_actv_end_pnt + "' WHERE supp_map_id = '" + input.supp_map_id + "' AND pos_cd='" + input.pos_cd + "';";
                }
                else if (input.Mode == "INSERT")
                {
                    query = $"INSERT INTO wkg_supp_pos_config (supp_map_id,pos_cd, pos_actv_end_pnt) VALUES ('" + input.supp_map_id + "','" + input.pos_cd + "','" + input.pos_actv_end_pnt + "');";
                }
                else
                {
                    query = $"DELETE FROM wkg_supp_pos_config WHERE supp_map_id = '" + input.supp_map_id + "' AND pos_cd = '" + input.pos_cd + "';";
                }
                using (var dbService = this.GetDBService())
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(query, dbParamters);
                            dbTran.Commit();
                            output.IsSuccess = true;
                        }
                        catch (Exception ex)
                        {
                            try
                            {
                                dbTran.Rollback();
                            }
                            catch (Exception ex1)
                            {
                                this.Logger.LogError(ex1, $"Method: {nameof(this.PosSaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.PosSaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            output.Message = "Something went wrong";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        #endregion
    }

}
 
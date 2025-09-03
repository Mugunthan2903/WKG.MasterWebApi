using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using WKL.Service.Domain;

namespace WKG.Masters.Services
{
    public class SSM070Service : WKLServiceManger, ISSM070Service
    {
        #region Constructor
        public SSM070Service(IServiceProvider serviceProvider, ILogger<SSM030Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Private Methods
        #endregion

        #region Public Methods SSM070
        public async Task<SSM070loadObject> SSM070GetOnloadAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new SSM070loadObject();
            try
            {
                List<SSM070Object> tbl1 = null;
                List<string> tbl2 = null;
                List<SSM070Object> tbl3 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@act_inact_ind", 1);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                // SSM070 onload table populate, select box for end_pnt_nam and supp_nam
                string query = @"SELECT * FROM (SELECT supp_map_id,supp_nam,lst_pull_dt,mobile_req,email_req,act_inact_ind,COUNT(*) OVER() AS total_count,
                                  ROW_NUMBER() OVER (ORDER BY supp_nam) AS cnt FROM (SELECT 'FLT' AS supp_map_id,'Flight Api' AS supp_nam,lst_pull_dt,mobile_req,
                                  email_req,act_inact_ind FROM wkg_supp_config WHERE act_inact_ind = 1 AND supp_map_id = 'FLT'UNION
                                  SELECT supp.supp_map_id,supp.supp_nam,cng.lst_pull_dt,cng.mobile_req,cng.email_req,cng.act_inact_ind FROM wkg_supp_config cng
                                  INNER JOIN rps_supp_mast supp ON supp.supp_map_id = cng.supp_map_id WHERE supp.Act_Inact_Ind = 'A' ) AS combined ) AS temp
                                  WHERE temp.act_inact_ind = @act_inact_ind AND temp.cnt BETWEEN @startrow AND @endrow;
                                  SELECT end_pnt_nam FROM wkg_supp_end_pnts;
                                  SELECT 'FLT' AS supp_map_id,'Flight Api' AS supp_nam FROM wkg_supp_config WHERE 
                                  act_inact_ind = 1 AND supp_map_id = 'FLT'UNION
                                  select cng.supp_map_id,supp.supp_nam from wkg_supp_config cng INNER join rps_supp_mast supp ON 
                                  supp.supp_map_id=cng.supp_map_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM070Object>();
                    foreach (DataRow DR in DS.Tables[0].Rows)
                    {
                        SSM070Object obj1 = new SSM070Object();
                        totalrecords = DR.GetValue<int>("total_count");
                        obj1.act_inact_ind = DR.GetValue<bool>("act_inact_ind");
                        obj1.supp_map_id = DR.GetValue<string>("supp_map_id");
                        obj1.mobile_req = DR.GetValue<bool>("mobile_req");
                        obj1.email_req = DR.GetValue<bool>("email_req");
                        obj1.supp_nam = DR.GetValue<string>("supp_nam");
                        obj1.lst_pull_dt = DR.GetValue<string>("lst_pull_dt");
                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<string>();
                    foreach (DataRow DR1 in DS.Tables[1].Rows)
                    {
                        tbl2.Add(DR1.GetValue<string>("end_pnt_nam"));
                    }
                    tbl3 = new List<SSM070Object>();

                    foreach (DataRow DR3 in DS.Tables[2].Rows)
                    {
                        SSM070Object obj3 = new SSM070Object();
                        obj3.supp_map_id = DR3.GetValue<string>("supp_map_id");
                        obj3.supp_nam = DR3.GetValue<string>("supp_nam");
                        tbl3.Add(obj3);
                    }
                }

                output.Items = tbl1;
                output.EndPointList = tbl2;
                output.SuppConfigList = tbl3;

                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
                output.radios = StaticData.Common.BookingFeeType;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<SSM070loadObject> SSM070GetSearchAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new SSM070loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                // SSM070 search
                string query = @$"SELECT * FROM (SELECT supp_map_id,supp_nam,lst_pull_dt,mobile_req,email_req,act_inact_ind,COUNT(*) OVER() AS total_count,
                                  ROW_NUMBER() OVER (ORDER BY supp_nam) AS cnt FROM (SELECT 'FLT' AS supp_map_id,'Flight Api' AS supp_nam,lst_pull_dt,mobile_req,
                                  email_req,act_inact_ind FROM wkg_supp_config WHERE act_inact_ind = 1 AND supp_map_id = 'FLT'UNION
                                  SELECT supp.supp_map_id,supp.supp_nam,cng.lst_pull_dt,cng.mobile_req,cng.email_req,cng.act_inact_ind FROM wkg_supp_config cng
                                  INNER JOIN rps_supp_mast supp ON supp.supp_map_id = cng.supp_map_id WHERE supp.Act_Inact_Ind = 'A') AS combined ) AS temp
                                  WHERE {(input.supp_map_id != null ? "temp.supp_map_id = @supp_map_id AND" : "")} 
                                  temp.act_inact_ind = @act_inact_ind AND temp.cnt BETWEEN @startrow AND @endrow;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM070Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM070Object
                    {
                        supp_map_id = r.GetValue<string>("supp_map_id"),
                        supp_nam = r.GetValue<string>("supp_nam"),
                        mobile_req = r.GetValue<bool>("mobile_req"),
                        email_req = r.GetValue<bool>("email_req"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        lst_pull_dt = r.GetValue<string>("lst_pull_dt"),

                    };
                });

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
        public async Task<SSM070loadObject> SSM070GetSelectAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new SSM070loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                string query = "";

                // SSM070 retrieves data from wkg_supp_config for the specified supp_map_id
                query = @"SELECT cng.supp_map_id,cng.lst_pull_dt,cng.act_inact_ind,cng.bkng_fee,cng.bkng_fee_typ,
                           cng.prod_end_pnt_nam,cng.sndbx_end_pnt_nam,email_req,mobile_req,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                           REPLACE(CONVERT(VARCHAR,cng.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),cng.mod_dttm,108) AS mod_dttm 
                           FROM wkg_supp_config cng INNER JOIN rps_usr_mast usr ON usr.Usr_id = cng.mod_by_usr_cd 
                           INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where cng.supp_map_id = @supp_map_id;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM070Object>(query, dbParamters, r =>
                {
                    return new SSM070Object
                    {
                        supp_map_id = r.GetValue<string>("supp_map_id"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        lst_pull_dt = r.GetValue<string>("lst_pull_dt"),
                        prod_end_pnt_nam = r.GetValue<string>("prod_end_pnt_nam"),
                        sndbx_end_pnt_nam = r.GetValue<string>("sndbx_end_pnt_nam"),
                        email_req = r.GetValue<bool>("email_req"),
                        mobile_req = r.GetValue<bool>("mobile_req"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                        bkng_fee = r.GetValue<string>("bkng_fee"),
                        bkng_fee_typ = r.GetValue<string>("bkng_fee_typ"),

                    };
                });

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> SSM070SaveAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@prod_end_pnt_nam", input.prod_end_pnt_nam);
                dbParamters.Add("@sndbx_end_pnt_nam", input.sndbx_end_pnt_nam);
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@email_req", $"{input.email_req}");
                dbParamters.Add("@mobile_req", $"{input.mobile_req}");
                dbParamters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                dbParamters.Add("@bkng_fee", $"{input.bkng_fee}");
                dbParamters.Add("@bkng_fee_typ", $"{input.bkng_fee_typ}");
                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {
                    // SSM070 update query
                    query = @"UPDATE wkg_supp_config SET prod_end_pnt_nam=@prod_end_pnt_nam,sndbx_end_pnt_nam=@sndbx_end_pnt_nam,
                               email_req=@email_req,mobile_req=@mobile_req,act_inact_ind=@act_inact_ind,mod_by_usr_cd=@mod_by_usr_cd,
                               mod_dttm = getdate(),bkng_fee = @bkng_fee, bkng_fee_typ = @bkng_fee_typ WHERE 
                               supp_map_id = @supp_map_id;";
                }
                using (var dbService = this.GetDBService(true))
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM070SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM070SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM071
        public async Task<SSM070loadObject> SSM071GetOnloadAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new SSM070loadObject();
            try
            {
                List<SSM070Object> tbl1 = null;
                List<SSM070Object> tbl2 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;

                // SSM071 onload for table populate and pos_nam select box
                string query = @$"SELECT * FROM (SELECT supp.supp_nam,wpm.pos_nam,poscng.supp_map_id,poscng.pos_cd,poscng.pos_actv_end_pnt,
                                  ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY supp.supp_nam" : "ORDER BY supp.supp_nam DESC")}) AS cnt,
                                  COUNT(*) OVER() AS total_count FROM wkg_supp_pos_config poscng INNER join rps_supp_mast supp 
                                  ON supp.supp_map_id=poscng.supp_map_id INNER JOIN wkg_pos_mast wpm ON 
                                  poscng.pos_cd = wpm.pos_cd WHERE poscng.supp_map_id = @supp_map_id ) AS temp WHERE 
                                  temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT pos_cd,pos_nam FROM wkg_pos_mast WHERE act_inact_ind = 1;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM070Object>();
                    foreach (DataRow DR in DS.Tables[0].Rows)
                    {
                        SSM070Object obj1 = new SSM070Object();
                        totalrecords = DR.GetValue<int>("total_count");
                        obj1.supp_nam = DR.GetValue<string>("supp_nam");
                        obj1.supp_map_id = DR.GetValue<string>("supp_map_id");
                        obj1.pos_cd = DR.GetValue<string>("pos_cd");
                        obj1.pos_nam = DR.GetValue<string>("pos_nam");
                        obj1.pos_actv_end_pnt = DR.GetValue<string>("pos_actv_end_pnt");
                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM070Object>();
                    foreach (DataRow DR1 in DS.Tables[1].Rows)
                    {
                        SSM070Object obj2 = new SSM070Object();
                        obj2.pos_cd = DR1.GetValue<string>("pos_cd");
                        obj2.pos_nam = DR1.GetValue<string>("pos_nam");
                        tbl2.Add(obj2);
                    }

                }
                output.Items = tbl1;
                output.PosmastList = tbl2;

                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
                output.radios = StaticData.SSM070Sc.EndPointType;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<SSM070loadObject> SSM071GetSearchAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new SSM070loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_cd", $"{input.pos_cd}");
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;

                // SSM071 search
                string query = @$"SELECT * FROM (SELECT supp.supp_nam,wpm.pos_nam,poscng.supp_map_id,poscng.pos_cd,poscng.pos_actv_end_pnt,
                                  ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY supp.supp_nam" : "ORDER BY supp.supp_nam DESC")}) AS cnt,
                                  COUNT(*) OVER() AS total_count FROM wkg_supp_pos_config poscng INNER join rps_supp_mast supp 
                                  ON supp.supp_map_id=poscng.supp_map_id INNER JOIN wkg_pos_mast wpm ON 
                                  poscng.pos_cd = wpm.pos_cd WHERE poscng.supp_map_id = @supp_map_id {(input.pos_cd != null?"AND poscng.pos_cd = @pos_cd":"")}) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM070Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM070Object
                    {
                        supp_map_id = r.GetValue<string>("supp_map_id"),
                        supp_nam = r.GetValue<string>("supp_nam"),
                        pos_cd = r.GetValue<string>("pos_cd"),
                        pos_nam = r.GetValue<string>("pos_nam"),
                        pos_actv_end_pnt = r.GetValue<string>("pos_actv_end_pnt"),

                    };
                });

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
        public async Task<SSM070loadObject> SSM071GetSelectAsync(SessionInfo sessionInfo, SSM070Object input)
        {
            var output = new SSM070loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@pos_cd", $"{input.pos_cd}");
                string query = "";

                // SSM071 retrieve record from wkg_supp_pos_config for specified supp_map_id and pos_cd
                query = @"SELECT wpc.supp_map_id,wpc.pos_cd,wpc.pos_actv_end_pnt,wpm.pos_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                           REPLACE(CONVERT(VARCHAR,wpm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),wpm.mod_dttm,108) AS mod_dttm 
                           FROM wkg_supp_pos_config wpc INNER JOIN wkg_pos_mast wpm ON wpc.pos_cd = wpm.pos_cd INNER JOIN wkg_supp_config wsc 
                           ON wpc.supp_map_id = wsc.supp_map_id INNER JOIN rps_usr_mast usr ON usr.Usr_id = wpm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                           emp.emp_cd = usr.emp_cd WHERE wpc.supp_map_id =@supp_map_id AND wpc.pos_cd =@pos_cd;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM070Object>(query, dbParamters, r =>
                {
                    return new SSM070Object
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
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> SSM071SaveAsync( SessionInfo sessionInfo, SSM070Object input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@pos_cd", input.pos_cd);
                dbParamters.Add("@pos_actv_end_pnt", input.pos_actv_end_pnt);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {
                    // SSM071 update
                    query = "UPDATE wkg_supp_pos_config SET pos_actv_end_pnt = @pos_actv_end_pnt WHERE pos_cd = @pos_cd AND supp_map_id = @supp_map_id;";
                }
                else if (input.Mode == "INSERT")
                {
                    // SSM071 insert
                    query = "INSERT INTO wkg_supp_pos_config (supp_map_id,pos_cd, pos_actv_end_pnt) VALUES (@supp_map_id,@pos_cd,@pos_actv_end_pnt);";
                }
                else
                {
                    // SSM071 delete
                    query = "DELETE FROM wkg_supp_pos_config WHERE supp_map_id = @supp_map_id AND pos_cd = @pos_cd;";
                }
                using (var dbService = this.GetDBService(true))
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM071SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM071SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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
        public async Task<SSM070loadObject> SSM071CheckPosExistAsync( SessionInfo sessionInfo, SSM070Object input )
        {
            var output = new SSM070loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@pos_cd", $"{input.pos_cd}");

                // SSM071 checks if the pos_cd for particular supp_map_id already exist
                string query = "select pos_cd from wkg_supp_pos_config where supp_map_id = @supp_map_id AND pos_cd = @pos_cd;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM070Object>(query, dbParamters, r =>
                {
                    return new SSM070Object
                    {
                        pos_cd = r.GetValue<string>("pos_cd"),
                    };
                });
                if(output.Items != null && output.Items.Count>0)
                {
                    output.pos_avail = true;
                }
                else
                {
                    output.pos_avail = false;
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

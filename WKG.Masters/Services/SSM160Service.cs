using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;

namespace WKG.Masters.Services
{
    internal class SSM160Service : WKLServiceManger, ISSM160Service
    {
        #region Constructor
        public SSM160Service(IServiceProvider serviceProvider, ILogger<SSM160Service> logger)
        : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM160
        public async Task<SSM160OnloadObject> SSM160OnloadAsync(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new SSM160OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@trm_nam", $"%{input.trm_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                List<SSM160Object> tbl1 = null;
                List<SSM160ApiEnableObject> tbl2 = null;
                int totalrecords = 0;
                string query = "";

                //SSM160 onload retrives records for grid
                query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY trms.trm_nam  ) AS cnt ,trm_nam,
                           trm_srl,trm_dflt,act_inact_ind, appl_supp_cds , COUNT(*) OVER () AS total_count FROM wkg_supp_terms_mast trms 
                           where trms.act_inact_ind=@act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                         SELECT 'FLT' supp_map_id,'Flight Api' supp_nam,act_inact_ind from wkg_supp_config 
                         WHERE supp_map_id='FLT' UNION SELECT cng.supp_map_id,supp.supp_nam,cng.act_inact_ind 
                         from wkg_supp_config cng INNER join rps_supp_mast supp ON supp.supp_map_id=cng.supp_map_id;";


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM160Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {

                        totalrecords = r.GetValue<int>("total_count");
                        SSM160Object obj1 = new SSM160Object();

                        obj1.trm_srl = r.GetValue<string>("trm_srl");
                        obj1.trm_nam = r.GetValue<string>("trm_nam");
                        obj1.trm_dflt = r.GetValue<bool>("trm_dflt");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.appl_supp_cds = r.GetValue<string>("appl_supp_cds");

                        tbl1.Add(obj1);
                    }

                    tbl2 = new List<SSM160ApiEnableObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM160ApiEnableObject obj2 = new SSM160ApiEnableObject();
                        obj2.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj2.supp_nam = r.GetValue<string>("supp_nam");
                        obj2.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        tbl2.Add(obj2);
                    }
                }
                output.Items = tbl1;
                output.ApiEnableItem = tbl2;
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

        public async Task<SSM160OnloadObject> SSM160GetSearchAsync(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new SSM160OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@trm_nam", $"%{input.trm_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                List<SSM160Object> tbl1 = null;
                int totalrecords = 0;
                string query = "";
                //SSM160 onload retrives records for grid
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"trms.trm_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }

                query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring}  ) AS cnt ,trm_nam,
                           trm_srl,trm_dflt,act_inact_ind, appl_supp_cds , COUNT(*) OVER () AS total_count FROM wkg_supp_terms_mast trms 
                           where trms.trm_nam LIKE @trm_nam AND trms.act_inact_ind=@act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM160Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {

                        totalrecords = r.GetValue<int>("total_count");
                        SSM160Object obj1 = new SSM160Object();

                        obj1.trm_srl = r.GetValue<string>("trm_srl");
                        obj1.trm_nam = r.GetValue<string>("trm_nam");
                        obj1.trm_dflt = r.GetValue<bool>("trm_dflt");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.appl_supp_cds = r.GetValue<string>("appl_supp_cds");

                        tbl1.Add(obj1);
                    }

                }
                output.Items = tbl1;
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

        public async Task<SSM160OnloadObject> SSM160GetSelectAsync(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new SSM160OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@trm_srl", $"{input.trm_srl}");
                List<SSM160Object> tbl1 = null;
                string query = "";
                //SSM160 get details for selected data to edit

                query = @"SELECT trms.trm_srl, trms.trm_nam, trms.act_inact_ind, trms.trm_dflt, trms.appl_supp_cds, 
                          emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                          REPLACE(CONVERT(VARCHAR,trms.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),trms.mod_dttm,108) AS mod_dttm 
                          FROM wkg_supp_terms_mast trms 
                          INNER JOIN rps_usr_mast usr ON usr.Usr_id = trms.mod_by_usr_cd 
                          INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                          WHERE trms.trm_srl = @trm_srl;
                        
                          SELECT STUFF(( SELECT ',' + lang_cd   FROM wkg_supp_terms_dtls WHERE 
                          trm_srl = @trm_srl AND trm_desc IS NOT NULL ORDER BY 
                          CASE WHEN lang_cd = 'en-GB' THEN 0 ELSE 1 END,
		                  CASE WHEN lang_cd = 'de-DE' THEN 0 ELSE 1 END,
		                  CASE WHEN lang_cd = 'fr-FR' THEN 0 ELSE 1 END,
		                  CASE WHEN lang_cd = 'it-IT' THEN 0 ELSE 1 END,
		                  CASE WHEN lang_cd = 'es-ES' THEN 0 ELSE 1 END,lang_cd FOR XML PATH('')), 1, 1, '') AS lang_cd; ";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM160Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM160Object obj1 = new SSM160Object();

                        obj1.trm_srl = r.GetValue<string>("trm_srl");
                        obj1.trm_nam = r.GetValue<string>("trm_nam");
                        obj1.trm_dflt = r.GetValue<bool>("trm_dflt");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.appl_supp_cds = r.GetValue<string>("appl_supp_cds");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");

                        tbl1.Add(obj1);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.Lang_Cd = r.GetValue<string>("lang_cd");
                    }
                }
                output.Items = tbl1;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SSM160OnloadObject> SSM160GetSelectDefaultcheck(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new SSM160OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                List<SSM160Object> tbl1 = new List<SSM160Object>();
                string query = "";
                dbParamters.Add("@appl_supp_cds", $"{input.appl_supp_cds}");
                //SSM160 Select Default check for selected data to edit

                query = @"SELECT trm_srl, appl_supp_cds 
                            FROM wkg_supp_terms_mast 
                            WHERE trm_dflt = 1 AND EXISTS(
                            SELECT split_cd.custpricetype 
                            FROM dbo.rms_fn_commasplit(ISNULL(@appl_supp_cds, ''), ',') AS split_cd
                            WHERE split_cd.custpricetype IN (SELECT custpricetype 
                            FROM dbo.rms_fn_commasplit(ISNULL(appl_supp_cds, ''), ',')));";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        //output.Lang_Cd = r.GetValue<string>("appl_supp_cds");
                        tbl1.Add(new SSM160Object
                        {
                            trm_srl = r.GetValue<string>("trm_srl"),
                            appl_supp_cds = r.GetValue<string>("appl_supp_cds"),
                        });
                    }
                }
                output.Items = tbl1;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<OperationStatus> SSM160SaveDataAsync(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@trm_srl", input.trm_srl.ToString());
                dbParamters.Add("@trm_nam", input.trm_nam.ToString());
                dbParamters.Add("@trm_dflt", input.trm_dflt.ToString());
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@appl_supp_cds", input.appl_supp_cds.ToString());
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd.ToString());

                StringBuilder query = new StringBuilder();

                if (!string.IsNullOrEmpty(input.existSrl))
                {
                    //var existSrlArr = input.existSrl;
                    //var existSrlArr = input.existSrl.Split(",");
                    var existSrlArr = JsonConvert.DeserializeObject<string[]>(input.existSrl);
                    int i = 0;
                    foreach (var r in existSrlArr)
                    {
                        dbParamters.Add($"@trm_srl{i}", r);
                        //SSM160 Update query for wkg_supp_terms_mast set 0 for exist default group
                        query.Append($@"UPDATE wkg_supp_terms_mast SET trm_dflt=0 WHERE trm_srl=@trm_srl{i};");
                        i++;
                    }
                }

                if (input.Mode == "UPDATE")
                {
                    //SSM160 Update query for wkg_supp_terms_mast terms & conditions
                    query.Append(@"UPDATE wkg_supp_terms_mast SET 
                             trm_nam=@trm_nam, trm_dflt=@trm_dflt,
                             act_inact_ind=@act_inact_ind, appl_supp_cds=@appl_supp_cds,
                             mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=getdate() WHERE trm_srl=@trm_srl;");
                }
                else if (input.Mode == "INSERT")
                {
                    //SSM160 Build insert query for wkg_supp_terms_mast terms & conditions

                    query.Append(@"INSERT INTO wkg_supp_terms_mast(trm_nam,trm_dflt,appl_supp_cds,act_inact_ind,mod_dttm,mod_by_usr_cd)
                                  VALUES(@trm_nam,@trm_dflt,@appl_supp_cds,@act_inact_ind,
                                  getdate(),@mod_by_usr_cd);");


                }

                using (var dbService = this.GetDBService(true))
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(query.ToString(), dbParamters);
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM160SaveDataAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM160SaveDataAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        public async Task<SSM160OnloadObject> SSM161SearchrecordAsync(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new SSM160OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@trm_srl", $"{input.trm_srl}");
                List<SSM161Object> tbl1 = null;
                string query = "";

                //SSM161 get details for selected data to edit

                query = @"SELECT trms.trm_srl, trms.lang_cd, trms.trm_desc, 
                          emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                          REPLACE(CONVERT(VARCHAR,trms.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),trms.mod_dttm,108) AS mod_dttm 
                          FROM wkg_supp_terms_dtls trms 
                          INNER JOIN rps_usr_mast usr ON usr.Usr_id = trms.mod_by_usr_cd 
                          INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                          WHERE trms.trm_srl = @trm_srl;
                          
                         SELECT STUFF((SELECT ',' + lang_cd FROM wkg_pos_accptd_lang WHERE act_inact_ind = 1 ORDER BY
                         CASE WHEN lang_cd = 'en-GB' THEN 0 ELSE 1 END,
		                 CASE WHEN lang_cd = 'de-DE' THEN 0 ELSE 1 END,
		                 CASE WHEN lang_cd = 'fr-FR' THEN 0 ELSE 1 END,
		                 CASE WHEN lang_cd = 'it-IT' THEN 0 ELSE 1 END,
		                 CASE WHEN lang_cd = 'es-ES' THEN 0 ELSE 1 END,lang_cd FOR XML PATH('')), 1, 1, '') AS lang_cd;";


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM161Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM161Object obj1 = new SSM161Object();

                        obj1.trm_srl = r.GetValue<string>("trm_srl");
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.trm_desc = r.GetValue<string>("trm_desc");
                        obj1.recordExists = true;
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");

                        tbl1.Add(obj1);
                    }

                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.Lang_Cd = r.GetValue<string>("lang_cd");
                    }

                }
                output.LangItems = tbl1;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<OperationStatus> SSM161SaveDataAsync(SessionInfo sessionInfo, SSM160Object input)
        {
            var output = new OperationStatus();
            var dbParamters = new DBParameters();
            StringBuilder queryBuilder = new StringBuilder();
            try
            {
                dbParamters.Add($"@mod_by_usr_cd", input.mod_by_usr_cd.ToString());
                int i = 0;
                foreach (var item in input.DynamicValues)
                {
                    bool isExist = Convert.ToBoolean(item?.recordExists);
                    dbParamters.Add($"@trm_srl{i}", item?.trm_srl.ToString());
                    dbParamters.Add($"@trm_desc{i}", item?.trm_desc.ToString());
                    dbParamters.Add($"@lang_cd{i}", item?.lang_cd.ToString());
                    if (isExist)
                    {
                        queryBuilder.Append(@$"UPDATE wkg_supp_terms_dtls SET trm_desc=@trm_desc{i},
                                            mod_dttm = GETDATE(),mod_by_usr_cd=@mod_by_usr_cd WHERE lang_cd=@lang_cd{i} AND trm_srl=@trm_srl{i};");
                    }
                    else
                    {
                        queryBuilder.Append(@$"INSERT INTO wkg_supp_terms_dtls(trm_srl,lang_cd,trm_desc,mod_dttm,mod_by_usr_cd)
                                               VALUES(@trm_srl{i},@lang_cd{i},@trm_desc{i},GETDATE(),@mod_by_usr_cd);");
                    }
                    i++;

                }

                using (var dbService = this.GetDBService(true))
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(queryBuilder.ToString(), dbParamters);
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM161SaveDataAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM161SaveDataAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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


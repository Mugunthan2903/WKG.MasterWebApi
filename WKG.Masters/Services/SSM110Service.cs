using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using Newtonsoft.Json;
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
    internal class SSM110Service : WKLServiceManger, ISSM110Service
    {
        #region Constructor
        public SSM110Service(IServiceProvider serviceProvider, ILogger<SSM110Service> logger)
        : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM110
        public async Task<SSM110OnloadObject> SSM110OnloadAsync(SessionInfo sessionInfo, SSM110Object input)
        {
            var output = new SSM110OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@tour_ctgry_nam", $"%{input.tour_ctgry_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);

                List<SSM110Object> tbl1 = null;
                int totalrecords = 0;

                // Combined query with two SELECT statements
                string query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {(input.SortTyp ? "wld.en_GB" : "wld.en_GB DESC")}) AS cnt,
                wld.en_GB as tour_ctgry_nam,wtg.tour_ctgry_id,wtg.lang_data_srl,wtg.sort_ordr,wtg.act_inact_ind,
                wtg.mod_by_usr_cd,wtg.mod_dttm,COUNT(*) OVER () AS total_count FROM wkg_lang_data AS wld INNER JOIN wkg_tour_ctgry AS wtg ON wld.data_srl = wtg.lang_data_srl WHERE wld.data_typ_cd = 'CTGRY' 
                AND wld.en_GB LIKE @tour_ctgry_nam AND wtg.act_inact_ind = @act_inact_ind) AS temp
                WHERE temp.cnt BETWEEN @startrow AND @endrow;SELECT data_srl, en_GB as tour_ctgry_nam FROM wkg_lang_data WHERE data_typ_cd = 'CTGRY'";

               
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);

                if (DS != null && DS.Tables.Count > 0)
                {
                   
                    var tbl1Results = DS.Tables[0];
                    tbl1 = new List<SSM110Object>();
                    foreach (DataRow r in tbl1Results.Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM110Object obj1 = new SSM110Object();
                        obj1.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj1.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        tbl1.Add(obj1);
                    }

                   
                    var tbl2Results = DS.Tables[1];
                    List<SSM110Object> tbl2 = new List<SSM110Object>();
                    foreach (DataRow r in tbl2Results.Rows)
                    {
                        SSM110Object obj2 = new SSM110Object();
                        obj2.data_srl = r.GetValue<string>("data_srl");
                        obj2.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        tbl2.Add(obj2);
                    }

                    output.Combdata = tbl2;
                    output.Items = tbl1;
                }

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


        public async Task<OperationStatus> SaveDataAsync(SessionInfo sessionInfo, SSM110Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters
        {
            { "@lang_data_srl", input.lang_data_srl },
            { "@tour_ctgry_id", input.tour_ctgry_id },
            { "@sort_ordr", input.sort_ordr },
            { "@act_inact_ind", input.act_inact_ind },
            { "@mod_by_usr_cd", input.mod_by_usr_cd }
        };

                string query = string.IsNullOrEmpty(input.tour_ctgry_id)
                    ? "INSERT INTO wkg_tour_ctgry (lang_data_srl, sort_ordr, act_inact_ind, mod_by_usr_cd, mod_dttm) " +
                      "VALUES (@lang_data_srl, @sort_ordr, @act_inact_ind, @mod_by_usr_cd, GETDATE());"
                    : "UPDATE wkg_tour_ctgry " +
                      "SET lang_data_srl = @lang_data_srl, sort_ordr = @sort_ordr, act_inact_ind = @act_inact_ind, " +
                      "mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() " +
                      "WHERE tour_ctgry_id = @tour_ctgry_id;";

                using (var dbService = this.GetDBService(true))
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
                        dbTran.Rollback();
                        this.Logger.LogError(ex, $"Method: {nameof(SaveDataAsync)}. Transaction failed. Session: {sessionInfo?.ToJsonText()}, Input: {input?.ToJsonText()}");
                        output.Message = "Something went wrong during transaction.";
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Method: {nameof(SaveDataAsync)}. General exception. Session Info: {sessionInfo?.ToJsonText()}, Input: {input?.ToJsonText()}");
                output.Message = "An unexpected error occurred.";
            }

            return output;
        }
        public async Task<SSM110OnloadObject> GetSelectAsync(SessionInfo sessionInfo, SSM110Object input)
        {
            var output = new SSM110OnloadObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tour_ctgry_id", $"{input.tour_ctgry_id}");
                List<SSM110Object> tbl1 = null;
                string query = @"SELECT wld.en_GB AS tour_ctgry_nam,wtg.tour_ctgry_id,wtg.lang_data_srl,wtg.sort_ordr,wtg.act_inact_ind,
                                 REPLACE(CONVERT(VARCHAR, wtg.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), wtg.mod_dttm, 108) AS mod_dttm, 
                                 emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_lang_data AS wld 
                                 INNER JOIN wkg_tour_ctgry AS wtg ON wld.data_srl = wtg.lang_data_srl 
                                 INNER JOIN rps_usr_mast usr ON usr.Usr_id = wld.mod_by_usr_cd 
                                 INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                 WHERE wld.data_typ_cd = 'CTGRY' AND wtg.tour_ctgry_id = @tour_ctgry_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM110Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM110Object obj1 = new SSM110Object
                        {
                            tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam"),
                            tour_ctgry_id = r.GetValue<string>("tour_ctgry_id"),
                            lang_data_srl = r.GetValue<string>("lang_data_srl"),
                            sort_ordr = r.GetValue<string>("sort_ordr"),
                            act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                            mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                            mod_dttm = r.GetValue<string>("mod_dttm")
                        };

                        tbl1.Add(obj1);
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

        public async Task<SSM110OnloadObject> BlurAsync(SessionInfo sessionInfo, SSM110Object input)
        {
            var output = new SSM110OnloadObject();
            try
            {
                var dbParameters = new DBParameters();
               
                dbParameters.Add("@lang_data_srl", $"{input.lang_data_srl}");
                string data_srl = null;
                string query = @"
                SELECT wld.en_GB AS tour_ctgry_nam,wtg.tour_ctgry_id,wtg.lang_data_srl,wtg.sort_ordr,wtg.act_inact_ind,wtg.mod_by_usr_cd,
                wtg.mod_dttm FROM wkg_lang_data AS wld INNER JOIN wkg_tour_ctgry AS wtg 
                ON wld.data_srl = wtg.lang_data_srl
                WHERE wld.data_typ_cd = 'CTGRY' AND wtg.lang_data_srl = @lang_data_srl;";
              
                output.Item = await this.DBUtils(true).GetEntityDataAsync<SSM110Object>(query, dbParameters, r =>
                {
                    data_srl = r.GetValue<string>("lang_data_srl"); 
                    return new SSM110Object
                    {
                        lang_data_srl = r.GetValue<string>("lang_data_srl"),
                        tour_ctgry_id = r.GetValue<string>("tour_ctgry_id"),

                    };
                });

                
                if (output.Item != null)
                {
                    if (input.lang_data_srl == data_srl)
                    {
                        output.Isavailable = true;
                    }
                    else
                    {
                        output.ErrorNo = -1; 
                    }
                }
                else
                {
                    output.Isavailable = false; 
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input: {input.ToJsonText()}");
                output.ErrorNo = -2; 
            }

            return output;
        }
        #endregion
    }
}

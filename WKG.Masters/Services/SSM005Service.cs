using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using Newtonsoft.Json.Linq;
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
using WKL.Service.Domain;

namespace WKG.Masters.Services
{
    public class SSM005Service : WKLServiceManger, ISSM005Service
    {

        #region Constructor
        public SSM005Service(IServiceProvider serviceProvider, ILogger<SSM005Service> logger) : base(serviceProvider, logger) { }
        #endregion


        #region Public Methods SSM005

        public async Task<SSM005loadObject> SSM005GetOnloadAsync(SessionInfo sessionInfo, SSM005Object input)
        {
            var output = new SSM005loadObject();
            try
            {
                var dbParamters = new DBParameters();
                //SSM005 onload.retrives records from wkg_pos_ssm_config and values for combo box from wkg_pos_ssm_config and wkg_pos_grp_mast
                string query = @"SELECT ssm.ssm_id,ssm.ssm_nam,ssm.rfrsh_crtd,ssm.rfrsh_schdld,ssm.rfrsh_compl,
                                  (SELECT CONVERT(VARCHAR, ssm.rfrsh_schdld, 106)) AS schdld_date,ssm.ver_num,
                                  (SELECT CONVERT(VARCHAR(5), ssm.rfrsh_schdld, 108)) AS schdld_time FROM 
                                  wkg_pos_ssm_config ssm WHERE ssm.ssm_status =1 ORDER BY ssm.ssm_nam;

                                  select pos_grp_id,pos_grp_nam from wkg_pos_grp_mast where act_inact_ind=1;

                                  select  ssm_id,ssm_nam from wkg_pos_ssm_config where ssm_status=1;";

                List<SSM005Object> tbl1 = null;
                List<SSM005GroupObject> tbl2 = null;
                List<SSM005SSMObject> tbl3 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM005Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        
                        SSM005Object obj1 = new SSM005Object();
                        obj1.ssm_id = r.GetValue<string>("ssm_id");
                        obj1.ssm_nam = r.GetValue<string>("ssm_nam");
                        obj1.rfrsh_crtd = r.GetValue<string>("rfrsh_crtd");
                        obj1.rfrsh_schdld = r.GetValue<string>("rfrsh_schdld");
                        obj1.rfrsh_compl = r.GetValue<string>("rfrsh_compl");
                        obj1.schdld_date = r.GetValue<string>("schdld_date");
                        obj1.schdld_time = r.GetValue<string>("schdld_time");
                        obj1.ver_num = r.GetValue<string>("ver_num");

                        tbl1.Add(obj1);
                    }

                    tbl2 = new List<SSM005GroupObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM005GroupObject obj2 = new SSM005GroupObject();

                        obj2.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj2.pos_grp_nam = r.GetValue<string>("pos_grp_nam");

                        tbl2.Add(obj2);
                    }

                    tbl3 = new List<SSM005SSMObject>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM005SSMObject obj3 = new SSM005SSMObject();
                        obj3.ssm_id = r.GetValue<string>("ssm_id");
                        obj3.ssm_nam = r.GetValue<string>("ssm_nam");

                        tbl3.Add(obj3);

                    }
                    SSM005loadObject obj = new SSM005loadObject();
                    obj.Items = tbl1;
                    obj.GroupItems = tbl2;
                    obj.SSMItems = tbl3;

                    output = obj;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }


        public async Task<PageInfo<SSM005Object>> SSM005GetSearchAsync(SessionInfo sessionInfo, SSM005Object input)
        {
            var output = new PageInfo<SSM005Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                string query = "";

                if (!string.IsNullOrWhiteSpace(input.ssm_id) && !string.IsNullOrWhiteSpace(input.pos_grp_id))
                {   //SSM005 search by both ssm_id and pos_grp_id
                    query = @$"SELECT ssm.ssm_id,ssm.ssm_nam,ssm.rfrsh_crtd,ssm.rfrsh_schdld,ssm.rfrsh_compl,
                               (SELECT CONVERT(VARCHAR, ssm.rfrsh_schdld, 106)) AS schdld_date,ssm.ver_num,
                               (SELECT CONVERT(VARCHAR(5), ssm.rfrsh_schdld, 108)) AS schdld_time FROM wkg_pos_ssm_config 
                               ssm Where ssm.pos_grp_id =@pos_grp_id AND  ssm.ssm_id = @ssm_id AND ssm.ssm_status =1 
                               ORDER BY ssm.ssm_nam{(input.SortTyp ? "" : " DESC")};";
                }
                else if (!string.IsNullOrWhiteSpace(input.pos_grp_id))
                {   //SSM005 search by only pos_grp_id
                    query = @$"SELECT ssm.ssm_id,ssm.ssm_nam,ssm.rfrsh_crtd,ssm.rfrsh_schdld,ssm.rfrsh_compl,
                               (SELECT CONVERT(VARCHAR, ssm.rfrsh_schdld, 106)) AS schdld_date,ssm.ver_num,
                               (SELECT CONVERT(VARCHAR(5), ssm.rfrsh_schdld, 108)) AS schdld_time FROM wkg_pos_ssm_config 
                               ssm Where ssm.pos_grp_id =@pos_grp_id AND ssm.ssm_status =1 
                               ORDER BY ssm.ssm_nam{(input.SortTyp ? "" : " DESC")};";
                }
                else if (!string.IsNullOrWhiteSpace(input.ssm_id))
                {   //SSM005 search by both ssm_id
                    query = @$"SELECT ssm.ssm_id,ssm.ssm_nam,ssm.rfrsh_crtd,ssm.rfrsh_schdld,ssm.rfrsh_compl,
                               (SELECT CONVERT(VARCHAR, ssm.rfrsh_schdld, 106)) AS schdld_date,ssm.ver_num,
                               (SELECT CONVERT(VARCHAR(5), ssm.rfrsh_schdld, 108)) AS schdld_time FROM wkg_pos_ssm_config 
                               ssm Where ssm.ssm_id = @ssm_id AND ssm.ssm_status =1 
                               ORDER BY ssm.ssm_nam{(input.SortTyp ? "" : " DESC")};";
                }
                else
                {   //SSM005 empty search.retrives active records from wkg_pos_ssm_config
                    query = @$"SELECT ssm.ssm_id,ssm.ssm_nam,ssm.rfrsh_crtd,ssm.rfrsh_schdld,ssm.rfrsh_compl,
                               (SELECT CONVERT(VARCHAR, ssm.rfrsh_schdld, 106)) AS schdld_date,ssm.ver_num,
                               (SELECT CONVERT(VARCHAR(5), ssm.rfrsh_schdld, 108)) AS schdld_time FROM wkg_pos_ssm_config 
                               ssm Where ssm.ssm_status =1 ORDER BY ssm.ssm_nam{(input.SortTyp ? "" : " DESC")};";
                }

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM005Object>(query, dbParamters, r =>
                {
                    return new SSM005Object
                    {
                        ssm_id = r.GetValue<string>("ssm_id"),
                        ssm_nam = r.GetValue<string>("ssm_nam"),
                        rfrsh_crtd = r.GetValue<string>("rfrsh_crtd"),
                        rfrsh_schdld = r.GetValue<string>("rfrsh_schdld"),
                        rfrsh_compl = r.GetValue<string>("rfrsh_compl"),
                        schdld_date = r.GetValue<string>("schdld_date"),
                        schdld_time = r.GetValue<string>("schdld_time"),
                        ver_num = r.GetValue<string>("ver_num"),

                };
                });

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<OperationStatus> SSM005SaveAsync(SessionInfo sessionInfo, SSM005Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@rfrsh_by_usr_cd", input.rfrsh_by_usr_cd);
                string query = "";
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();
                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@ssm_id{i}", item.ssm_id.ToString());
                    if (item.Mode == "I")
                    {  //SSM005 update active ssm_id to inactive
                        query += @$"UPDATE wkg_pos_ssm_config SET rfrsh_compl= null,rfrsh_crtd = null,rfrsh_dttm = GETDATE(),
                                    rfrsh_by_usr_cd = @rfrsh_by_usr_cd WHERE ssm_id =@ssm_id{i};";
                    }
                    else
                    {   //SSM005 update rfrsh_schdld for active ssm_id
                        dbParamters.Add($"@rfrsh_schdld{i}", item.rfrsh_schdld.ToString());
                        query += @$"UPDATE wkg_pos_ssm_config SET rfrsh_compl= null,rfrsh_crtd = GETDATE(),
                                    rfrsh_schdld= {(item.rfrsh_schdld == "" ? "null" : $"@rfrsh_schdld{i}")},
                                    rfrsh_dttm = GETDATE(), rfrsh_by_usr_cd = @rfrsh_by_usr_cd WHERE ssm_id =@ssm_id{i};";
                    }
                    ++i;
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM005SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM005SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

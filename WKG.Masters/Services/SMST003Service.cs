using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
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

namespace WKG.Masters.Services
{
    internal class SMST003Service : WKLServiceManger, ISMST003Service
    {
        #region Constructor

        public SMST003Service(IServiceProvider serviceProvider, ILogger<SMST003Service> logger)
            : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods

        public async Task<SMST003loadObject> GetOnloadAsync(SessionInfo sessionInfo, SMST003Object input)
        {
            var output = new SMST003loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY pos_grp_nam) AS cnt, pgm.*, COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast pgm WHERE pgm.act_inact_ind=1 ) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;select pos_cd,pos_nam from wkg_pos_mast where act_inact_ind =1;select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind =1;select lang_cd,lang_nam from wkg_pos_accptd_lang;";

                List<SMST003Object> tbl1 = null;
                List<SMST003posObject> tbl2 = null;
                List<SMST003langObject> tbl3 = null;
                List<SMST003langObject> tbl4 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);

                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SMST003Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SMST003Object obj1 = new SMST003Object();
                        obj1.pos_grp_id = int.Parse(r.GetValue<string>("pos_grp_id"));
                        obj1.pos_cd = r.GetValue<string>("pos_cd");
                        obj1.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj1.lang_cds = r.GetValue<string>("lang_cds");
                        obj1.dflt_lang_cd = r.GetValue<string>("dflt_lang_cd");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SMST003posObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SMST003posObject obj2 = new SMST003posObject();
                        obj2.pos_nam_mast = r.GetValue<string>("pos_nam");
                        obj2.pos_cd_mast = r.GetValue<string>("pos_cd");

                        tbl2.Add(obj2);

                    }
                    tbl3 = new List<SMST003langObject>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SMST003langObject obj3 = new SMST003langObject();
                        obj3.lang_name_mast = r.GetValue<string>("lang_nam");
                        obj3.lang_cds_mast = r.GetValue<string>("lang_cd");

                        tbl3.Add(obj3);
                    }
                    tbl4 = new List<SMST003langObject>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SMST003langObject obj4 = new SMST003langObject();
                        obj4.lang_name_mast = r.GetValue<string>("lang_nam");
                        obj4.lang_cds_mast = r.GetValue<string>("lang_cd");

                        tbl4.Add(obj4);
                    }

                    SMST003loadObject obj = new SMST003loadObject();
                    obj.Items = tbl1;
                    obj.PosItem = tbl2;
                    obj.LangItem = tbl3;
                    obj.LangItemAll = tbl4;

                    output = obj;
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
        public async Task<SMST003BlurObject> BlurSearchAsync(SessionInfo sessionInfo, SMST003Object input)
        {
            var output = new SMST003BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam}");

                //string query = $"SELECT lang_srl,ssm_srl,lang_cd,car_head,todo_head,slide_head,concier_head,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,lghm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),lghm.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_lang lghm INNER JOIN rps_usr_mast usr ON usr.Usr_id = lghm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl and lang_cd = @lang_cd;";

                string query = $"SELECT pos_grp_id,pos_cd,pos_grp_nam,lang_cds,act_inact_ind,dflt_lang_cd,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_grp_mast grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where pos_grp_nam = @pos_grp_nam;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST003Object>(query, dbParamters, r =>
                {

                    return new SMST003Object
                    {
                        pos_grp_id = int.Parse(r.GetValue<string>("pos_grp_id")),
                        pos_cd = r.GetValue<string>("pos_cd"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        lang_cds = r.GetValue<string>("lang_cds"),
                        dflt_lang_cd = r.GetValue<string>("dflt_lang_cd"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });

                if (output.Items != null && output.Items.Count > 0)
                {
                    output.Isavailable = true;
                }
                else
                {
                    output.Isavailable = false;
                }


            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<PageInfo<SMST003Object>> GetSearchAsync(SessionInfo sessionInfo, SMST003Object input)
        {
            var output = new PageInfo<SMST003Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                if (!string.IsNullOrWhiteSpace(input.pos_grp_nam) || !string.IsNullOrWhiteSpace(input.act_inact_ind))
                {
                    query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY pos_grp_nam" : "ORDER BY pos_grp_nam DESC")}) AS cnt, pgm.*, COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast pgm WHERE pgm.act_inact_ind=@act_inact_ind and pgm.pos_grp_nam LIKE @pos_grp_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST003Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SMST003Object
                    {
                        pos_grp_id = int.Parse(r.GetValue<string>("pos_grp_id")),
                        pos_cd = r.GetValue<string>("pos_cd"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        lang_cds = r.GetValue<string>("lang_cds"),
                        dflt_lang_cd = r.GetValue<string>("dflt_lang_cd"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),

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
        public async Task<List<SMST003Object>> GetProductsAsync(SessionInfo sessionInfo, SMST003Object input)
        {
            var output = new List<SMST003Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = $"SELECT pos_grp_id,pos_cd,pos_grp_nam,lang_cds,act_inact_ind,dflt_lang_cd,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_grp_mast grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where pos_grp_id = @pos_grp_id;";

                output = await this.DBUtils(true).GetEntityDataListAsync<SMST003Object>(query, dbParamters, r =>
                {
                    return new SMST003Object
                    {
                        pos_grp_id = int.Parse(r.GetValue<string>("pos_grp_id")),
                        pos_cd = r.GetValue<string>("pos_cd"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        dflt_lang_cd = r.GetValue<string>("dflt_lang_cd"),
                        lang_cds = r.GetValue<string>("lang_cds"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
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
        public async Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, SMST003Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@pos_cd", input.pos_cd);
                dbParamters.Add("@pos_grp_nam", input.pos_grp_nam);
                dbParamters.Add("@lang_cds", input.lang_cds == null ? null : input.lang_cds);
                dbParamters.Add("@dflt_lang_cd", input.dflt_lang_cd == null ? null : input.dflt_lang_cd);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind == "1" ? 1 : 0);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                if (input.IsEdit)
                {
                    query = $"UPDATE wkg_pos_grp_mast SET pos_cd = @pos_cd, pos_grp_nam = @pos_grp_nam, lang_cds = @lang_cds,dflt_lang_cd=@dflt_lang_cd,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = getdate() WHERE pos_grp_id = @pos_grp_id;";

                }
                else
                {
                    query = $"INSERT INTO wkg_pos_grp_mast(pos_cd, pos_grp_nam,lang_cds,dflt_lang_cd,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@pos_cd,@pos_grp_nam,@lang_cds,@dflt_lang_cd,@act_inact_ind,@mod_by_usr_cd,getdate());";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

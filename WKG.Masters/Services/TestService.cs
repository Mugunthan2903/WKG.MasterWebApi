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

namespace WKG.Masters.Services {
    public class TestService : WKLServiceManger, ITestService {
        #region Constructor
        public TestService( IServiceProvider serviceProvider, ILogger<SMST002Service> logger ) : base(serviceProvider, logger) { }
        #endregion
        #region Private Methods
        #endregion
        #region Public Methods
        public async Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SMST002TableFields input ) {
            var output = new OperationStatus();
            try {
                var dbParameters = new DBParameters();
                dbParameters.Add("@lang_cd", input.lang_cd);
                dbParameters.Add("@lang_nam", input.lang_nam);
                dbParameters.Add("@tui_lang_cd", input.tui_lang_cd);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParameters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query;

                if (input.isEdit) {
                    query = "UPDATE wkg_pos_accptd_lang SET lang_nam = @lang_nam, " +
                            (input.tui_lang_cd != "" ? "tui_lang_cd = @tui_lang_cd, " : "") +
                            "act_inact_ind = @act_inact_ind, mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = getdate() " +
                            "WHERE lang_cd = @lang_cd;";
                } else {
                    query = "INSERT INTO wkg_pos_accptd_lang (lang_cd, lang_nam, tui_lang_cd, act_inact_ind, mod_by_usr_cd, mod_dttm) " +
                            "VALUES (@lang_cd, @lang_nam, @tui_lang_cd, @act_inact_ind, @mod_by_usr_cd, getdate());";
                }
                using (var dbService = this.GetDBService(true)) {
                    using (var dbTran = dbService.BeginTransaction()) {
                        try {
                            await dbService.ExecuteSqlCommandAsync(query, dbParameters);

                            dbTran.Commit();
                            output.IsSuccess = true;
                        } catch (Exception ex) {
                            try {
                                dbTran.Rollback();
                            } catch (Exception ex1) { }
                        }
                    }
                }
            } catch (Exception ex) { }

            return output;
        }
        public async Task<PageInfo<SMST002TableFields>> GetSearchDataAsync( SessionInfo sessionInfo, SMST002SearchInputs input ) {
            var output = new PageInfo<SMST002TableFields>();
            try {
                var dbParameters = new DBParameters();
                dbParameters.Add("@lang_nam", $"{input.lang_name}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind == "true" ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY lang_nam {(input.TuiAsc?"":"DESC")}) AS cnt, t.*, COUNT(*) OVER () AS total_count FROM wkg_pos_accptd_lang t WHERE t.act_inact_ind=@act_inact_ind and t.lang_nam LIKE @lang_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST002TableFields>(query, dbParameters, r =>
                {
                    tolR = r.GetValue<int>("total_count");
                    return new SMST002TableFields {
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = r.GetValue<string>("lang_nam"),
                        tui_lang_cd = r.GetValue<string>("tui_lang_cd"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm")
                    };
                });

                output.TotalRecords = tolR;
                output.TotalPages = (int)Math.Ceiling((double)output.TotalRecords / input.PageSize);
                output.CurrentPage = tolR==0?1:input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            } catch (Exception ex) {}
            return output;
        }
        public async Task<SMST003loadObject> GetOnloadAsync( SessionInfo sessionInfo, SMST003Object input ) {
            var output = new SMST003loadObject();
            try {
                var dbParamters = new DBParameters();
                string query = $"SELECT * FROM wkg_pos_grp_mast where act_inact_ind =1;;select pos_cd,pos_nam from wkg_pos_mast where act_inact_ind =1;select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind =1;";

                List<SMST003Object> tbl1 = null;
                List<SMST003posObject> tbl2 = null;
                List<SMST003langObject> tbl3 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);

                if (DS != null && DS.Tables.Count > 0) {
                    tbl1 = new List<SMST003Object>();
                    foreach (DataRow r in DS.Tables[0].Rows) {
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
                    foreach (DataRow r in DS.Tables[1].Rows) {
                        SMST003posObject obj2 = new SMST003posObject();
                        obj2.pos_nam_mast = r.GetValue<string>("pos_nam");
                        obj2.pos_cd_mast = r.GetValue<string>("pos_cd");

                        tbl2.Add(obj2);

                    }
                    tbl3 = new List<SMST003langObject>();
                    foreach (DataRow r in DS.Tables[2].Rows) {
                        SMST003langObject obj3 = new SMST003langObject();
                        obj3.lang_name_mast = r.GetValue<string>("lang_nam");
                        obj3.lang_cds_mast = r.GetValue<string>("lang_cd");

                        tbl3.Add(obj3);
                    }

                    SMST003loadObject obj = new SMST003loadObject();//new SMST003Object(); SMST003loadObject
                    obj.Items = tbl1;
                    obj.PosItem = tbl2;
                    obj.LangItem = tbl3;

                    output = obj;
                }

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<List<SMST003Object>> GetSearchAsync( SessionInfo sessionInfo, SMST003Object input ) {
            var output = new List<SMST003Object>();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                string query = "";
                if (!string.IsNullOrWhiteSpace(input.pos_grp_nam) || !string.IsNullOrWhiteSpace(input.act_inact_ind)) {
                    query = $"SELECT * FROM wkg_pos_grp_mast where pos_grp_nam LIKE @pos_grp_nam AND act_inact_ind = @act_inact_ind;";
                }

                output = await this.DBUtils(true).GetEntityDataListAsync<SMST003Object>(query, dbParamters, r =>
                {
                    return new SMST003Object {
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


            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<List<SMST003Object>> GetProductsAsync( SessionInfo sessionInfo, SMST003Object input ) {
            var output = new List<SMST003Object>();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = $"SELECT pos_grp_id,pos_cd,pos_grp_nam,lang_cds,act_inact_ind,dflt_lang_cd,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_grp_mast grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where pos_grp_id = @pos_grp_id;";

                output = await this.DBUtils(true).GetEntityDataListAsync<SMST003Object>(query, dbParamters, r =>
                {
                    return new SMST003Object {
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

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> SaveAsync( SessionInfo sessionInfo, SMST003Object input ) {
            var output = new OperationStatus();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@pos_cd", input.pos_cd);
                dbParamters.Add("@pos_grp_nam", input.pos_grp_nam);
                dbParamters.Add("@lang_cds", input.lang_cds == null ? null : input.lang_cds);
                dbParamters.Add("@dflt_lang_cd", input.dflt_lang_cd == null ? null : input.dflt_lang_cd);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind == "1" ? 1 : 0);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                if (input.IsEdit) {
                    query = $"UPDATE wkg_pos_grp_mast SET pos_cd = @pos_cd, pos_grp_nam = @pos_grp_nam, lang_cds = @lang_cds,dflt_lang_cd=@dflt_lang_cd,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = getdate() WHERE pos_grp_id = @pos_grp_id;";

                } else {
                    query = $"INSERT INTO wkg_pos_grp_mast(pos_cd, pos_grp_nam,lang_cds,dflt_lang_cd,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@pos_cd,@pos_grp_nam,@lang_cds,@dflt_lang_cd,@act_inact_ind,@mod_by_usr_cd,getdate());";

                }

                using (var dbService = this.GetDBService(true)) {
                    using (var dbTran = dbService.BeginTransaction()) {
                        try {
                            await dbService.ExecuteSqlCommandAsync(query, dbParamters);

                            dbTran.Commit();
                            output.IsSuccess = true;
                        } catch (Exception ex) {
                            try {
                                dbTran.Rollback();
                            } catch (Exception ex1) {
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            output.Message = "Something went wrong";
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

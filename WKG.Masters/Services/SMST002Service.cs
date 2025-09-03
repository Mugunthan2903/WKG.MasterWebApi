using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using WKL.Service.Domain;

namespace WKG.Masters.Services {
    public class SMST002Service: WKLServiceManger,ISMST002Service {
        #region Constructor
        public SMST002Service( IServiceProvider serviceProvider, ILogger<SMST002Service> logger ) : base(serviceProvider, logger) { }
        #endregion
        #region Private Methods
        #endregion
        #region Public Methods
        #endregion
        public async Task<PageInfo<SMST002TableFields>> GetSearchDataAsync( SessionInfo sessionInfo, SMST002SearchInputs input ) {
            var output = new PageInfo<SMST002TableFields>();
            try {
                var dbParameters = new DBParameters();
                dbParameters.Add("@lang_nam", $"{input.lang_name}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind == "true" ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY lang_nam {(input.TuiAsc ? "" : "DESC")}) AS cnt, alm.*, COUNT(*) OVER () AS total_count FROM wkg_pos_accptd_lang alm WHERE alm.act_inact_ind=@act_inact_ind and alm.lang_nam LIKE @lang_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST002TableFields>(query, dbParameters, r => {
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
                output.CurrentPage = tolR == 0 ? 1 : input.PageNo;
            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsync( SessionInfo sessionInfo, SMST002TableFields input ) {
            var output = new OperationStatus();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@lang_nam", $"{input.lang_nam}");
                dbParamters.Add("@tui_lang_cd", $"{input.tui_lang_cd}");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParamters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                //dbParamters.Add("@mod_by_usr_cd", $"123");
                string query;
                if(input.isEdit) {
                    query = $"UPDATE wkg_pos_accptd_lang SET lang_nam = @lang_nam,{(input.tui_lang_cd!=""? "tui_lang_cd = @tui_lang_cd,": "tui_lang_cd = null,")}act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm=getdate() where lang_cd=@lang_cd;";
                } else {
                    //query = $"INSERT INTO wkg_pos_accptd_lang(lang_cd,lang_nam{(input.tui_lang_cd != "" ? ",tui_lang_cd" : "")},act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@lang_cd, @lang_nam,{(input.tui_lang_cd != "" ? "@tui_lang_cd," : "")}@act_inact_ind,'13036','2024-02-12 09:53:25.130');";
                    query = $"INSERT INTO wkg_pos_accptd_lang(lang_cd,lang_nam,tui_lang_cd,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@lang_cd, @lang_nam,@tui_lang_cd,@act_inact_ind,@mod_by_usr_cd,getdate());";
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
                            } catch (Exception ex1) {}
                        }
                    }
                }
            } catch(Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<SMST002TableFields> ModifyDataAsync( SessionInfo sessionInfo, SMST002PopulateFormId input ) {
            var output = new SMST002TableFields();
            try {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                string query = $"SELECT lang_cd,lang_nam,tui_lang_cd,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_accptd_lang grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where lang_cd=@lang_cd;";
                output = await this.DBUtils(true).GetEntityDataAsync<SMST002TableFields>(query, dbParamters, r => {
                    return new SMST002TableFields {
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = r.GetValue<string>("lang_nam"),
                        tui_lang_cd = r.GetValue<string>("tui_lang_cd"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm")
                    };
                });

            } catch (Exception ex) {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<SMST002CheckPrimaryReturn> CheckPrimary( SessionInfo sessionInfo, SMST002TableFields input )
        {
            var output = new SMST002CheckPrimaryReturn();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                string query = $"SELECT lang_cd,lang_nam,tui_lang_cd,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm FROM wkg_pos_accptd_lang grp INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where lang_cd=@lang_cd;";
                var temp = await this.DBUtils(true).GetEntityDataListAsync<SMST002TableFields>(query, dbParamters, r => {
                    return new SMST002TableFields
                    {
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = r.GetValue<string>("lang_nam"),
                        tui_lang_cd = r.GetValue<string>("tui_lang_cd"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm")
                    };
                });
                if (temp.Count == 0)
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
    }
}

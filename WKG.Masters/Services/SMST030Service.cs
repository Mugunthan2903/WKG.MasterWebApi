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

namespace WKG.Masters.Services
{
    public class SMST030Service : WKLServiceManger, ISMST030Service
    {
        #region Constructor
        public SMST030Service( IServiceProvider serviceProvider, ILogger<SMST030Service> logger ) : base(serviceProvider, logger) { }
        #endregion
        #region Private Methods
        #endregion
        #region Public Methods
        public async Task<PageInfo<SMST031TableFields>> SearchData031( SessionInfo sessionInfo, SMST031SearchFields input )
        {
            var output = new PageInfo<SMST031TableFields>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@evnt_typ_nam", $"{input.evnt_typ_nam}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind?1:0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY evnt_typ_nam {(input.sortType?"ASC":"DESC")}) AS cnt, etm.*, COUNT(*) OVER () AS total_count FROM wkg_ltd_evnt_typ_mast etm WHERE etm.act_inact_ind=@act_inact_ind and etm.evnt_typ_nam LIKE @evnt_typ_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST031TableFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SMST031TableFields
                    {
                        evnt_typ_id = r.GetValue<string>("evnt_typ_id"),
                        evnt_typ_nam = r.GetValue<string>("evnt_typ_nam"),
                        sort_ordr = r.GetValue<short>("sort_ordr")==0?"":$"{r.GetValue<short>("sort_ordr")}",
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_dttm = r.GetValue<string>("mod_dttm")
                    };
                });
                output.SetPages(tolR,input.PageSize);
                output.CurrentPage = tolR == 0 ? 1 : input.PageNo;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SMST031TableFields> LoadSelectedData031( SessionInfo sessionInfo, SMST031TableFields input )
        {
            var output = new SMST031TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@evnt_typ_id", input.evnt_typ_id);
                /*
                 * SELECT etm.evnt_typ_id,etm.evnt_typ_nam,etm.evnt_shrt_nam,etm.act_inact_ind,etm.evnt_typ_aval,etm.sort_ordr,
                   REPLACE(CONVERT(VARCHAR,etm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),etm.mod_dttm,108) AS 
                   mod_dttm,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from wkg_ltd_evnt_typ_mast etm 
                   INNER JOIN rps_usr_mast usr ON usr.Usr_id = etm.mod_by_usr_cd
                   INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                   WHERE evnt_typ_id = 1;
                 */
                string query = $"SELECT evnt_typ_id,evnt_typ_nam,evnt_shrt_nam,act_inact_ind,evnt_typ_aval,sort_ordr,REPLACE(CONVERT(VARCHAR,mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),mod_dttm,108) AS mod_dttm,mod_by_usr_cd from wkg_ltd_evnt_typ_mast WHERE evnt_typ_id = @evnt_typ_id;";
                output = await this.DBUtils(true).GetEntityDataAsync<SMST031TableFields>(query, dbParameters, r => {
                    return new SMST031TableFields
                    {
                        evnt_typ_id = r.GetValue<string>("evnt_typ_id"),
                        evnt_typ_nam = r.GetValue<string>("evnt_typ_nam"),
                        evnt_shrt_nam = r.GetValue<string>("evnt_shrt_nam"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        sort_ordr = r.GetValue<short>("sort_ordr") == 0 ? "" : $"{r.GetValue<short>("sort_ordr")}",
                        evnt_typ_aval = r.GetValue<bool>("evnt_typ_aval"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                    };
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsync031( SessionInfo sessionInfo, SMST031TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@evnt_typ_id", input.evnt_typ_id);
                dbParamters.Add("@evnt_typ_nam", input.evnt_typ_nam);
                dbParamters.Add("@evnt_shrt_nam", input.evnt_shrt_nam);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                string query = $"UPDATE wkg_ltd_evnt_typ_mast SET evnt_typ_nam = @evnt_typ_nam,evnt_shrt_nam = @evnt_shrt_nam, act_inact_ind = @act_inact_ind, mod_dttm = GETDATE() where evnt_typ_id=@evnt_typ_id;";
                
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
                            catch (Exception ex1) { }
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
        public async Task<PageInfo<SMST032TableFields>> SearchData032( SessionInfo sessionInfo, SMST032SearchFields input )
        {
            var output = new PageInfo<SMST032TableFields>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@dlvry_typ_nam", $"{input.dlvry_typ_nam}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY dlvry_typ_nam {(input.sortType?"ASC":"DESC")}) AS cnt, dtm.*, COUNT(*) OVER () AS total_count FROM wkg_ltd_dlvry_typ_mast dtm WHERE dtm.act_inact_ind=@act_inact_ind and dtm.dlvry_typ_nam LIKE @dlvry_typ_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST032TableFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SMST032TableFields
                    {
                        dlvry_typ_id = r.GetValue<string>("dlvry_typ_id"),
                        dlvry_typ_nam = r.GetValue<string>("dlvry_typ_nam"),
                        dlvry_typ_aval = r.GetValue<bool>("dlvry_typ_aval"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                    };
                });
                output.SetPages(tolR, input.PageSize);
                output.CurrentPage = tolR == 0 ? 1 : input.PageNo;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SMST032TableFields> LoadSelectedData032( SessionInfo sessionInfo, SMST032TableFields input )
        {
            var output = new SMST032TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@dlvry_typ_id", input.dlvry_typ_id);
                /*
                 * SELECT dtm.dlvry_typ_id,dtm.dlvry_typ_nam,dtm.dlvry_shrt_nam,dlvry_price,dtm.dlvry_wkg_markup,dtm.act_inact_ind,
                   dtm.dlvry_typ_aval,
                   REPLACE(CONVERT(VARCHAR,dtm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),dtm.mod_dttm,108) AS mod_dttm,
                   emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from 
                   wkg_ltd_dlvry_typ_mast dtm 
                   INNER JOIN rps_usr_mast usr ON usr.Usr_id = dtm.mod_by_usr_cd
                   INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                   WHERE dlvry_typ_id = '1';
                 */
                string query = $"SELECT dlvry_typ_id,dlvry_typ_nam,dlvry_shrt_nam,dlvry_price,dlvry_wkg_markup,act_inact_ind,dlvry_typ_aval,REPLACE(CONVERT(VARCHAR,mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),mod_dttm,108) AS mod_dttm,mod_by_usr_cd from wkg_ltd_dlvry_typ_mast WHERE dlvry_typ_id = @dlvry_typ_id;";
                output = await this.DBUtils(true).GetEntityDataAsync<SMST032TableFields>(query, dbParameters, r => {
                    return new SMST032TableFields
                    {
                        dlvry_typ_id = r.GetValue<string>("dlvry_typ_id"),
                        dlvry_typ_nam = r.GetValue<string>("dlvry_typ_nam"),
                        dlvry_shrt_nam = r.GetValue<string>("dlvry_shrt_nam"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        dlvry_price = r.GetValue<string>("dlvry_price") ,
                        dlvry_typ_aval = r.GetValue<bool>("dlvry_typ_aval") ,
                        dlvry_wkg_markup = r.GetValue<string>("dlvry_wkg_markup"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                    };
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsync032( SessionInfo sessionInfo, SMST032TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@dlvry_typ_id", input.dlvry_typ_id);
                dbParamters.Add("@dlvry_typ_nam", input.dlvry_typ_nam);
                dbParamters.Add("@dlvry_shrt_nam", input.dlvry_shrt_nam);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                string query = $"UPDATE wkg_ltd_dlvry_typ_mast SET dlvry_typ_nam = @dlvry_typ_nam, dlvry_shrt_nam = @dlvry_shrt_nam , act_inact_ind = @act_inact_ind, mod_dttm = GETDATE() where dlvry_typ_id = @dlvry_typ_id;";

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
                            catch (Exception ex1) { }
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

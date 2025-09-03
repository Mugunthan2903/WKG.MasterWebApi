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

namespace WKG.Masters.Services
{
    internal class SMST001Service: WKLServiceManger, ISMST001Service
    {
        #region Constructor

        public SMST001Service(IServiceProvider serviceProvider, ILogger<SMST001Service> logger)
            : base(serviceProvider, logger)
        {
        }

        public async Task<PageInfo<SMST001Object>> GetProductsAsync(SessionInfo sessionInfo,SearchInput input)
        {
            var output = new PageInfo<SMST001Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = "";
                if (input.Mode.ToUpper() == "SEARCH")
                {
                    if (input.Name == "")
                    {
                        query = $"SELECT* FROM(SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY pos_nam" : "ORDER BY pos_nam DESC")}) AS cnt, pos_cd, pos_nam, act_inact_ind, mod_by_usr_cd, mod_dttm, COUNT(*) OVER() AS total_count FROM wkg_pos_mast WHERE act_inact_ind = " + input.Status + ") AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                    }
                    else
                    {
                        query = $"SELECT* FROM(SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY pos_nam" : "ORDER BY pos_nam DESC")}) AS cnt, pos_cd, pos_nam, act_inact_ind, mod_by_usr_cd, mod_dttm, COUNT(*) OVER() AS total_count FROM wkg_pos_mast WHERE pos_nam LIKE '%" + input.Name + "%' And act_inact_ind = " + input.Status + ") AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                    }
                }               
                if (input.Mode.ToUpper() == "SELECT")
                {
                    query = $"SELECT pos_cd,pos_nam,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,wpm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),wpm.mod_dttm,108) AS mod_dttm FROM wkg_pos_mast wpm INNER JOIN rps_usr_mast usr ON usr.Usr_id = wpm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where pos_cd = '"+ input.pos_cd +"';";
                }
                
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST001Object>(query, dbParamters, r =>
                {
                    totalrecords = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<int>("total_count") : 0;
                    return new SMST001Object
                    {
                        pos_cd = r.GetValue<string>("pos_cd"),
                        pos_nam = r.GetValue<string>("pos_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm")
                    };
                });
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;

                if (input.Mode.ToUpper() == "SEARCH")
                {
                    output.SetPages(output.TotalRecords, input.PageSize);
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> PosSaveAsync(SessionInfo sessionInfo, SMST001Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@pos_cd", input.pos_cd);
                dbParamters.Add("@pos_nam", input.pos_nam);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind.ToUpper() == "TRUE" ? 1 : 0);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.ISEdit == "true")
                {
                    query = $"UPDATE wkg_pos_mast SET pos_nam = @pos_nam, act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = getdate() WHERE pos_cd = @pos_cd;";
                }
                else
                {
                    query = $"INSERT INTO wkg_pos_mast(pos_cd, pos_nam,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@pos_cd, @pos_nam,@act_inact_ind,@mod_by_usr_cd,getdate());";
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

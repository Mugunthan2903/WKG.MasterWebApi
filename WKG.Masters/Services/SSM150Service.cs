using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.Extensions.Logging;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using WKL.Service.Domain;
using static System.Net.Mime.MediaTypeNames;
using static WKG.Masters.Model.User;

namespace WKG.Masters.Services
{
    internal class SSM150Service : WKLServiceManger, ISSM150Service
    {
        #region Constructor
        public SSM150Service(IServiceProvider serviceProvider, ILogger<SSM150Service> logger)
        : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM150-Main Grid

        public async Task<SSM150loadObject> SSM150OnloadSearch(SessionInfo sessionInfo, SSM150Object input)
        {
            var output = new SSM150loadObject();
            try
            {
                List<SSM150Object> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@diff_nam", $"%{input.diff_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"dtls.diff_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }
                //SSM150 onload and search query
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring} ) AS cnt,
                dtls.loc_typ_cd,dtls.diff_cd,dtls.diff_nam,dtls.act_inact_ind, Loc.loc_typ_nam,COUNT(*) OVER () AS total_count
                FROM wkg_nx_loc_typ_diff_dtls dtls 
                INNER JOIN wkg_nx_loc_typ_mast as Loc ON Loc.loc_typ_cd = dtls.loc_typ_cd 
                WHERE dtls.diff_nam LIKE @diff_nam AND dtls.act_inact_ind = @act_inact_ind) AS temp 
                WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM150Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM150Object obj1 = new SSM150Object();
                        totalrecords = r.GetValue<int>("total_count");
                        obj1.diff_id = r.GetValue<string>("diff_cd");
                        obj1.diff_nam = r.GetValue<string>("diff_nam");
                        obj1.loc_typ_nam = r.GetValue<string>("loc_typ_nam");
                        obj1.loc_typ_cd = r.GetValue<string>("loc_typ_cd");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
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

        public async Task<OperationStatus> SSM150DifferentialSaveGrid(SessionInfo sessionInfo, SSM150Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                var Loopdata = input.Selectedrow;

                var valuesBuilder = new StringBuilder();
                var querybuild = new StringBuilder();

                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@loc_typ_cd{i}", item.loc_typ_cd.ToString());
                    dbParamters.Add($"@diff_cd{i}", item.diff_id.ToString());
                    

                    querybuild.Append(@$"UPDATE wkg_nx_loc_typ_diff_dtls set mod_dttm = GETDATE() , mod_by_usr_cd = @mod_by_usr_cd , act_inact_ind = @act_inact_ind{i} WHERE 
                                        diff_cd = @diff_cd{i} AND loc_typ_cd = @loc_typ_cd{i};");

                    // valuesBuilder.Append($"(@act_inact_ind{i},@diff_cd{i},@loc_typ_cd{i}),");
                    // valuesBuilder.Append($"(@act_inact_ind{i},@diff_cd{i},@loc_typ_cd{i},@mod_by_usr_cd{i}),");
                    ++i;
                }
                query = querybuild.ToString();

                //valuesBuilder.Length -= 1;
                //string valuesClause = valuesBuilder.ToString();
                //query = @$"UPDATE dtls SET dtls.act_inact_ind = Val.act_inact_ind,dtls.mod_dttm = GETDATE(),dtls.mod_by_usr_cd=Val.mod_by_usr_cd 
                //           FROM wkg_nx_loc_typ_diff_dtls dtls INNER JOIN (Values{valuesClause}) AS Val(act_inact_ind,diff_cd,loc_typ_cd,mod_by_usr_cd) ON 
                //           Val.diff_cd = dtls.diff_cd AND Val.loc_typ_cd = dtls.loc_typ_cd;";
                
                
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM150DifferentialSaveGrid)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM150DifferentialSaveGrid)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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



        #region Public Methods SSM151-Main Grid

        public async Task<SSM151loadObject> SSM151OnloadSearch(SessionInfo sessionInfo, SSM151Object input)
        {
            var output = new SSM151loadObject();
            try
            {
                List<SSM151Object> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@fare_nam", $"%{input.fare_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"dtls.fare_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }
                //SSM151 onload and search query
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring} ) AS cnt,
                dtls.fare_cd,dtls.fare_nam,dtls.act_inact_ind,dtls.supp_map_id,COUNT(*) OVER () AS total_count
                FROM wkg_coach_fare_dtls dtls 
                WHERE dtls.fare_nam LIKE @fare_nam AND dtls.act_inact_ind = @act_inact_ind) AS temp 
                WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                DataSet DS = await this.DBUtils(false).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM151Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM151Object obj1 = new SSM151Object();
                        totalrecords = r.GetValue<int>("total_count");
                        obj1.fare_cd = r.GetValue<string>("fare_cd");
                        obj1.fare_nam = r.GetValue<string>("fare_nam");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.supp_map_id = r.GetValue<string>("supp_map_id");
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

        public async Task<OperationStatus> SSM151FareSaveGrid(SessionInfo sessionInfo, SSM151Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                var Loopdata = input.Selectedrow;

                var valuesBuilder = new StringBuilder();
                var querybuild = new StringBuilder();

                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@fare_cd{i}", item.fare_cd.ToString());
                    dbParamters.Add($"@supp_map_id{i}", item.supp_map_id.ToString());


                    querybuild.Append(@$"UPDATE wkg_coach_fare_dtls set   mod_dttm = GETDATE(), mod_by_usr_cd = @mod_by_usr_cd , act_inact_ind = @act_inact_ind{i} WHERE 
                                        fare_cd = @fare_cd{i} AND supp_map_id = @supp_map_id{i};");

               
                    ++i;
                }
                query = querybuild.ToString();

                using (var dbService = this.GetDBService(false))
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM151FareSaveGrid)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM151FareSaveGrid)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Logging;
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
    internal class SSM090Service : WKLServiceManger, ISSM090Service
    {
        #region Constructor
        public SSM090Service(IServiceProvider serviceProvider, ILogger<SSM090Service> logger)
        : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM090
        public async Task<SSM090OnloadObject> SSM090OnloadAsync(SessionInfo sessionInfo, SSM090Object input)
        {
            var output = new SSM090OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@loc_nam", $"%{input.loc_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                List<SSM090Object> tbl1 = null;
                int totalrecords = 0;
                string query = "";
                //SSM090 onload retrives available langugaes, Image directory and records for grid
                query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY arena.loc_nam ) AS cnt ,loc_nam,
                           loc_srl,data_srl,act_inact_ind,sort_ordr, COUNT(*) OVER () AS total_count FROM wkg_trnsfr_arena_loc_dtls arena 
                           where arena.act_inact_ind=@act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                           SELECT arena_img_dir FROM wkg_cntrl_param_mast;

                           SELECT TOP 1 * FROM wkg_lang_data;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM090Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {

                        totalrecords = r.GetValue<int>("total_count");
                        SSM090Object obj1 = new SSM090Object();

                        obj1.loc_nam = r.GetValue<string>("loc_nam");
                        obj1.loc_srl = r.GetValue<string>("loc_srl");
                        obj1.data_srl = r.GetValue<string>("data_srl");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");

                        tbl1.Add(obj1);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.img_dir = r.GetValue<string>("arena_img_dir");

                    }
                    if (DS.Tables[2].Rows != null && DS.Tables[2].Rows.Count > 0)
                    {
                        output.Lang_types = JsonConvert.SerializeObject(DS.Tables[2], Formatting.Indented);

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

        public async Task<SSM090OnloadObject> SSM090GetSearchAsync(SessionInfo sessionInfo, SSM090Object input)
        {
            var output = new SSM090OnloadObject();
            try
            {

                var dbParamters = new DBParameters();
                dbParamters.Add("@loc_nam", $"%{input.loc_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                List<SSM090Object> tbl1 = null;
                int totalrecords = 0;
                string query = "";
                //SSM090 search records for grid
                query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {(input.SortTyp ? " arena.loc_nam" : " arena.loc_nam DESC")}) 
                           AS cnt ,loc_nam,loc_srl,data_srl,act_inact_ind,sort_ordr, COUNT(*) OVER () AS total_count FROM 
                           wkg_trnsfr_arena_loc_dtls arena WHERE arena.loc_nam LIKE @loc_nam AND arena.act_inact_ind=@act_inact_ind) AS temp 
                           WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM090Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM090Object obj1 = new SSM090Object();

                        obj1.loc_nam = r.GetValue<string>("loc_nam");
                        obj1.loc_srl = r.GetValue<string>("loc_srl");
                        obj1.data_srl = r.GetValue<string>("data_srl");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");

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
        public async Task<SSM090OnloadObject> SSM090BlurAsync(SessionInfo sessionInfo, SSM090Object input)
        {
            var output = new SSM090OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", $"{input.img_dir}");
                //SSM090 Checks if image name exists in the directory
                string query = @"SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<SSM090OnloadObject> SSM090GetSelectAsync(SessionInfo sessionInfo, SSM090Object input)
        {
            var output = new SSM090OnloadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@loc_srl", $"{input.loc_srl}");
                dbParamters.Add("@data_srl", $"{input.data_srl}");
                List<SSM090Object> tbl1 = null;
                string query = "";
                //SSM090 get details for selected data to edit
                query = @"SELECT arena.loc_srl,arena.loc_nam,arena.img_srl,arena.data_srl,arena.sort_ordr,arena.act_inact_ind,
                          img.img_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                          REPLACE(CONVERT(VARCHAR,arena.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),arena.mod_dttm,108) AS mod_dttm 
                          FROM wkg_trnsfr_arena_loc_dtls arena 
                          INNER JOIN wkg_img_dtls img ON arena.img_srl = img.img_srl
                          INNER JOIN rps_usr_mast usr ON usr.Usr_id = arena.mod_by_usr_cd 
                          INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                          WHERE arena.loc_srl = @loc_srl;

                          SELECT * from wkg_lang_data WHERE data_srl = @data_srl;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM090Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM090Object obj1 = new SSM090Object();

                        obj1.loc_srl = r.GetValue<string>("loc_srl");
                        obj1.loc_nam = r.GetValue<string>("loc_nam");
                        obj1.img_srl = r.GetValue<string>("img_srl");
                        obj1.data_srl = r.GetValue<string>("data_srl");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.img_nam = r.GetValue<string>("img_nam");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");

                        tbl1.Add(obj1);
                    }
                    if (DS.Tables[1].Rows != null && DS.Tables[1].Rows.Count > 0)
                    {
                        output.Lang_types = JsonConvert.SerializeObject(DS.Tables[1], Formatting.Indented);

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
        public async Task<OperationStatus> SSM090SaveDataAsync(SessionInfo sessionInfo, SSM090Object input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                var Temp = input.LangData;
                var valuesBuilder = new StringBuilder();

                dbParamters.Add("@data_srl", input.data_srl);
                dbParamters.Add("@loc_srl", input.loc_srl);
                dbParamters.Add("@loc_nam", input.loc_nam);
                dbParamters.Add("@img_srl", input.img_srl);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@data_typ_cd", StaticData.SSM090SC.DataTypeCode);

                //Image upload
                if (input.ImageChanged == "YES" && input.OldImg == "NO")
                {
                    if (files != null)
                    {
                        var tourser = this.GetService<IFileManagerService>();
                        var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });

                    }
                }
                string query = "";
                if (input.Mode == "UPDATE")
                {
                    // SSM090 Build update query for wkg_lang_data
                    if (input.LangChanged == "YES")
                    {
                        StringBuilder queryBuilder = new StringBuilder();
                        queryBuilder.Append("UPDATE wkg_lang_data SET ");
                        int i = 1;
                        foreach (var pair in Temp)
                        {
                            dbParamters.Add($"@pairvalue{i}", pair.value.ToString());
                            queryBuilder.Append($"{pair.text} = @pairvalue{i}, ");
                            ++i;
                        }
                        queryBuilder.Append($"mod_by_usr_cd = @mod_by_usr_cd, ");
                        queryBuilder.Append("mod_dttm = getdate() ");
                        queryBuilder.Append($"WHERE data_srl = @data_srl;");
                        query += queryBuilder.ToString();
                    }
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {   //SSM090 update query for using old image
                            query += @"UPDATE wkg_trnsfr_arena_loc_dtls SET loc_nam=@loc_nam,img_srl=@img_srl,
                                       sort_ordr=@sort_ordr,act_inact_ind=@act_inact_ind,
                                       mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=getdate() WHERE loc_srl=@loc_srl;";

                        }
                        else if (input.OldImg == "NO")
                        {   //SSM090  Build query for insert new image and update into wkg_trnsfr_arena_loc_dtls
                            query += @"INSERT INTO wkg_img_dtls(img_nam,img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES(@img_nam,@img_dir,@act_inact_ind,@mod_by_usr_cd,getdate());

                                       UPDATE wkg_trnsfr_arena_loc_dtls SET loc_nam=@loc_nam,img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),
                                       sort_ordr=@sort_ordr,act_inact_ind=@act_inact_ind,mod_by_usr_cd=@mod_by_usr_cd,
                                       mod_dttm=getdate() WHERE loc_srl=@loc_srl;";
                        }
                    }
                    else
                    {   //SSM090 Update query for no change in image
                        query += @"UPDATE wkg_trnsfr_arena_loc_dtls SET loc_nam=@loc_nam,
                                   sort_ordr=@sort_ordr,act_inact_ind=@act_inact_ind,
                                   mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=getdate() WHERE loc_srl=@loc_srl;";
                    }

                }
                else if (input.Mode == "INSERT")
                {
                    //SSM090 Build insert query for wkg_lang_data
                    StringBuilder queryBuilder = new StringBuilder();
                    queryBuilder.Append("INSERT INTO wkg_lang_data (");
                    foreach (var pair in Temp)
                    {
                        queryBuilder.Append($"{pair.text}, ");
                    }
                    queryBuilder.Append("mod_by_usr_cd, mod_dttm , data_typ_cd) VALUES (");
                    int i = 1;
                    foreach (var pair in Temp)
                    {
                        dbParamters.Add($"@pairvalue{i}", pair.value.ToString());
                        queryBuilder.Append($"@pairvalue{i}, ");
                        i++;
                    }
                    queryBuilder.Append($"@mod_by_usr_cd, getdate() , @data_typ_cd);");
                    query += queryBuilder.ToString();

                    if (input.OldImg == "YES")
                    {   //SSM090 insert query using the old image.
                        query += @"INSERT INTO wkg_trnsfr_arena_loc_dtls(loc_nam,img_srl,data_srl,sort_ordr,act_inact_ind,
                                   mod_by_usr_cd,mod_dttm)VALUES(@loc_nam,@img_srl,(SELECT MAX(data_srl) FROM wkg_lang_data),
                                   @sort_ordr,@act_inact_ind,@mod_by_usr_cd,getdate());";
                    }
                    else
                    {   //SSM090 insert query for upload new image and insert into wkg_trnsfr_arena_loc_dtls
                        query += @"INSERT INTO wkg_img_dtls(img_nam,img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                   VALUES(@img_nam,@img_dir,@act_inact_ind,@mod_by_usr_cd,getdate());

                                   INSERT INTO wkg_trnsfr_arena_loc_dtls(loc_nam,img_srl,data_srl,sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                   VALUES(@loc_nam,(SELECT MAX(img_srl) FROM wkg_img_dtls),(SELECT MAX(data_srl) FROM wkg_lang_data),@sort_ordr,
                                   @act_inact_ind,@mod_by_usr_cd,getdate());";
                    }

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM090SaveDataAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM090SaveDataAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

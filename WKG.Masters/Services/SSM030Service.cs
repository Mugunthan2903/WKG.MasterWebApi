using Microsoft.AspNetCore.Http;
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

namespace WKG.Masters.Services
{
    public class SSM030Service : WKLServiceManger, ISSM030Service
    {
        #region Constructor
        public SSM030Service( IServiceProvider serviceProvider, ILogger<SSM030Service> logger ) : base(serviceProvider, logger) { }
        #endregion

        #region Private Methods
        #endregion

        #region Public Methods SSM030
        public async Task<SSM030OnloadObject> SearchData030( SessionInfo sessionInfo, SSM030SearchFields input )
        {
            var output = new SSM030OnloadObject();
            try
            {
                List<SSM030TableFields> tbl1 = null;
                var dbParameters = new DBParameters();
                dbParameters.Add("@ltd_evnt_nam", $"%{input.ltd_evnt_nam?.Trim()}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);
                dbParameters.Add("@ltd_prod_aval", input.ltd_prod_aval);
                dbParameters.Add("@supp_map_id", StaticData.SupplierMapId.LondonTheatreDirect);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string sortstring = "";
                if (input.sortType != null)
                {
                    sortstring += $"ltd_evnt_nam {(input.sortType ?? false ? "ASC" : "DESC")}";
                }
                if(input.stdtsortType != null)
                {
                    sortstring += $"{(input.sortType != null?",":"")}start_dt {(input.stdtsortType ?? false ? "ASC" : "DESC")}";
                }
                if (input.endtsortType != null)
                {
                    sortstring += $"{(input.stdtsortType != null || input.sortType != null ? ",":"")}end_dt {(input.endtsortType ?? false ? "ASC" : "DESC")}";
                }
                if(input.sortType == null && input.stdtsortType == null && input.endtsortType == null)
                {
                    sortstring += $"start_dt ASC";
                }
                // SSM030 search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring}) AS cnt, pdm.ltd_prod_id,ISNULL(lang.prod_nam,pdm.ltd_evnt_nam) ltd_evnt_nam,
                                   pdm.act_inact_ind,pdm.ltd_prod_aval,etm.evnt_typ_nam,
                                   REPLACE(CONVERT(VARCHAR,pdm.start_dt,106),' ','-')+' '+CONVERT(VARCHAR(5),pdm.start_dt,108) as start_dt,
                                   REPLACE(CONVERT(VARCHAR,pdm.end_dt,106),' ','-')+' '+CONVERT(VARCHAR(5),pdm.end_dt,108) as end_dt,COUNT(*) OVER () AS total_count 
                                   FROM wkg_ltd_prod_dtl pdm Inner Join wkg_ltd_evnt_typ_mast etm on etm.evnt_typ_id = pdm.evnt_typ_id 
                                   left outer join wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=pdm.ltd_prod_id 
                                   AND lang.supp_map_id=@supp_map_id AND lang.lang_cd='en-gb'WHERE pdm.act_inact_ind = @act_inact_ind And pdm.ltd_evnt_nam LIKE @ltd_evnt_nam And pdm.ltd_prod_aval = @ltd_prod_aval) AS temp 
                                   WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                   SELECT supp_map_id, supp_ftp_img_dir FROM wkg_supp_config WHERE supp_map_id = @supp_map_id;";
                int totalrecords = 0;
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM030TableFields>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM030TableFields obj1 = new SSM030TableFields();
                        totalrecords = r.GetValue<int>("total_count");
                        obj1.ltd_prod_id = r.GetValue<string>("ltd_prod_id");
                        obj1.start_dt = r.GetValue<string>("start_dt");
                        obj1.end_dt = r.GetValue<string>("end_dt");
                        obj1.ltd_evnt_nam = r.GetValue<string>("ltd_evnt_nam");
                        obj1.evnt_typ_nam = r.GetValue<string>("evnt_typ_nam");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.ltd_prod_aval = r.GetValue<bool>("ltd_prod_aval");

                        tbl1.Add(obj1);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.SupplierMapID = r.GetValue<string>("supp_map_id");
                        output.ImageDirectory = r.GetValue<string>("supp_ftp_img_dir");
                    }
                }
                output.Items = tbl1;
                output.TotalRecords = totalrecords;
                output.CurrentPage = totalrecords == 0 ? 1 : input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsync030( SessionInfo sessionInfo, SSM030TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                var Loopdata = input.gridItems;
                var valuesBuilder = new StringBuilder();

                string Imagequery = "";
                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@ltd_prod_id{i}", item.ltd_prod_id.ToString());
                    if (item.act_inact_ind.ToString().ToUpper() == "ACTIVE")
                    {
                        // update date for changed products in wkg_supp_img_dtls table
                        Imagequery += @$"UPDATE wkg_supp_img_dtls set mod_dttm = GETDATE() WHERE prod_id = @ltd_prod_id{i} 
                                         AND supp_map_id = @supp_map_id AND act_inact_ind = 1;
                                         UPDATE wkg_img_dtls set mod_dttm = GETDATE() WHERE prod_id = @ltd_prod_id{i} AND 
                                         supp_map_id = @supp_map_id AND act_inact_ind = 1;";
                    }
                    dbParamters.Add($"@act_inact{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@prod_id{i}", item.ltd_prod_id.ToString());

                    valuesBuilder.Append($"(@act_inact{i}, @prod_id{i}, @mod_by_usr_cd, GETDATE()),");
                    ++i;
                }

                valuesBuilder.Length -= 1;
                string valuesClause = valuesBuilder.ToString();

                // SSM030 update query
                string query = @$"UPDATE TRGT SET act_inact_ind = SRC.act,mod_by_usr_cd = SRC.col3,mod_dttm = SRC.col4
                                  FROM wkg_ltd_prod_dtl AS TRGT
                                  INNER JOIN (VALUES {valuesClause}) AS SRC(act, col1, col3, col4) ON SRC.col1 = TRGT.ltd_prod_id;";
                query += Imagequery;
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
                                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
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

        #region Public Methods SSM031
        public async Task<PageInfo<SSM031TableFields>> SearchData031( SessionInfo sessionInfo, SSM031SearchFields input )
        {
            var output = new PageInfo<SSM031TableFields>();
            try 
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@evnt_typ_nam", $"%{input.evnt_typ_nam?.Trim()}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParameters.Add("@evnt_typ_aval", input.evnt_typ_aval ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                // SSM031 onload and search query
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY evnt_typ_nam {(input.sortType ? "ASC" : "DESC")}) AS cnt, 
                                  etm.evnt_typ_id,etm.evnt_typ_nam,etm.evnt_typ_aval,etm.sort_ordr,etm.act_inact_ind,
                                  etm.mod_dttm, COUNT(*) OVER () AS total_count FROM wkg_ltd_evnt_typ_mast etm WHERE 
                                  etm.act_inact_ind=@act_inact_ind and etm.evnt_typ_aval = @evnt_typ_aval and 
                                  etm.evnt_typ_nam LIKE @evnt_typ_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM031TableFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM031TableFields
                    {
                        evnt_typ_id = r.GetValue<string>("evnt_typ_id"),
                        evnt_typ_nam = r.GetValue<string>("evnt_typ_nam"),
                        evnt_typ_aval = r.GetValue<bool>("evnt_typ_aval"),
                        sort_ordr = r.GetValue<short>("sort_ordr") == 0 ? "" : $"{r.GetValue<short>("sort_ordr")}",
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_dttm = r.GetValue<string>("mod_dttm")
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
        public async Task<SSM031TableFields> LoadSelectedData031( SessionInfo sessionInfo, SSM031TableFields input )
        {
            var output = new SSM031TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@evnt_typ_id", input.evnt_typ_id);
                // SSM031 retrieves record from wkg_ltd_evnt_typ_mast for specified evnt_typ_id
                string query = @"SELECT etm.evnt_typ_id,etm.evnt_typ_nam,etm.evnt_shrt_nam,etm.act_inact_ind,etm.evnt_typ_aval,etm.sort_ordr,
                                  REPLACE(CONVERT(VARCHAR,etm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),etm.mod_dttm,108) AS 
                                  mod_dttm,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from wkg_ltd_evnt_typ_mast etm 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = etm.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  WHERE evnt_typ_id = @evnt_typ_id";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM031TableFields>(query, dbParameters, r => {
                    return new SSM031TableFields
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
        public async Task<OperationStatus> SaveDataAsync031( SessionInfo sessionInfo, SSM031TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@evnt_typ_id", input.evnt_typ_id);
                dbParamters.Add("@evnt_shrt_nam", input.evnt_shrt_nam);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                // SSM031 update query
                string query = @"UPDATE wkg_ltd_evnt_typ_mast SET evnt_shrt_nam = @evnt_shrt_nam,act_inact_ind = @act_inact_ind, 
                                  sort_ordr = @sort_ordr, mod_dttm = GETDATE(),mod_by_usr_cd = @mod_by_usr_cd 
                                  where evnt_typ_id=@evnt_typ_id;";

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

        #region Public Methods SSM032
        public async Task<PageInfo<SSM032TableFields>> SearchData032( SessionInfo sessionInfo, SSM032SearchFields input )
        {
            var output = new PageInfo<SSM032TableFields>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@dlvry_typ_nam", $"%{input.dlvry_typ_nam?.Trim()}%");
                dbParameters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParameters.Add("@dlvry_typ_aval", input.dlvry_typ_aval ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);

                // SSM032 onload and search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY dlvry_typ_nam {(input.sortType ? "ASC" : "DESC")}) AS cnt, 
                                  dtm.dlvry_typ_id,dtm.dlvry_typ_nam,dtm.dlvry_typ_aval,dtm.act_inact_ind, 
                                  COUNT(*) OVER () AS total_count FROM wkg_ltd_dlvry_typ_mast dtm WHERE dtm.act_inact_ind=@act_inact_ind and 
                                  dtm.dlvry_typ_aval = @dlvry_typ_aval and dtm.dlvry_typ_nam LIKE @dlvry_typ_nam) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM032TableFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM032TableFields
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
        public async Task<SSM032TableFields> LoadSelectedData032( SessionInfo sessionInfo, SSM032TableFields input )
        {
            var output = new SSM032TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@dlvry_typ_id", input.dlvry_typ_id);
                // SSM032 retrieves record from wkg_ltd_dlvry_typ_mast table for the specified dlvry_typ_id
                string query = @"SELECT dtm.dlvry_typ_id,dtm.dlvry_typ_nam,dtm.dlvry_shrt_nam,dlvry_price,dtm.dlvry_wkg_markup,dtm.act_inact_ind,
                                  dtm.dlvry_typ_aval,
                                  REPLACE(CONVERT(VARCHAR,dtm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),dtm.mod_dttm,108) AS mod_dttm,
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from 
                                  wkg_ltd_dlvry_typ_mast dtm 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = dtm.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  WHERE dlvry_typ_id = @dlvry_typ_id;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM032TableFields>(query, dbParameters, r => {
                    return new SSM032TableFields
                    {
                        dlvry_typ_id = r.GetValue<string>("dlvry_typ_id"),
                        dlvry_typ_nam = r.GetValue<string>("dlvry_typ_nam"),
                        dlvry_shrt_nam = r.GetValue<string>("dlvry_shrt_nam"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        dlvry_price = r.GetValue<string>("dlvry_price"),
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
        public async Task<OperationStatus> SaveDataAsync032( SessionInfo sessionInfo, SSM032TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@dlvry_typ_id", input.dlvry_typ_id);
                dbParamters.Add("@dlvry_shrt_nam", input.dlvry_shrt_nam);
                dbParamters.Add("@dlvry_wkg_markup", input.dlvry_wkg_markup);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                // SSM032 update query
                string query = @"UPDATE wkg_ltd_dlvry_typ_mast SET dlvry_shrt_nam = @dlvry_shrt_nam,dlvry_wkg_markup = @dlvry_wkg_markup , 
                                  act_inact_ind = @act_inact_ind, mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() where 
                                  dlvry_typ_id = @dlvry_typ_id;";

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

        #region Public Methods SSM033
        public async Task<SSM033TableFields> LoadInitData033( SessionInfo sessionInfo, SSM033TableFields input )
        {
            var output = new SSM033TableFields();
            output.prod_exist = false;
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                dbParameters.Add("@img_dir", input.img_dir);
                // SSM033 retrieves if data exist in wkg_supp_prod_ovrd for specified prod_id
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY prod_nam) AS cnt,gxl.lang_srl, gxl.prod_id, gxl.lang_cd,pal.lang_nam, gxl.prod_nam, gxl.mod_by_usr_cd, gxl.mod_dttm,
                                  COUNT(*) OVER () AS total_count 
                                  FROM wkg_supp_prod_grp_excptn_lang gxl Inner Join wkg_pos_accptd_lang pal on pal.act_inact_ind = 1 and pal.lang_cd = gxl.lang_cd
                                  WHERE gxl.prod_id = @prod_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT (SELECT ftp_supp_img_url FROM wkg_cntrl_param_mast) + LOWER(img.img_dir) + '/' + img.img_nam AS 'img_url', 
                                  img.img_nam, dtl.ltd_evnt_nam,ovrd.ovrd_srl,ovrd.prod_id,ovrd.prod_featrd,ovrd.latitude,
                                  ovrd.longitude,ovrd.sort_ordr,ovrd.mod_by_usr_cd,ovrd.mod_dttm,ovrd.img_srl,ovrd.bkng_fee,
                                  ovrd.bkng_fee_typ FROM wkg_supp_prod_ovrd ovrd INNER JOIN wkg_ltd_prod_dtl dtl ON 
                                  ovrd.prod_id = dtl.ltd_prod_id left outer join wkg_img_dtls img ON img.img_srl=ovrd.img_srl 
                                  WHERE ovrd.prod_id=@prod_id;

                                  SELECT prod_id,supp_map_id,img_srl,img_nam,img_path FROM wkg_supp_img_dtls where prod_id = @prod_id And supp_map_id = @supp_map_id;

                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    output.table2 = new PageInfo<SSM033TableFields>();
                    output.table2.Items = new List<SSM033TableFields>();
                    int tolR = 0;
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        tolR = r.GetValue<int>("total_count");
                        var temp = new SSM033TableFields();
                        temp.lang_srl = r.GetValue<int>("lang_srl");
                        temp.lang_nam = r.GetValue<string>("lang_nam");
                        temp.lang_cd = r.GetValue<string>("lang_cd");
                        temp.prod_nam = r.GetValue<string>("prod_nam");
                        output.table2.Items.Add(temp);
                    }
                    output.table2.SetPages(tolR, input.PageSize);
                    output.table2.CurrentPage = tolR == 0 ? 1 : input.PageNo;
                    var ftpService = GetService<IFileManagerService>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        var temp = new SSM033TableFields();
                        temp.ovrd_srl = r.GetValue<string>("ovrd_srl");
                        temp.prod_id = r.GetValue<string>("prod_id");
                        temp.prod_featrd = r.GetValue<bool>("prod_featrd");
                        temp.prod_nam = r.GetValue<string>("ltd_evnt_nam");
                        temp.latitude = r.GetValue<string>("latitude");
                        temp.longitude = r.GetValue<string>("longitude");
                        temp.sort_ordr = r.GetValue<short>("sort_ordr");
                        temp.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        temp.mod_dttm = r.GetValue<string>("mod_dttm");
                        temp.img_srl = r.GetValue<string>("img_srl");
                        temp.img_nam = r.GetValue<string>("img_nam");
                        temp.img_url = !string.IsNullOrEmpty(temp.img_nam) ? await ftpService.ReadFileAsync(r.GetValue<string>("img_url"), temp.img_nam) : "";
                        temp.bkng_fee = r.GetValue<string>("bkng_fee");
                        temp.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");
                        output.data = temp;
                    }
                    var Imgdata = new SSM033ImageDetails();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM033ImageDetails Img = new SSM033ImageDetails();
                        Img.img_srl = r.GetValue<string>("img_srl");
                        Img.img_nam = r.GetValue<string>("img_nam");
                        Img.img_path = r.GetValue<string>("img_path");
                        Imgdata = Img;
                    }
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");

                    }
                    output.image = Imgdata;
                    if (output.data != null)
                    {
                        output.prod_exist = true;
                    }
                }
                output.radios = StaticData.Common.BookingFeeType;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsyncSSM033( SessionInfo sessionInfo, SSM033TableFields input, List<IFormFile> files )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@prod_featrd", input.prod_featrd);
                dbParamters.Add("@latitude", input.latitude !=""? input.latitude:null);
                dbParamters.Add("@longitude", input.longitude != "" ? input.longitude : null);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@bkng_fee", input.bkng_fee);
                dbParamters.Add("@bkng_fee_typ", input.bkng_fee_typ);
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@img_srl", input.img_srl != "" ? input.img_srl : null);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@img_dir", input.img_dir);
                string query = "";
                if (input.ImageChanged == "YES" && input.OldImg == "NO" && input.img_nam != "")
                {
                    if (files != null)
                    {
                        var tourser = this.GetService<IFileManagerService>();
                        var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });

                    }
                }
                // SSM033 update and insert
                if (input.mode == "INSERT")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {
                            query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,prod_featrd,latitude,longitude,
                                       mod_by_usr_cd,mod_dttm,img_srl,sort_ordr,bkng_fee,bkng_fee_typ)VALUES 
                                       (@prod_id,@supp_map_id,@prod_featrd,@latitude,@longitude,@mod_by_usr_cd,GETDATE(),
                                       @img_srl,@sort_ordr,@bkng_fee,@bkng_fee_typ)";
                        }
                        else
                        {
                            query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                       mod_by_usr_cd,mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,
                                       @mod_by_usr_cd,getdate());
                                       INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,prod_featrd,latitude,longitude,
                                       mod_by_usr_cd,mod_dttm,img_srl,sort_ordr,bkng_fee,bkng_fee_typ)VALUES 
                                       (@prod_id,@supp_map_id,@prod_featrd,@latitude,@longitude,@mod_by_usr_cd,GETDATE(),
                                       (SELECT MAX(img_srl) FROM wkg_img_dtls),@sort_ordr,@bkng_fee,@bkng_fee_typ)";
                        }
                            
                    }
                    else
                    {
                        query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,prod_featrd,latitude,longitude,
                                   mod_by_usr_cd,mod_dttm,img_srl,sort_ordr,bkng_fee,bkng_fee_typ)VALUES 
                                   (@prod_id,@supp_map_id,@prod_featrd,@latitude,@longitude,@mod_by_usr_cd,GETDATE(),null,
                                   @sort_ordr,@bkng_fee,@bkng_fee_typ)";
                    }


                }
                else if (input.mode == "UPDATE")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {
                            query = @"UPDATE wkg_supp_prod_ovrd  SET prod_featrd=@prod_featrd,latitude=@latitude,
                                       longitude=@longitude,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),img_srl=@img_srl,
                                       sort_ordr=@sort_ordr,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ WHERE 
                                       ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";

                        }
                        else
                        {
                            if (input.img_nam == "")
                            {
                                query = @"UPDATE wkg_supp_prod_ovrd  SET prod_featrd=@prod_featrd,latitude=@latitude,
                                           longitude=@longitude,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                           img_srl=null,sort_ordr=@sort_ordr,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ 
                                           WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                            else
                            {
                                query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                           mod_by_usr_cd,mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,
                                           @mod_by_usr_cd,getdate());
                                           UPDATE wkg_supp_prod_ovrd  SET prod_featrd=@prod_featrd,latitude=@latitude,
                                           longitude=@longitude,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                           img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),sort_ordr=@sort_ordr,
                                           bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ WHERE ovrd_srl = @ovrd_srl AND 
                                           prod_id = @prod_id;";
                            }
                        }
                    }
                    else
                    {
                        query = @"UPDATE wkg_supp_prod_ovrd  SET prod_featrd=@prod_featrd,latitude=@latitude,
                                   longitude=@longitude,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),sort_ordr=@sort_ordr,
                                   bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ WHERE ovrd_srl = @ovrd_srl AND 
                                   prod_id = @prod_id;";
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

        #region Public Methods SSM034
        public async Task<PageInfo<SSM034TableFields>> SearchData034( SessionInfo sessionInfo, SSM034TableFields input )
        {
            var output = new PageInfo<SSM034TableFields>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@pos_grp_id", input.pos_grp_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);

                // SSM034 search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam {(input.sortType ? "ASC" : "DESC")}) AS cnt, gpm.pos_grp_nam,gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,
                                  gxc.act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on 
                                  gpm.pos_grp_id = gxc.pos_grp_id WHERE {(input.pos_grp_id==""?"": "gxc.pos_grp_id = @pos_grp_id AND ")}gxc.act_inact_ind=@act_inact_ind AND gxc.supp_map_id = @supp_map_id AND 
                                  gxc.act_inact_ind = @act_inact_ind AND prod_id = @prod_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM034TableFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM034TableFields
                    {
                        excptn_srl = r.GetValue<string>("excptn_srl"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        wkg_markup = r.GetValue<string>("wkg_markup"),
                        wkg_markup_typ = r.GetValue<string>("wkg_markup_typ"),
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
        public async Task<SSM034TableFields> LoadInitData034( SessionInfo sessionInfo, SSM034TableFields input )
        {
            var output = new SSM034TableFields();
            output.prod_exist = false;
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                output.comboList = new List<SSM034TableFields>();
                output.grid = new PageInfo<SSM034TableFields>();
                output.grid.Items = new List<SSM034TableFields>();
                int tolR = 0;
                // SSM034 onload for populating tabel and select box list
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam) AS cnt, gpm.pos_grp_nam,gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,
                                  gxc.act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on 
                                  gpm.pos_grp_id = gxc.pos_grp_id WHERE gxc.act_inact_ind = 1 AND gxc.prod_id = @prod_id AND gxc.supp_map_id = @supp_map_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;
                                  select pos_grp_id,pos_grp_nam from wkg_pos_grp_mast where act_inact_ind = 1;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        tolR = r.GetValue<int>("total_count");
                        SSM034TableFields obj = new SSM034TableFields();
                        obj.excptn_srl = r.GetValue<string>("excptn_srl");
                        obj.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj.wkg_markup = r.GetValue<string>("wkg_markup");
                        obj.wkg_markup_typ = r.GetValue<string>("wkg_markup_typ");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        output.grid.Items.Add(obj);
                    }
                    output.grid.SetPages(tolR, input.PageSize);
                    output.grid.CurrentPage = tolR == 0 ? 1 : input.PageNo;
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        var temp = new SSM034TableFields
                        {
                            pos_grp_id = r.GetValue<string>("pos_grp_id"),
                            pos_grp_nam = r.GetValue<string>("pos_grp_nam")
                        };
                        output.comboList.Add(temp);
                    }
                }
                output.radios = StaticData.Common.BookingFeeType;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SSM034TableFields> LoadSelectedData034( SessionInfo sessionInfo, SSM034TableFields input )
        {
            var output = new SSM034TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@excptn_srl", input.excptn_srl);
                // SSM034 retrieves record from wkg_supp_prod_grp_excptn table for specified excptn_srl
                string query = @"SELECT gxc.excptn_srl,gxc.pos_grp_id,gxc.wkg_markup,gxc.wkg_markup_typ,gxc.sort_ordr,gxc.act_inact_ind,
                                  REPLACE(CONVERT(VARCHAR,gxc.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),gxc.mod_dttm,108) AS mod_dttm,
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from 
                                  wkg_supp_prod_grp_excptn gxc 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = gxc.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  WHERE excptn_srl = @excptn_srl;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM034TableFields>(query, dbParameters, r => {
                    return new SSM034TableFields
                    {
                        excptn_srl = r.GetValue<string>("excptn_srl"),
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        wkg_markup = r.GetValue<string>("wkg_markup"),
                        wkg_markup_typ = r.GetValue<string>("wkg_markup_typ"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
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
        public async Task<OperationStatus> SaveDataAsyncSSM034( SessionInfo sessionInfo, SSM034TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@excptn_srl", input.excptn_srl);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@wkg_markup", input.wkg_markup);
                dbParamters.Add("@wkg_markup_typ", input.wkg_markup_typ);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.mode == "UPDATE")
                {
                    // SSM034 update
                    query = @"UPDATE wkg_supp_prod_grp_excptn
                               SET pos_grp_id = @pos_grp_id, wkg_markup = @wkg_markup, wkg_markup_typ = @wkg_markup_typ,act_inact_ind = @act_inact_ind,
                               sort_ordr = @sort_ordr,
                               mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE()
                               WHERE excptn_srl = @excptn_srl;";
                }
                else
                {
                    // SSM034 insert
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn (prod_id, supp_map_id, pos_grp_id, wkg_markup, wkg_markup_typ, sort_ordr, act_inact_ind, mod_by_usr_cd, mod_dttm)
                               VALUES (@prod_id, @supp_map_id, @pos_grp_id, @wkg_markup, @wkg_markup_typ, @sort_ordr, @act_inact_ind, @mod_by_usr_cd, GETDATE());";
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
        public async Task<SSM034TableFields> SSM034BlurAsync( SessionInfo sessionInfo, SSM034TableFields input )
        {
            var output = new SSM034TableFields();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_id", input.prod_id);
                // SSM034 checks if the pos_grp_id exist for specified supp_map_id and prod_id in wkg_supp_prod_grp_excptn table
                string query = @"select excptn_srl from wkg_supp_prod_grp_excptn where pos_grp_id = @pos_grp_id AND 
                                  prod_id = @prod_id AND supp_map_id = @supp_map_id;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM034TableFields>(query, dbParamters, r =>
                {
                    return new SSM034TableFields
                    {
                        excptn_srl = r.GetValue<string>("excptn_srl"),
                    };
                });
                if(output != null)
                {
                    output.Isavailable = true;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;

        }
        #endregion

        #region Public Methods SSM036
        public async Task<SSM033TableFields> LoadInitData036( SessionInfo sessionInfo, SSM033TableFields input )
        {
            var output = new SSM033TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@lang_cd", input.lang_cd);
                output.data = null;
                output.comboList = new List<SSM033TableFields>();
                // SSM036 onload
                string query = $@"SELECT lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';
                                  SELECT gxl.lang_srl,gxl.lang_cd,gxl.prod_nam,gxl.prod_id,REPLACE(CONVERT(VARCHAR,gxl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),gxl.mod_dttm,108) AS 
                                  mod_dttm_final,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd_final from wkg_supp_prod_grp_excptn_lang gxl
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = gxl.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  WHERE prod_id = @prod_id And lang_cd = @lang_cd;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        var temp = new SSM033TableFields
                        {
                            lang_cd = r.GetValue<string>("lang_cd"),
                            lang_nam = r.GetValue<string>("lang_nam")
                        };
                        output.comboList.Add(temp);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.data = new SSM033TableFields();
                        output.data.lang_srl = r.GetValue<int>("lang_srl");
                        output.data.lang_cd = r.GetValue<string>("lang_cd");
                        output.data.prod_nam = r.GetValue<string>("prod_nam");
                        output.data.prod_id = r.GetValue<string>("prod_id");
                        output.data.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd_final");
                        output.data.mod_dttm = r.GetValue<string>("mod_dttm_final");
                    }
                }
                if (output.data != null)
                {
                    output.prod_exist = true;
                }

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsyncSSM036( SessionInfo sessionInfo, SSM033TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_srl", input.lang_srl);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@prod_nam", input.prod_nam);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.mode == "UPDATE")
                {
                    // SSM036 update
                    query = $"UPDATE wkg_supp_prod_grp_excptn_lang SET prod_nam = @prod_nam,lang_cd = @lang_cd WHERE lang_srl = @lang_srl;";
                }
                else
                {
                    // SSM036 insert
                    query = $@"INSERT INTO wkg_supp_prod_grp_excptn_lang (prod_id, supp_map_id, lang_cd, prod_nam, mod_by_usr_cd, mod_dttm)
                               VALUES (@prod_id, @supp_map_id, @lang_cd, @prod_nam, @mod_by_usr_cd, GETDATE());";
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
        public async Task<SSM033TableFields> ProdLangExistSSM036( SessionInfo sessionInfo, SSM033TableFields input )
        {
            var output = new SSM033TableFields();
            try
            {
                // SSM036 checks if the specified product exist for the selected language code
                output.prod_exist = false;
                var dbParameters = new DBParameters();
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@lang_cd", input.lang_cd);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                string query = @$"select gxl.lang_srl,gxl.prod_id,gxl.supp_map_id,gxl.lang_cd,gxl.prod_nam,REPLACE(CONVERT(VARCHAR,gxl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),gxl.mod_dttm,108) AS 
                                  mod_dttm_final,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd_final from wkg_supp_prod_grp_excptn_lang gxl
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = gxl.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  where prod_id = @prod_id and lang_cd = @lang_cd and supp_map_id = @supp_map_id;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM033TableFields>(query, dbParameters, r => {
                    return new SSM033TableFields
                    {
                        lang_srl = r.GetValue<int>("lang_srl"),
                        prod_id = r.GetValue<string>("prod_id"),
                        supp_map_id = r.GetValue<string>("supp_map_id"),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        prod_nam = r.GetValue<string>("prod_nam"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd_final"),
                        mod_dttm = r.GetValue<string>("mod_dttm_final")
                    };
                });
                if(output != null)
                {
                    output.prod_exist = true;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        #endregion

        public async Task<OperationStatus> RemoveImage( SessionInfo sessionInfo, SSM033TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_srl", input.img_srl);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                dbParamters.Add("@prod_id", input.prod_id);

                string query = "";

                //if (input.Savedata == "UPDATE")
                //{

                query = @"UPDATE wkg_img_dtls SET act_inact_ind=0 WHERE img_srl= @img_srl;
                           UPDATE wkg_supp_prod_ovrd  SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),img_srl=null 
                           WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";

                // }

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
    }
}

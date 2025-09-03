using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
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
    internal class SSM100Service : WKLServiceManger, ISSM100Service
    {
        #region Constructor

        public SSM100Service(IServiceProvider serviceProvider, ILogger<SSM100Service> logger)
            : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM100
        public async Task<SSM100Object> SSM100GetProductOnload(SessionInfo sessionInfo, SSM100Object input)
        {
            var output = new SSM100Object();
            try
            {
                List<SSM100SupplierList> tbl1 = null;
                List<SSM101CityObject> tbl2 = null;
                var dbParamters = new DBParameters();

                string query = @$"SELECT cng.supp_map_id,supp.supp_nam FROM  wkg_supp_config cng 
                                  INNER join rps_supp_mast supp ON supp.supp_map_id=cng.supp_map_id
                                  WHERE cng.supp_map_id in('BG','GT2','TB');

                                  SELECT vntrt_city_cd,vntrt_city_nam,supp_map_id FROM wkg_vntrt_city WHERE act_inact_ind = 1;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM100SupplierList>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM100SupplierList obj1 = new SSM100SupplierList();
                        obj1.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj1.supp_nam = r.GetValue<string>("supp_nam");

                        tbl1.Add(obj1);

                    }
                    tbl2 = new List<SSM101CityObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM101CityObject obj2 = new SSM101CityObject();
                        obj2.vntrt_city_cd = r.GetValue<string>("vntrt_city_cd");
                        obj2.vntrt_city_nam = r.GetValue<string>("vntrt_city_nam");
                        obj2.supp_map_id = r.GetValue<string>("supp_map_id");

                        tbl2.Add(obj2);
                    }
                }
                output.Supplier_List = tbl1;
                output.City_List = tbl2;
                output.ToothBus = StaticData.SupplierMapId.ToothBus;

            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<SSM100Object> SSM100GetProductSearch(SessionInfo sessionInfo, SSM100Object input)
        {
            var output = new SSM100Object();
            try
            {
                List<SSM100Object> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@vntrt_prod_nam", $"%{input.vntrt_prod_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@vntrt_prod_aval", input.vntrt_prod_aval);
                dbParamters.Add("@vntrt_prod_cty_cd", input.vntrt_prod_cty_cd);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"vpd.vntrt_prod_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }
                if (input.SortTypCity != null)
                {
                    sortstring += $"{(input.SortTyp != null ? "," : "")}vcity.vntrt_city_nam {(input.SortTypCity ?? false ? "ASC" : "DESC")}";
                }
                if (input.SortTyp == null && input.SortTypCity == null)
                {
                    sortstring += $"vpd.vntrt_prod_nam ASC";
                }

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring}) AS cnt,vpd.vntrt_prod_id,
                                ISNULL(exlang.prod_nam,vpd.vntrt_prod_nam) vntrt_prod_nam,vpd.vntrt_prod_cty_cd,vpd.act_inact_ind,
                                vpd.vntrt_prod_aval,vcity.vntrt_city_nam,";
                if (input.supp_map_id == StaticData.SupplierMapId.ToothBus)
                {
                    query += $@"(SELECT DISTINCT STRING_AGG(lang.en_GB, ', ') FROM wkg_supp_prod_ovrd ovrd
                                INNER JOIN wkg_tour_ctgry tctgry ON tctgry.tour_ctgry_id IN(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(ovrd.tui_ctgry_ids,''), ','))
                                INNER JOIN wkg_lang_data lang ON lang.data_srl = tctgry.lang_data_srl
                                WHERE ovrd.supp_map_id =@supp_map_id AND ovrd.prod_id=vpd.vntrt_prod_id)  AS tour_ctgry_nam,";
                }
                else
                {
                    query += $@"ISNULL((SELECT DISTINCT STRING_AGG(lang.en_GB, ', ') FROM wkg_supp_prod_ovrd ovrd
                                INNER JOIN wkg_tour_ctgry tctgry ON tctgry.tour_ctgry_id IN(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(ovrd.tui_ctgry_ids,''), ','))
                                INNER JOIN wkg_lang_data lang ON lang.data_srl = tctgry.lang_data_srl
                                WHERE ovrd.supp_map_id =@supp_map_id AND ovrd.prod_id=vpd.vntrt_prod_id),(SELECT DISTINCT STRING_AGG(lang.en_GB, ', ') FROM wkg_vntrt_prod_ctgry pctrgy
                                INNER JOIN wkg_vntrt_ctgry ctgry ON ctgry.vntrt_ctgry_id=pctrgy.prod_ctgry_id
                                INNER JOIN wkg_tour_ctgry tctgry ON tctgry.tour_ctgry_id IN(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(ctgry.wkg_ctgry_ids,''), ','))
                                INNER JOIN wkg_lang_data lang ON lang.data_srl = tctgry.lang_data_srl
                                WHERE pctrgy.vntrt_ctgry_aval=1 AND pctrgy.supp_map_id =@supp_map_id AND pctrgy.vntrt_prod_id=vpd.vntrt_prod_id))  AS tour_ctgry_nam,";
                }
                query += $@" STUFF((SELECT ', ' + ISNULL(prdcat2.prod_ctgry_nam,'')FROM wkg_vntrt_prod_ctgry as prdcat2
                                INNER JOIN wkg_vntrt_prod_dtl as innervpd ON innervpd.vntrt_prod_id = prdcat2.vntrt_prod_id
                                WHERE prdcat2.supp_map_id =@supp_map_id AND prdcat2.vntrt_prod_id = vpd.vntrt_prod_id FOR XML PATH('')), 1, 2, '')as vntrt_ctgry_nam,
                                COUNT(*) OVER () AS total_count FROM wkg_vntrt_prod_dtl AS vpd
                                LEFT OUTER JOIN wkg_vntrt_city AS vcity ON vpd.vntrt_prod_cty_cd = vcity.vntrt_city_cd AND vcity.supp_map_id = @supp_map_id
                                LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang as exlang ON exlang.prod_id = vpd.vntrt_prod_id AND exlang.supp_map_id = @supp_map_id AND exlang.lang_cd='en-GB'
                                WHERE vpd.supp_map_id =@supp_map_id AND vpd.act_inact_ind = @act_inact_ind AND vpd.vntrt_prod_aval = @vntrt_prod_aval
                                {(input.vntrt_prod_cty_cd != null ? "AND vpd.vntrt_prod_cty_cd=@vntrt_prod_cty_cd" : "")}
                                AND vpd.vntrt_prod_nam LIKE @vntrt_prod_nam ) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                 SELECT supp_ftp_img_dir FROM wkg_supp_config WHERE supp_map_id = @supp_map_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM100Object>();
                    foreach (DataRow DR1 in DS.Tables[0].Rows)
                    {
                        SSM100Object obj1 = new SSM100Object();
                        totalrecords = DR1.GetValue<int>("total_count");
                        obj1.vntrt_prod_id = DR1.GetValue<string>("vntrt_prod_id");
                        obj1.vntrt_prod_nam = DR1.GetValue<string>("vntrt_prod_nam");
                        obj1.vntrt_prod_cty_cd = DR1.GetValue<string>("vntrt_prod_cty_cd");
                        obj1.vntrt_city_nam = DR1.GetValue<string>("vntrt_city_nam");
                        obj1.vntrt_ctgry_nam = DR1.GetValue<string>("vntrt_ctgry_nam");
                        obj1.tour_ctgry_nam = DR1.GetValue<string>("tour_ctgry_nam");
                        obj1.vntrt_prod_aval = DR1.GetValue<bool>("vntrt_prod_aval");
                        obj1.act_inact_ind = DR1.GetValue<bool>("act_inact_ind");
                        tbl1.Add(obj1);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.ImageDirectory = r.GetValue<string>("supp_ftp_img_dir");
                    }
                }

                output.Product_Dtls = tbl1;

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

        public async Task<OperationStatus> SSM100SaveProductGrid(SessionInfo sessionInfo, SSM100Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                string query = "";
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();

                string Imagequery = "";
                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@vntrt_prod_id{i}", item.vntrt_prod_id.ToString());
                    if (item.act_inact_ind.ToString().ToUpper() == "ACTIVE")
                    {
                        Imagequery += @$"UPDATE wkg_supp_img_dtls set mod_dttm = GETDATE() WHERE 
                                         prod_id = @vntrt_prod_id{i} AND supp_map_id = @supp_map_id AND act_inact_ind = 1;
                                         UPDATE wkg_img_dtls set mod_dttm = GETDATE() WHERE prod_id = @vntrt_prod_id{i} 
                                         AND supp_map_id = @supp_map_id AND act_inact_ind = 1;";
                    }

                    valuesBuilder.Append($"(@act_inact_ind{i},@vntrt_prod_id{i}),");
                    ++i;
                }
                valuesBuilder.Length -= 1;
                string valuesClause = valuesBuilder.ToString();
                query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd 
                           FROM wkg_vntrt_prod_dtl AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) ON 
                           SRC.col1 = TRGT.vntrt_prod_id;";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM100SaveProductGrid)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM100SaveProductGrid)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM101

        public async Task<SSM101CityOnloadObject> SSM101GetCityOnload(SessionInfo sessionInfo, SSM101CityObject input)
        {
            var output = new SSM101CityOnloadObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                dbParameters.Add("@vntrt_city_nam", $"%{input.vntrt_city_nam?.Trim()}%");
                dbParameters.Add("@vntrt_city_aval", $"{input.vntrt_city_aval}");
                dbParameters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParameters.Add("@supp_map_id", $"{input.supp_map_id}");

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY vcity.vntrt_city_nam {(input.SortTyp ?? true ? "" : " DESC")}) AS cnt,
                                  vcity.vntrt_city_cd, vcity.vntrt_city_nam, vcity.vntrt_cntry_cd, vcity.act_inact_ind,citymast.City_desc AS wkg_city_nam,
                                  cntrymast.Cntry_desc AS vntrt_cntry_nam,vcity.vntrt_city_aval, COUNT(*) OVER () AS total_count FROM wkg_vntrt_city vcity
                                  INNER JOIN rps_cntry_mast cntrymast ON cntrymast.Cntry_cd= vcity.vntrt_cntry_cd 
                                  LEFT OUTER JOIN rps_city_mast citymast ON citymast.City_cd = vcity.wkg_city_cd 
                                  WHERE vntrt_city_nam LIKE @vntrt_city_nam AND vcity.vntrt_city_aval = @vntrt_city_aval And vcity.act_inact_ind =@act_inact_ind
                                  AND vcity.supp_map_id = @supp_map_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                List<SSM101CityObject> tbl1 = null;

                int totalrecords = 0;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM101CityObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM101CityObject obj1 = new SSM101CityObject();

                        obj1.vntrt_city_cd = r.GetValue<string>("vntrt_city_cd");
                        obj1.vntrt_city_nam = r.GetValue<string>("vntrt_city_nam");
                        obj1.vntrt_cntry_cd = r.GetValue<string>("vntrt_cntry_cd");
                        obj1.vntrt_cntry_nam = r.GetValue<string>("vntrt_cntry_nam");
                        obj1.vntrt_city_aval = r.GetValue<bool>("vntrt_city_aval");
                        obj1.wkg_city_nam = r.GetValue<string>("wkg_city_nam");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl1.Add(obj1);
                    }

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

        public async Task<PageInfo<SSM101CityObject>> SSM101GetCitySearch(SessionInfo sessionInfo, SSM101CityObject input)
        {
            var output = new PageInfo<SSM101CityObject>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                dbParameters.Add("@vntrt_city_nam", $"%{input.vntrt_city_nam?.Trim()}%");
                dbParameters.Add("@vntrt_city_aval", $"{input.vntrt_city_aval}");
                dbParameters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParameters.Add("@supp_map_id", $"{input.supp_map_id}");

                string query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY vcity.vntrt_city_nam {(input.SortTyp ?? true ? "" : " DESC")}) AS cnt,
                                  vcity.vntrt_city_cd, vcity.vntrt_city_nam, vcity.vntrt_cntry_cd, vcity.act_inact_ind,citymast.City_desc AS wkg_city_nam,
                                  cntrymast.Cntry_desc AS vntrt_cntry_nam,vcity.vntrt_city_aval, COUNT(*) OVER () AS total_count FROM wkg_vntrt_city vcity
                                  INNER JOIN rps_cntry_mast cntrymast ON cntrymast.Cntry_cd= vcity.vntrt_cntry_cd 
                                  LEFT OUTER JOIN rps_city_mast citymast ON citymast.City_cd = vcity.wkg_city_cd 
                                  WHERE vntrt_city_nam LIKE @vntrt_city_nam AND vcity.vntrt_city_aval = @vntrt_city_aval And vcity.act_inact_ind =@act_inact_ind
                                  AND vcity.supp_map_id = @supp_map_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int totalrecords = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM101CityObject>(query, dbParameters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM101CityObject
                    {
                        vntrt_city_cd = r.GetValue<string>("vntrt_city_cd"),
                        vntrt_city_nam = r.GetValue<string>("vntrt_city_nam"),
                        vntrt_cntry_cd = r.GetValue<string>("vntrt_cntry_cd"),
                        vntrt_cntry_nam = r.GetValue<string>("vntrt_cntry_nam"),
                        wkg_city_nam = r.GetValue<string>("wkg_city_nam"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        vntrt_city_aval = r.GetValue<bool>("vntrt_city_aval")
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

        public async Task<SSM101CityObject> SSM101GetEditCity(SessionInfo sessionInfo, SSM101CityObject input)
        {
            var output = new SSM101CityObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@vntrt_city_cd", input.vntrt_city_cd);
                dbParameters.Add("@supp_map_id", input.supp_map_id);

                string query = @"SELECT city.vntrt_city_cd,city.vntrt_city_nam,city.act_inact_ind,
                                 REPLACE(CONVERT(VARCHAR, city.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), city.mod_dttm, 108) AS mod_dttm, 
                                 emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                 (SELECT STRING_AGG((CAST(citymast.City_cd AS VARCHAR) + '/' + citymast.City_desc + ' - ' + cntry.Cntry_desc), ', ') FROM rps_city_mast citymast
                                 INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd=citymast.Cntry_cd
                                 WHERE citymast.City_cd IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(city.wkg_city_cd,''), ',')))) AS wkg_city_cd 
                                 FROM wkg_vntrt_city city INNER JOIN rps_usr_mast usr ON usr.Usr_id = city.mod_by_usr_cd 
                                 INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                 WHERE city.vntrt_city_cd = @vntrt_city_cd AND city.supp_map_id = @supp_map_id;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM101CityObject>(query, dbParameters, r =>
                {
                    return new SSM101CityObject
                    {
                        vntrt_city_cd = r.GetValue<string>("vntrt_city_cd"),
                        vntrt_city_nam = r.GetValue<string>("vntrt_city_nam"),
                        wkg_city_cd = r.GetValue<string>("wkg_city_cd"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
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


        public async Task<OperationStatus> SSM101SaveCityForm(SessionInfo sessionInfo, SSM101CityObject input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParameters = new DBParameters();

                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                dbParameters.Add("@vntrt_city_cd", input.vntrt_city_cd);
                dbParameters.Add("@wkg_city_cd", input.wkg_city_cd);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);

                string query = "";

                if (input.Mode == "FORM")
                {
                    query = @"UPDATE wkg_vntrt_city SET wkg_city_cd=@wkg_city_cd,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(), 
                              act_inact_ind = @act_inact_ind WHERE vntrt_city_cd = @vntrt_city_cd AND supp_map_id = @supp_map_id;";
                }

                using (var dbService = this.GetDBService(true))
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(query, dbParameters);
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM101SaveCityForm)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM101SaveCityForm)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM102
        public async Task<SSM102OnloadObject> SSM102GetCategoryOnload(SessionInfo sessionInfo, SSM102CategoryObject input)
        {
            var output = new SSM102OnloadObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@vntrt_ctgry_nam", $"%{input.vntrt_ctgry_nam?.Trim()}%");
                dbParameters.Add("@vntrt_ctgry_aval", input.vntrt_ctgry_aval);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY vntrt_ctgry_nam) AS cnt,
                                    vntrt_ctgry_id,vntrt_ctgry_nam,sort_ordr,act_inact_ind,vntrt_ctgry_aval,mod_by_usr_cd,mod_dttm,
                                    (SELECT STRING_AGG(lang.en_GB, ', ') FROM wkg_tour_ctgry ctgry_inner
                                    JOIN wkg_lang_data lang ON lang.data_srl = ctgry_inner.lang_data_srl
                                    WHERE ctgry_inner.tour_ctgry_id IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(vctgry.wkg_ctgry_ids,''), ','))))  AS tour_ctgry_nam,
                                    COUNT(*) OVER () AS total_count FROM wkg_vntrt_ctgry vctgry WHERE supp_map_id = @supp_map_id AND
                                    vctgry.vntrt_ctgry_nam LIKE @vntrt_ctgry_nam AND vctgry.act_inact_ind = @act_inact_ind AND 
                                    vctgry.vntrt_ctgry_aval = @vntrt_ctgry_aval) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                   SELECT ctgry.tour_ctgry_id,lang.en_GB as tour_ctgry_nam,ctgry.act_inact_ind FROM wkg_tour_ctgry ctgry INNER JOIN wkg_lang_data lang ON ctgry.lang_data_srl = lang.data_srl;";
                List<SSM102CategoryObject> tbl1 = null;
                List<SSM102TourCtgryMastObject> tbl2 = null;

                int totalrecords = 0;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM102CategoryObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM102CategoryObject obj1 = new SSM102CategoryObject();

                        obj1.vntrt_ctgry_id = r.GetValue<string>("vntrt_ctgry_id");
                        obj1.vntrt_ctgry_nam = r.GetValue<string>("vntrt_ctgry_nam");
                        obj1.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj1.vntrt_ctgry_aval = r.GetValue<bool>("vntrt_ctgry_aval");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM102TourCtgryMastObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM102TourCtgryMastObject obj2 = new SSM102TourCtgryMastObject();

                        obj2.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj2.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj2.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl2.Add(obj2);
                    }

                    output.Items = tbl1;
                    output.Tour_Ctgry_List = tbl2;
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

        public async Task<PageInfo<SSM102CategoryObject>> SSM102GetCategorySearch(SessionInfo sessionInfo, SSM102CategoryObject input)
        {
            var output = new PageInfo<SSM102CategoryObject>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@vntrt_ctgry_nam", $"%{input.vntrt_ctgry_nam?.Trim()}%");
                dbParameters.Add("@vntrt_ctgry_aval", input.vntrt_ctgry_aval);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind); ;
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ?? true ? "ORDER BY vntrt_ctgry_nam" : "ORDER BY vntrt_ctgry_nam DESC")}) AS cnt,
                                    vntrt_ctgry_id,vntrt_ctgry_nam,sort_ordr,act_inact_ind,vntrt_ctgry_aval,mod_by_usr_cd,mod_dttm,
                                    (SELECT STRING_AGG(lang.en_GB, ', ') FROM wkg_tour_ctgry ctgry_inner
                                    JOIN wkg_lang_data lang ON lang.data_srl = ctgry_inner.lang_data_srl
                                    WHERE ctgry_inner.tour_ctgry_id IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(vctgry.wkg_ctgry_ids,''), ','))))  AS tour_ctgry_nam,
                                    COUNT(*) OVER () AS total_count FROM wkg_vntrt_ctgry vctgry WHERE supp_map_id = @supp_map_id AND
                                    vctgry.vntrt_ctgry_nam LIKE @vntrt_ctgry_nam AND vctgry.act_inact_ind = @act_inact_ind AND 
                                    vctgry.vntrt_ctgry_aval = @vntrt_ctgry_aval) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM102CategoryObject>(query, dbParameters, r =>
                {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM102CategoryObject
                    {
                        vntrt_ctgry_id = r.GetValue<string>("vntrt_ctgry_id"),
                        vntrt_ctgry_nam = r.GetValue<string>("vntrt_ctgry_nam"),
                        tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam"),
                        vntrt_ctgry_aval = r.GetValue<bool>("vntrt_ctgry_aval"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind")

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

        public async Task<SSM102CategoryObject> SSM102GetEditCategory(SessionInfo sessionInfo, SSM102CategoryObject input)
        {
            var output = new SSM102CategoryObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@vntrt_ctgry_id", input.vntrt_ctgry_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);

                string query = @"SELECT ctgry.vntrt_ctgry_id,ctgry.vntrt_ctgry_nam,ctgry.act_inact_ind, ctgry.vntrt_ctgry_aval,ctgry.wkg_ctgry_ids,ctgry.sort_ordr,
                                 REPLACE(CONVERT(VARCHAR, ctgry.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), ctgry.mod_dttm, 108) AS mod_dttm, 
                                 emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_vntrt_ctgry ctgry 
                                 INNER JOIN rps_usr_mast usr ON usr.Usr_id = ctgry.mod_by_usr_cd INNER JOIN rps_emp_mast emp 
                                 ON emp.emp_cd = usr.emp_cd WHERE ctgry.vntrt_ctgry_id = @vntrt_ctgry_id AND ctgry.supp_map_id = @supp_map_id;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM102CategoryObject>(query, dbParameters, r =>
                {
                    return new SSM102CategoryObject
                    {
                        vntrt_ctgry_id = r.GetValue<string>("vntrt_ctgry_id"),
                        vntrt_ctgry_nam = r.GetValue<string>("vntrt_ctgry_nam"),
                        wkg_ctgry_ids = r.GetValue<string>("wkg_ctgry_ids"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
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

        public async Task<OperationStatus> SSM102SaveCategoryForm(SessionInfo sessionInfo, SSM102CategoryObject input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParameters = new DBParameters();

                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");

                string query = "";

                if (input.Mode == "FORM")
                {
                    dbParameters.Add("@vntrt_ctgry_id", input.vntrt_ctgry_id);
                    dbParameters.Add("@wkg_ctgry_ids", input.wkg_ctgry_ids);
                    dbParameters.Add("@sort_ordr", input.sort_ordr != "" ? input.sort_ordr : null);
                    dbParameters.Add("@act_inact_ind", input.act_inact_ind);

                    query = @"UPDATE wkg_vntrt_ctgry SET wkg_ctgry_ids=@wkg_ctgry_ids,sort_ordr=@sort_ordr,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(), 
                                act_inact_ind = @act_inact_ind WHERE vntrt_ctgry_id = @vntrt_ctgry_id AND supp_map_id = @supp_map_id;";
                }
                else
                {
                    var Loopdata = input.Selectedrow;
                    var valuesBuilder = new StringBuilder();
                    int i = 1;
                    foreach (var item in Loopdata)
                    {
                        dbParameters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                        dbParameters.Add($"@vntrt_ctgry_id{i}", item.vntrt_ctgry_id.ToString());

                        valuesBuilder.Append($"(@act_inact_ind{i},@vntrt_ctgry_id{i}),");
                        ++i;
                    }
                    valuesBuilder.Length -= 1;
                    string valuesClause = valuesBuilder.ToString();

                    query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd 
                               FROM wkg_vntrt_ctgry AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) 
                               ON SRC.col1 = TRGT.vntrt_ctgry_id AND supp_map_id = @supp_map_id;";
                }

                using (var dbService = this.GetDBService(true))
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(query, dbParameters);
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM102SaveCategoryForm)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM102SaveCategoryForm)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM103

        public async Task<SSM103loadObject> SSM103Gridbinding(SessionInfo sessionInfo, SSM103Overrides input)
        {

            var output = new SSM103loadObject();
            try
            {

                List<SSM103ExceptionLang> ExpLang = null;
                List<SSM103Imagedata> Imgdata = null;
                List<SSM103Overrides> Overrides = null;
                List<SSM102TourCtgryMastObject> CtgryList = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;

                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY exlang.prod_nam ) AS cnt , 
                                  exlang.prod_id, exlang.lang_cd, LNG.lang_nam, exlang.prod_nam ,COUNT(*) OVER () AS total_count 
                                  FROM wkg_supp_prod_grp_excptn_lang exlang INNER JOIN wkg_pos_accptd_lang LNG ON 
                                  exlang.lang_cd = LNG.lang_cd WHERE exlang.prod_id =@prod_id) AS temp WHERE temp.cnt 
                                  BETWEEN @startrow AND @endrow;

                                  SELECT img_srl,img_nam,img_path FROM wkg_supp_img_dtls WHERE prod_id=@prod_id AND supp_map_id=@supp_map_id;

                                  select (SELECT ftp_supp_img_url FROM wkg_cntrl_param_mast) + LOWER(img.img_dir) + '/' + img.img_nam AS 'img_url', 
                                  img.img_nam, dtl.vntrt_prod_nam, ovrd.img_srl,ovrd.ovrd_srl,ovrd.prod_id,ovrd.supp_map_id,ovrd.prod_featrd,
                                  ovrd.latitude,ovrd.longitude,ovrd.sort_ordr,ovrd.cncl_plcy,ovrd.cncl_rfnd,ovrd.bkng_fee,ovrd.bkng_fee_typ,ovrd.tui_ctgry_ids 
                                  from wkg_supp_prod_ovrd ovrd INNER JOIN wkg_vntrt_prod_dtl dtl ON ovrd.prod_id = dtl.vntrt_prod_id
                                  left outer join wkg_img_dtls img ON img.img_srl=ovrd.img_srl where ovrd.prod_id=@prod_id;

                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;

                                  SELECT ctgry.tour_ctgry_id,lang.en_GB as tour_ctgry_nam,ctgry.act_inact_ind FROM wkg_tour_ctgry ctgry 
                                  INNER JOIN wkg_lang_data lang ON ctgry.lang_data_srl = lang.data_srl;

                                  SELECT STRING_AGG(ctgry.wkg_ctgry_ids, ', ') AS wkg_ctgry_ids  FROM wkg_vntrt_prod_ctgry prodctgry
                                  INNER JOIN wkg_vntrt_ctgry ctgry ON ctgry.vntrt_ctgry_id=prodctgry.prod_ctgry_id
                                  WHERE prodctgry.vntrt_prod_id = @prod_id and prodctgry.supp_map_id = @supp_map_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    ExpLang = new List<SSM103ExceptionLang>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM103ExceptionLang Grdexpone = new SSM103ExceptionLang();
                        Grdexpone.prod_id = r.GetValue<string>("prod_id");
                        Grdexpone.lang_cd = r.GetValue<string>("lang_cd");
                        Grdexpone.lang_nam = r.GetValue<string>("lang_nam");
                        Grdexpone.prod_nam = r.GetValue<string>("prod_nam");

                        ExpLang.Add(Grdexpone);

                    }
                    Imgdata = new List<SSM103Imagedata>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM103Imagedata Img = new SSM103Imagedata();
                        Img.img_srl = r.GetValue<string>("img_srl");
                        Img.img_nam = r.GetValue<string>("img_nam");
                        Img.img_path = r.GetValue<string>("img_path");
                        Imgdata.Add(Img);

                    }
                    Overrides = new List<SSM103Overrides>();
                    var ftpService = GetService<IFileManagerService>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {

                        SSM103Overrides Ords = new SSM103Overrides();
                        Ords.img_srl = r.GetValue<string>("img_srl");
                        Ords.img_nam = r.GetValue<string>("img_nam");
                        Ords.img_url = !string.IsNullOrEmpty(Ords.img_nam) ? await ftpService.ReadFileAsync(r.GetValue<string>("img_url"), Ords.img_nam) : "";
                        Ords.ovrd_srl = r.GetValue<string>("ovrd_srl");
                        Ords.prod_nam = r.GetValue<string>("vntrt_prod_nam");
                        Ords.prod_id = r.GetValue<string>("prod_id");
                        Ords.supp_map_id = r.GetValue<string>("supp_map_id");
                        Ords.prod_featrd = r.GetValue<bool>("prod_featrd");
                        Ords.latitude = r.GetValue<string>("latitude");
                        Ords.longitude = r.GetValue<string>("longitude");
                        Ords.sort_ordr = r.GetValue<string>("sort_ordr");
                        Ords.cncl_plcy = r.GetValue<string>("cncl_plcy");
                        Ords.cncl_rfnd = r.GetValue<bool>("cncl_rfnd");
                        Ords.bkng_fee = r.GetValue<string>("bkng_fee");
                        Ords.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");
                        Ords.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");
                        Ords.tui_ctgry_ids = r.GetValue<string>("tui_ctgry_ids");

                        Overrides.Add(Ords);

                    }
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");

                    }
                    CtgryList = new List<SSM102TourCtgryMastObject>();
                    foreach (DataRow r in DS.Tables[4].Rows)
                    {
                        SSM102TourCtgryMastObject obj4 = new SSM102TourCtgryMastObject();

                        obj4.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj4.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj4.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        CtgryList.Add(obj4);
                    }
                    foreach (DataRow r in DS.Tables[5].Rows)
                    {
                        output.wkg_ctgry_ids = r.GetValue<string>("wkg_ctgry_ids");
                    }
                }
                output.ExpLanggrid = ExpLang;
                output.GetImagedata = Imgdata;
                output.GetOvrride = Overrides;
                output.BookingFeeType = StaticData.Common.BookingFeeType;
                output.WKGCtgryList = CtgryList;

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

        public async Task<OperationStatus> SSM103SaveOvrdImgData(SessionInfo sessionInfo, SSM103Overrides input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_srl", input.img_srl != "" ? input.img_srl : null);
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@prod_featrd", input.prod_featrd);
                dbParamters.Add("@latitude", input.latitude);
                dbParamters.Add("@longitude", input.longitude);
                dbParamters.Add("@cncl_plcy", input.cncl_plcy);
                dbParamters.Add("@cncl_rfnd", input.cncl_rfnd);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@bkng_fee", input.bkng_fee);
                dbParamters.Add("@bkng_fee_typ", input.bkng_fee_typ);
                dbParamters.Add("@tui_ctgry_ids", input.tui_ctgry_ids);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                if (input.ImageChanged == "YES" && input.OldImg == "NO" && input.img_nam != "")
                {
                    if (files != null)
                    {
                        var tourser = this.GetService<IFileManagerService>();
                        var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });

                    }
                }
                string query = "";
                if (input.Savedata == "INSERT")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {
                            query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,mod_by_usr_cd,mod_dttm,img_srl,
                                       prod_featrd,latitude,longitude,cncl_plcy,sort_ordr,cncl_rfnd,bkng_fee,bkng_fee_typ,tui_ctgry_ids)
                                       VALUES(@prod_id,@supp_map_id,@mod_by_usr_cd,GETDATE(),@img_srl,@prod_featrd,@latitude,
                                       @longitude,@cncl_plcy,@sort_ordr,@cncl_rfnd,@bkng_fee,@bkng_fee_typ,@tui_ctgry_ids)";
                        }
                        else
                        {
                            query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,mod_by_usr_cd,
                                       mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,@mod_by_usr_cd,getdate());
                                       INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,mod_by_usr_cd,mod_dttm,img_srl,prod_featrd,
                                       latitude,longitude,cncl_plcy,sort_ordr,cncl_rfnd,bkng_fee,bkng_fee_typ,tui_ctgry_ids)VALUES(@prod_id,@supp_map_id,
                                       @mod_by_usr_cd,GETDATE(),(SELECT MAX(img_srl) FROM wkg_img_dtls),@prod_featrd,@latitude,@longitude,
                                       @cncl_plcy,@sort_ordr,@cncl_rfnd,@bkng_fee,@bkng_fee_typ,@tui_ctgry_ids);";
                        }

                    }
                    else
                    {
                        query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,prod_featrd,latitude,longitude,
                                   mod_by_usr_cd,mod_dttm,img_srl,sort_ordr,cncl_plcy,cncl_rfnd,bkng_fee,bkng_fee_typ,tui_ctgry_ids)
                                   VALUES (@prod_id,@supp_map_id,@prod_featrd,@latitude,@longitude,@mod_by_usr_cd,GETDATE(),
                                   null,@sort_ordr,@cncl_plcy,@cncl_rfnd,@bkng_fee,@bkng_fee_typ,@tui_ctgry_ids)";
                    }
                }
                else if (input.Savedata == "UPDATE")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {
                            query = @"UPDATE wkg_supp_prod_ovrd  SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                       img_srl=@img_srl,prod_featrd = @prod_featrd,latitude = @latitude,longitude = @longitude,
                                       cncl_plcy = @cncl_plcy,sort_ordr = @sort_ordr,cncl_rfnd = @cncl_rfnd,bkng_fee=@bkng_fee,
                                       bkng_fee_typ=@bkng_fee_typ,tui_ctgry_ids=@tui_ctgry_ids WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";

                        }
                        else
                        {
                            if (input.img_nam == "")
                            {
                                query = @"UPDATE wkg_supp_prod_ovrd  SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                           img_srl=null,prod_featrd = @prod_featrd,latitude = @latitude,longitude = @longitude,
                                           cncl_plcy = @cncl_plcy,sort_ordr = @sort_ordr,cncl_rfnd = @cncl_rfnd,bkng_fee = @bkng_fee,
                                           bkng_fee_typ = @bkng_fee_typ,tui_ctgry_ids=@tui_ctgry_ids WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                            else
                            {
                                query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                           mod_by_usr_cd,mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,
                                           @mod_by_usr_cd,getdate());
                                           UPDATE wkg_supp_prod_ovrd SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                           img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),prod_featrd = @prod_featrd,
                                           latitude = @latitude,longitude = @longitude,cncl_plcy = @cncl_plcy,sort_ordr = @sort_ordr,
                                           cncl_rfnd = @cncl_rfnd,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ,tui_ctgry_ids=@tui_ctgry_ids WHERE 
                                           ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                        }
                    }
                    else
                    {
                        query = @"UPDATE wkg_supp_prod_ovrd  SET prod_featrd=@prod_featrd,latitude=@latitude,longitude=@longitude,
                                   mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),sort_ordr=@sort_ordr,cncl_plcy=@cncl_plcy,
                                   cncl_rfnd=@cncl_rfnd,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ,tui_ctgry_ids=@tui_ctgry_ids WHERE 
                                   ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
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

        #region Public Methods SSM104

        public async Task<SSM023Object> SSM104OnLoadExcep(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM023Object();
            output.prod_exist = false;
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                int tolR = 0;
                output.data = null;
                output.comboList = new List<SSM023Object>();
                output.grid = new PageInfo<SSM023Object>();
                output.grid.Items = new List<SSM023Object>();
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam) AS cnt, gpm.pos_grp_nam, 
                                  gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,gxc.act_inact_ind, COUNT(*) OVER () AS total_count  
                                  FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on gpm.pos_grp_id = gxc.pos_grp_id  
                                  WHERE gxc.act_inact_ind = 1 AND gxc.prod_id = @prod_id AND gxc.supp_map_id =@supp_map_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT pos_grp_id,pos_grp_nam FROM wkg_pos_grp_mast WHERE act_inact_ind = 1;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        tolR = r.GetValue<int>("total_count");
                        SSM023Object obj = new SSM023Object();
                        obj.excptn_srl = r.GetValue<string>("excptn_srl");
                        obj.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj.wkg_markup = r.GetValue<string>("wkg_markup");
                        obj.wkg_markup_typ = r.GetValue<string>("wkg_markup_typ");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        output.grid.Items.Add(obj);
                    }
                    output.grid.SetPages(tolR, input.PageSize);
                    output.grid.CurrentPage = tolR == 0 ? 1 : input.PageNo;
                    output.BookingFeeType = StaticData.Common.BookingFeeType;
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        var temp = new SSM023Object
                        {
                            pos_grp_id = r.GetValue<string>("pos_grp_id"),
                            pos_grp_nam = r.GetValue<string>("pos_grp_nam")
                        };
                        output.comboList.Add(temp);
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<PageInfo<SSM023Object>> SSM104SearchExcep(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new PageInfo<SSM023Object>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@pos_grp_id", input.pos_grp_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam {(input.sortType ? "ASC" : "DESC")}) AS cnt,
                                  gpm.pos_grp_nam,gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,gxc.act_inact_ind, COUNT(*) OVER () AS total_count
                                  FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on gpm.pos_grp_id = gxc.pos_grp_id 
                                  WHERE {(input.pos_grp_id == "" ? "" : "gxc.pos_grp_id = @pos_grp_id AND ")}gxc.act_inact_ind=@act_inact_ind AND 
                                  gxc.supp_map_id = @supp_map_id AND gxc.act_inact_ind = @act_inact_ind AND prod_id = @prod_id) AS temp
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM023Object>(query, dbParameters, r =>
                {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM023Object
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

        public async Task<SSM023Object> SSM104BlurSrchExcep(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM023Object();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);

                string query = @"select excptn_srl from wkg_supp_prod_grp_excptn where pos_grp_id = @pos_grp_id AND 
                                  prod_id=@prod_id AND supp_map_id=@supp_map_id;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM023Object>(query, dbParamters, r =>
                {
                    return new SSM023Object
                    {
                        excptn_srl = r.GetValue<string>("excptn_srl"),
                    };
                });
                if (output != null)
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
        public async Task<SSM023Object> SSM104LoadSelectExcep(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM023Object();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@excptn_srl", input.excptn_srl);

                string query = @"SELECT gxc.excptn_srl,gxc.pos_grp_id,gxc.wkg_markup,gxc.wkg_markup_typ,gxc.sort_ordr,gxc.act_inact_ind,
                                  REPLACE(CONVERT(VARCHAR,gxc.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),gxc.mod_dttm,108) AS mod_dttm,
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from 
                                  wkg_supp_prod_grp_excptn gxc 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = gxc.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  WHERE excptn_srl = @excptn_srl;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM023Object>(query, dbParameters, r =>
                {
                    return new SSM023Object
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

        public async Task<OperationStatus> SSM104SaveExcepData(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@excptn_srl", input.excptn_srl);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@wkg_markup", input.wkg_markup);
                dbParamters.Add("@wkg_markup_typ", input.wkg_markup_typ);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.EXSavedata == "UPDATE")
                {
                    query = @"UPDATE wkg_supp_prod_grp_excptn SET prod_id = @prod_id, pos_grp_id = @pos_grp_id, 
                               wkg_markup = @wkg_markup, wkg_markup_typ = @wkg_markup_typ,act_inact_ind = @act_inact_ind,
                               sort_ordr = @sort_ordr,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE() WHERE 
                               excptn_srl = @excptn_srl;";
                }
                else if (input.EXSavedata == "INSERT")
                {
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn (prod_id, supp_map_id, pos_grp_id, wkg_markup, wkg_markup_typ,
                               sort_ordr, act_inact_ind, mod_by_usr_cd, mod_dttm)VALUES (@prod_id, @supp_map_id, @pos_grp_id, @wkg_markup,
                               @wkg_markup_typ, @sort_ordr, @act_inact_ind,@mod_by_usr_cd, GETDATE());";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM104SaveExcepData)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM104SaveExcepData)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM105 

        public async Task<SSM020Object> SSM105GetOnloadData(SessionInfo sessionInfo, SSM103Overrides input)
        {
            var output = new SSM020Object();
            try
            {
                List<SSM020CmbRsltColl> langCD = null;
                List<SSM020Newdatasectwo> Nwsec = null;

                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@lang_cd", input.lang_cd);

                string query = @"SELECT lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';

                                  SELECT lang_srl, prod_id, lang_cd, prod_nam, REPLACE(CONVERT(VARCHAR, lng.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), lng.mod_dttm, 108) AS mod_dttm, 
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_supp_prod_grp_excptn_lang lng 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = lng.mod_by_usr_cd INNER JOIN rps_emp_mast emp 
                                  ON emp.emp_cd = usr.emp_cd  WHERE lng.prod_id=@prod_id AND lng.lang_cd=@lang_cd AND 
                                  lng.supp_map_id=@supp_map_id;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    langCD = new List<SSM020CmbRsltColl>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM020CmbRsltColl lang = new SSM020CmbRsltColl();
                        lang.lang_cd = r.GetValue<string>("lang_cd");
                        lang.lang_nam = r.GetValue<string>("lang_nam");

                        langCD.Add(lang);

                    }
                    Nwsec = new List<SSM020Newdatasectwo>();
                    foreach (DataRow DR2 in DS.Tables[1].Rows)
                    {
                        SSM020Newdatasectwo obj2 = new SSM020Newdatasectwo();
                        obj2.lang_srl = DR2.GetValue<string>("lang_srl");
                        obj2.prod_id = DR2.GetValue<string>("prod_id");
                        obj2.lang_cd = DR2.GetValue<string>("lang_cd");
                        obj2.prod_nam = DR2.GetValue<string>("prod_nam");
                        obj2.mod_by_usr_cd = DR2.GetValue<string>("mod_by_usr_cd");
                        obj2.mod_dttm = DR2.GetValue<string>("mod_dttm");
                        Nwsec.Add(obj2);
                    }
                }
                SSM020Object obj = new SSM020Object();
                obj.Lng_cmb_rslt = langCD;
                obj.Nwrsltsec = Nwsec;
                output = obj;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<SSM020Object> SSM105OnBlurSearch(SessionInfo sessionInfo, SSM103Overrides input)
        {
            var output = new SSM020Object();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@prod_id", $"{input.prod_id}");
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");

                string query = @"select lang_srl,prod_id,lang_cd from wkg_supp_prod_grp_excptn_lang where 
                                  prod_id = @prod_id and lang_cd = @lang_cd and supp_map_id = @supp_map_id; ";

                output.Nwrsltsec = await this.DBUtils(true).GetEntityDataListAsync<SSM020Newdatasectwo>(query, dbParamters, r =>
                {
                    return new SSM020Newdatasectwo
                    {
                        lang_srl = r.GetValue<string>("lang_srl"),
                        prod_id = r.GetValue<string>("prod_id"),
                        lang_cd = r.GetValue<string>("lang_cd"),
                    };
                });

                if (output.Nwrsltsec != null && output.Nwrsltsec.Count > 0)
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

        public async Task<OperationStatus> SSM105SaveLangData(SessionInfo sessionInfo, SSM103Overrides input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prod_nam", input.prod_nam);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@lang_srl", input.lang_srl);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.Savedata == "INSERT")
                {
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn_lang (prod_id, supp_map_id, lang_cd, prod_nam, mod_by_usr_cd, 
                               mod_dttm) VALUES (@prod_id, @supp_map_id,@lang_cd,@prod_nam,@mod_by_usr_cd, GETDATE());";
                }
                else
                {
                    query = @"UPDATE wkg_supp_prod_grp_excptn_lang SET supp_map_id = @supp_map_id,lang_cd =@lang_cd,
                               prod_nam = @prod_nam,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE() WHERE 
                               lang_srl = @lang_srl AND prod_id = @prod_id;";
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
    }
}

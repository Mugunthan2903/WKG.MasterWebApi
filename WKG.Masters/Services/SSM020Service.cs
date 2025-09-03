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
    internal class SSM020Service : WKLServiceManger, ISSM020Service
    {
        #region Constructor

        public SSM020Service(IServiceProvider serviceProvider, ILogger<SSM020Service> logger)
            : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM020
        public async Task<PageInfo<SSM020Object>> GetTuiProductsAsync(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new PageInfo<SSM020Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@tui_city_nam", $"%{input.tui_city_nam?.Trim()}%");
                dbParamters.Add("@tui_city_aval", $"{input.tui_city_aval}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);

                string query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY tuicity.tui_city_nam {(input.SortTyp ?? true ? "" : " DESC")}) AS cnt,
                                  tuicity.tui_city_cd, tuicity.tui_city_nam,tuicity.tui_cntry_nam, tuicity.tui_cntry_cd,
                                  tuicity.act_inact_ind,citymast.City_desc AS wkg_city_nam,
                                  tuicity.tui_city_aval, COUNT(*) OVER () AS total_count FROM wkg_tui_city tuicity
                                  LEFT OUTER JOIN rps_city_mast citymast ON citymast.City_cd = tuicity.wkg_city_cd 
                                  WHERE tui_city_nam LIKE @tui_city_nam AND tuicity.tui_city_aval = @tui_city_aval 
                                  AND tuicity.act_inact_ind =@act_inact_ind) AS temp
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int totalrecords = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM020Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM020Object
                    {
                        tui_city_cd = r.GetValue<string>("tui_city_cd"),
                        tui_city_nam = r.GetValue<string>("tui_city_nam"),
                        tui_cntry_cd = r.GetValue<string>("tui_cntry_cd"),
                        tui_cntry_nam = r.GetValue<string>("tui_cntry_nam"),
                        wkg_city_nam = r.GetValue<string>("wkg_city_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        tui_city_aval = r.GetValue<string>("tui_city_aval")
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

        public async Task<SSM020Object> SSM021GetEditTUICity(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new SSM020Object();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tui_city_cd", input.tui_city_cd);

                string query = @"SELECT tuicity.tui_city_cd,tuicity.tui_city_nam,tuicity.act_inact_ind,
                                 REPLACE(CONVERT(VARCHAR, tuicity.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), tuicity.mod_dttm, 108) AS mod_dttm, 
                                 emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                 (SELECT STRING_AGG((CAST(citymast.City_cd AS VARCHAR) + '/' + citymast.City_desc + ' - ' + cntry.Cntry_desc), ', ') FROM rps_city_mast citymast
                                 INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd=citymast.Cntry_cd
                                 WHERE citymast.City_cd IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(tuicity.wkg_city_cd,''), ',')))) AS wkg_city_cd 
                                 FROM wkg_tui_city tuicity INNER JOIN rps_usr_mast usr ON usr.Usr_id = tuicity.mod_by_usr_cd 
                                 INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                 WHERE tuicity.tui_city_cd = @tui_city_cd;
";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM020Object>(query, dbParameters, r =>
                {
                    return new SSM020Object
                    {
                        tui_city_cd = r.GetValue<string>("tui_city_cd"),
                        tui_city_nam = r.GetValue<string>("tui_city_nam"),
                        wkg_city_cd = r.GetValue<string>("wkg_city_cd"),
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
        public async Task<OperationStatus> SaveTuiAsync(SessionInfo sessionInfo, SSM020Object input)
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
                if (input.Savedata == "City")
                {
                    dbParamters.Add("@wkg_city_cd", input.wkg_city_cd);
                    dbParamters.Add("@tui_city_cd", input.tui_city_cd);
                    dbParamters.Add("@act_inact_ind", input.act_inact_ind);

                    query = @$"UPDATE wkg_tui_city SET wkg_city_cd=@wkg_city_cd,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(), 
                               act_inact_ind = @act_inact_ind WHERE tui_city_cd = @tui_city_cd;";

                }
                else if (input.Savedata == "Category")
                {
                    int i = 1;
                    foreach (var item in Loopdata)
                    {
                        dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                        dbParamters.Add($"@tui_ctgry_id{i}", item.tui_ctgry_id.ToString());
                        //int act_inact = item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0;
                        //string ctgry_id = item.tui_ctgry_id.ToString();

                        valuesBuilder.Append($"(@act_inact_ind{i},@tui_ctgry_id{i}),");
                        ++i;
                    }
                    valuesBuilder.Length -= 1;
                    string valuesClause = valuesBuilder.ToString();
                    //SSM022 Filter types grid update
                    query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd 
                               FROM wkg_tui_ctgry AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) 
                               ON SRC.col1 = TRGT.tui_ctgry_id;";

                }
                else
                {
                    string Imagequery = "";
                    int i = 1;
                    foreach (var item in Loopdata)
                    {
                        dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                        dbParamters.Add($"@tui_prod_id{i}", item.tui_prod_id.ToString());
                        if (item.act_inact_ind.ToString().ToUpper() == "ACTIVE")
                        {   //SSM020 update mod_dttm in wkg_supp_img_dtls and wkg_img_dtls for active products in wkg_tui_prod_dtl 
                            Imagequery += @$"UPDATE wkg_supp_img_dtls set mod_dttm = GETDATE() WHERE 
                                             prod_id = @tui_prod_id{i} AND supp_map_id = @supp_map_id AND act_inact_ind = 1;
                                             UPDATE wkg_img_dtls set mod_dttm = GETDATE() WHERE prod_id = @tui_prod_id{i} 
                                             AND supp_map_id = @supp_map_id AND act_inact_ind = 1;";
                        }

                        //int act_inact = item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0;
                        //string prod_id = item.tui_prod_id.ToString();

                        valuesBuilder.Append($"(@act_inact_ind{i},@tui_prod_id{i}),");
                        ++i;
                    }
                    valuesBuilder.Length -= 1;
                    string valuesClause = valuesBuilder.ToString();
                    //SSM020 Grid.update to wkg_tui_prod_dtl
                    query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd 
                               FROM wkg_tui_prod_dtl AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) ON 
                               SRC.col1 = TRGT.tui_prod_id;";

                    query += Imagequery;

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveTuiAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveTuiAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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
        public async Task<SSM020Object> GetSrchcmbproduct(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new SSM020Object();
            try
            {
                List<SSM020CmbRsltColl> tbl1 = null;
                List<SSM020SrchRsltHome> tbl3 = null;
                List<SSM020SrchRsltHome> CityList = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@tui_prod_nam", $"%{input.tui_prod_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.TUI);
                dbParamters.Add("@tui_prod_aval", input.tui_prod_aval);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@tui_city_cd", input.tui_city_cd);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"pd.tui_prod_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }
                if (input.SortTypCity != null)
                {
                    sortstring += $"{(input.SortTyp != null ? "," : "")}city.tui_city_nam {(input.SortTypCity ?? false ? "ASC" : "DESC")}";
                }
                if (input.SortTyp == null && input.SortTypCity == null)
                {
                    sortstring += $"pd.tui_prod_nam ASC";
                }
                //SSM020 onload and search query
                string query = @$"select lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';

                                  SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring}) AS cnt,pd.lang_cd,pd.tui_prod_id,
                                  ISNULL(lang.prod_nam,pd.tui_prod_nam) tui_prod_nam,pd.tui_city_cd,pd.act_inact_ind,
                                  pd.tui_prod_aval,city.tui_city_nam,STUFF((SELECT N',' + LTRIM(RTRIM(tui_ctgry_nam))
                                  FROM wkg_tui_ctgry ctgry WHERE ctgry.tui_ctgry_id IN(SELECT custpricetype
                                  FROM dbo.rms_fn_commasplit(ISNULL(ovrd.tui_ctgry_ids,pd.tui_ctgry_ids), ','))AND lang_cd='en-GB' 
                                  FOR XML PATH(''),TYPE).value('text()[1]','nvarchar(max)'),1,1,'') [ctgry_nam],
                                  STUFF((SELECT DISTINCT N', ' + ISNULL(langdata.en_GB, '')
                                  FROM wkg_tui_ctgry ctgry LEFT OUTER JOIN wkg_tour_ctgry tourctgry ON tourctgry.tour_ctgry_id IN
                                  (SELECT custpricetype FROM dbo.rms_fn_commasplit(ctgry.wkg_ctgry_ids, ','))
                                  INNER JOIN wkg_lang_data langdata ON langdata.data_srl = tourctgry.lang_data_srl
                                  WHERE ctgry.tui_ctgry_id IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(ovrd.tui_ctgry_ids,pd.tui_ctgry_ids), ','))
                                  FOR XML PATH(''), TYPE).value('text()[1]', 'nvarchar(max)'), 1, 2, '') AS ctgry_typ_nam,
                                  COUNT(*) OVER () AS total_count FROM wkg_tui_prod_dtl AS pd INNER JOIN wkg_tui_city 
                                  AS city ON pd.tui_city_cd = city.tui_city_cd AND city.act_inact_ind = 1 LEFT OUTER JOIN 
                                  wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=pd.tui_prod_id AND ovrd.supp_map_id=@supp_map_id left outer join 
                                  wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=pd.tui_prod_id AND lang.supp_map_id=@supp_map_id
                                  AND lang.lang_cd=@lang_cd WHERE  pd.tui_prod_nam LIKE @tui_prod_nam
                                  {(input.tui_city_cd != null ? "AND pd.tui_city_cd = @tui_city_cd" : "")}
                                  AND pd.act_inact_ind= @act_inact_ind AND pd.tui_prod_aval = @tui_prod_aval AND pd.lang_cd=@lang_cd) AS temp
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;
                                  
                                  SELECT tui_city_cd, tui_city_nam FROM wkg_tui_city where act_inact_ind = 1;

                                  SELECT supp_map_id,supp_ftp_img_dir FROM wkg_supp_config WHERE supp_map_id = @supp_map_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM020CmbRsltColl>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM020CmbRsltColl obj1 = new SSM020CmbRsltColl();
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.lang_nam = r.GetValue<string>("lang_nam");

                        tbl1.Add(obj1);

                    }
                    tbl3 = new List<SSM020SrchRsltHome>();
                    foreach (DataRow DR2 in DS.Tables[1].Rows)
                    {
                        SSM020SrchRsltHome obj2 = new SSM020SrchRsltHome();
                        totalrecords = DR2.GetValue<int>("total_count");
                        obj2.tui_prod_id = DR2.GetValue<string>("tui_prod_id");
                        obj2.tui_prod_nam = DR2.GetValue<string>("tui_prod_nam");
                        obj2.tui_prod_aval = DR2.GetValue<string>("tui_prod_aval");
                        obj2.act_inact_ind = DR2.GetValue<string>("act_inact_ind");
                        obj2.tui_city_cd = DR2.GetValue<string>("tui_city_cd");
                        obj2.ctgry_nam = DR2.GetValue<string>("ctgry_nam");
                        obj2.ctgry_typ_nam = DR2.GetValue<string>("ctgry_typ_nam");
                        obj2.tui_city_nam = DR2.GetValue<string>("tui_city_nam");
                        tbl3.Add(obj2);
                    }
                    CityList = new List<SSM020SrchRsltHome>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM020SrchRsltHome obj1 = new SSM020SrchRsltHome();
                        obj1.tui_city_cd = r.GetValue<string>("tui_city_cd");
                        obj1.tui_city_nam = r.GetValue<string>("tui_city_nam");

                        CityList.Add(obj1);

                    }
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        output.SupplierMapID = r.GetValue<string>("supp_map_id");
                        output.ImageDirectory = r.GetValue<string>("supp_ftp_img_dir");
                    }
                }
                //SSM020Object obj = new SSM020Object();
                output.Lng_cmb_rslt = tbl1;
                output.srch_rslt = tbl3;
                output.CityList = CityList;

                //output = obj;
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

        public async Task<SSM020Object> GetNewdatasectwo(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new SSM020Object();
            try
            {
                List<SSM020CmbRsltColl> langCD = null;
                List<SSM020Newdatasectwo> Nwsec = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                //SSM025 onload
                string query = @"SELECT lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';

                                  SELECT lang_srl, prod_id, lang_cd, prod_nam, 
                                  REPLACE(CONVERT(VARCHAR, lng.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), lng.mod_dttm, 108) AS mod_dttm, 
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
                        //obj2.tui_prod_id = DR2.GetValue<string>("tui_prod_id");
                        //obj2.lang_cd = DR2.GetValue<string>("lang_cd");
                        //obj2.tui_prod_nam = DR2.GetValue<string>("tui_prod_nam");

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
        public async Task<SSM020Object> SSM025OnBlurSearch(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new SSM020Object();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@prod_id", $"{input.prod_id}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@supp_map_id", input.supp_map_id);

                //SSM025 checks if record exists in wkg_supp_prod_grp_excptn_lang for specified lang_cd
                string query = @"SELECT lang_srl, prod_id, lang_cd, prod_nam, REPLACE(CONVERT(VARCHAR, lng.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), lng.mod_dttm, 108) AS mod_dttm, 
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_supp_prod_grp_excptn_lang lng 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = lng.mod_by_usr_cd INNER JOIN rps_emp_mast emp 
                                  ON emp.emp_cd = usr.emp_cd  WHERE lng.prod_id=@prod_id AND lng.lang_cd=@lang_cd AND 
                                  lng.supp_map_id = @supp_map_id;";

                output.Nwrsltsec = await this.DBUtils(true).GetEntityDataListAsync<SSM020Newdatasectwo>(query, dbParamters, r =>
                {
                    return new SSM020Newdatasectwo
                    {
                        lang_srl = r.GetValue<string>("lang_srl"),
                        prod_id = r.GetValue<string>("prod_id"),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        prod_nam = r.GetValue<string>("prod_nam"),
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

        public async Task<SSM020Object> GetCombobinding(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new SSM020Object();
            try
            {
                List<SSM020CmbRsltExptuicat> combtui = null;
                List<SSM020GridExpLang> ExpLang = null;
                List<SSM020Imagedata> Imgdata = null;
                List<SSM020Overrides> Overrides = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@tui_prod_id", input.tui_prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM024 Edit onload.retrives records from wkg_supp_prod_grp_excptn_lang,wkg_tui_ctgry,wkg_supp_img_dtls,wkg_supp_prod_ovrd
                string query = @"select tui_ctgry_id,tui_ctgry_nam,tui_ctgry_aval,act_inact_ind from wkg_tui_ctgry where 
                                  lang_cd='en-gb';

                                  SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY exlang.prod_nam ) AS cnt , 
                                  exlang.prod_id, exlang.lang_cd, LNG.lang_nam, exlang.prod_nam ,COUNT(*) OVER () AS total_count 
                                  FROM wkg_supp_prod_grp_excptn_lang exlang INNER JOIN wkg_pos_accptd_lang LNG ON 
                                  exlang.lang_cd = LNG.lang_cd WHERE exlang.prod_id =@tui_prod_id) AS temp WHERE temp.cnt 
                                  BETWEEN @startrow AND @endrow;

                                  SELECT img_srl,img_nam,img_path FROM wkg_supp_img_dtls WHERE prod_id=@tui_prod_id AND 
                                  supp_map_id=@supp_map_id;

                                  SELECT (SELECT ftp_supp_img_url FROM wkg_cntrl_param_mast) + LOWER(img.img_dir) + '/' + img.img_nam AS 'img_url', 
                                  img.img_nam, dtl.tui_prod_nam,ovrd.ovrd_srl,ovrd.supp_map_id,ovrd.prod_id,
                                  ovrd.tui_ctgry_ids,ovrd.sort_ordr,ovrd.prod_featrd,ovrd.latitude,ovrd.longitude,
                                  ovrd.bkng_fee,ovrd.bkng_fee_typ,ovrd.img_srl from wkg_supp_prod_ovrd ovrd INNER JOIN 
                                  wkg_tui_prod_dtl dtl ON ovrd.prod_id = dtl.tui_prod_id AND dtl.lang_cd = 'en-GB' 
                                  left outer join wkg_img_dtls img ON img.img_srl=ovrd.img_srl where ovrd.prod_id=@tui_prod_id;

                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;

                                  select tui_ctgry_ids from wkg_tui_prod_dtl where tui_prod_id =@tui_prod_id AND 
                                  lang_cd='en-GB';";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    combtui = new List<SSM020CmbRsltExptuicat>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM020CmbRsltExptuicat tui = new SSM020CmbRsltExptuicat();
                        tui.tui_ctgry_id = r.GetValue<string>("tui_ctgry_id");
                        tui.tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam");
                        tui.tui_ctgry_aval = r.GetValue<bool>("tui_ctgry_aval");
                        tui.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        combtui.Add(tui);

                    }
                    ExpLang = new List<SSM020GridExpLang>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM020GridExpLang Grdexpone = new SSM020GridExpLang();
                        Grdexpone.tui_prod_id = r.GetValue<string>("prod_id");
                        Grdexpone.tui_prod_nam = r.GetValue<string>("prod_nam");
                        Grdexpone.lang_cd = r.GetValue<string>("lang_cd");
                        Grdexpone.lang_nam = r.GetValue<string>("lang_nam");



                        ExpLang.Add(Grdexpone);

                    }
                    Imgdata = new List<SSM020Imagedata>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM020Imagedata Img = new SSM020Imagedata();
                        Img.img_srl = r.GetValue<string>("img_srl");
                        Img.img_nam = r.GetValue<string>("img_nam");
                        Img.img_path = r.GetValue<string>("img_path");
                        Imgdata.Add(Img);

                    }
                    Overrides = new List<SSM020Overrides>();
                    var ftpService = GetService<IFileManagerService>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {

                        SSM020Overrides Ords = new SSM020Overrides();
                        Ords.img_srl = r.GetValue<string>("img_srl");
                        Ords.img_nam = r.GetValue<string>("img_nam");
                        Ords.img_url = !string.IsNullOrEmpty(Ords.img_nam) ? await ftpService.ReadFileAsync(r.GetValue<string>("img_url"), Ords.img_nam) : "";
                        Ords.ovrd_srl = r.GetValue<string>("ovrd_srl");
                        Ords.tui_prod_nam = r.GetValue<string>("tui_prod_nam");
                        Ords.prod_id = r.GetValue<string>("prod_id");
                        Ords.supp_map_id = r.GetValue<string>("supp_map_id");
                        Ords.tui_ctgry_ids = r.GetValue<string>("tui_ctgry_ids");
                        Ords.sort_ordr = r.GetValue<string>("sort_ordr");
                        Ords.prod_featrd = r.GetValue<string>("prod_featrd");
                        Ords.latitude = r.GetValue<string>("latitude");
                        Ords.longitude = r.GetValue<string>("longitude");
                        Ords.bkng_fee = r.GetValue<string>("bkng_fee");
                        Ords.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");

                        Overrides.Add(Ords);

                    }
                    foreach (DataRow r in DS.Tables[4].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");

                    }
                    foreach (DataRow r in DS.Tables[5].Rows)
                    {
                        output.dtl_tui_ctgry_ids = r.GetValue<string>("tui_ctgry_ids");
                    }

                }
                output.Exc_cmb_tui_cat = combtui;
                output.ExpLanggrid = ExpLang;
                output.GetImagedata = Imgdata;
                output.GetOvrride = Overrides;
                output.BookingFeeType = StaticData.Common.BookingFeeType;

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
        public async Task<SSM020OnloadObject> SSM022GetOnloadAsync(SessionInfo sessionInfo, SSM022SearchInputs input)
        {
            var output = new SSM020OnloadObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                //SSM022 FilterTypes onload
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY tui_ctgry_nam ) AS cnt, 
                                (SELECT STRING_AGG(lang.en_GB, ', ') FROM wkg_tour_ctgry ctgry_inner
                                JOIN wkg_lang_data lang ON lang.data_srl = ctgry_inner.lang_data_srl
                                WHERE ctgry_inner.tour_ctgry_id IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(ctgry.wkg_ctgry_ids,''), ',')))) AS ctgry_typ_nam,
                                ctgry.tui_ctgry_id,ctgry.tui_ctgry_nam,ctgry.tui_ctgry_aval,ctgry.tui_prnt_id,ctgry.wkg_ctgry_ids,
                                ctgry.sort_ordr,ctgry.act_inact_ind,COUNT(*) OVER () AS total_count FROM wkg_tui_ctgry ctgry
                                WHERE ctgry.tui_ctgry_nam LIKE '%' AND ctgry.lang_cd = 'en-GB' AND ctgry.act_inact_ind = '1' AND 
                                ctgry.tui_ctgry_aval = '1') AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                SELECT ctgry.tour_ctgry_id,lang.en_GB as tour_ctgry_nam,ctgry.act_inact_ind FROM wkg_tour_ctgry ctgry INNER JOIN wkg_lang_data lang ON ctgry.lang_data_srl = lang.data_srl;";
                List<SSM022Object> tbl1 = null;
                List<SSM022TypeObject> tbl2 = null;

                int totalrecords = 0;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM022Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM022Object obj1 = new SSM022Object();

                        obj1.tui_ctgry_id = r.GetValue<string>("tui_ctgry_id");
                        obj1.tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam");
                        obj1.tui_ctgry_aval = r.GetValue<bool>("tui_ctgry_aval");
                        obj1.tui_prnt_id = r.GetValue<string>("tui_prnt_id");
                        obj1.wkg_ctgry_ids = r.GetValue<string>("wkg_ctgry_ids");
                        obj1.ctgry_nam = r.GetValue<string>("ctgry_typ_nam");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM022TypeObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM022TypeObject obj2 = new SSM022TypeObject();
                        obj2.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj2.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj2.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl2.Add(obj2);

                    }
                    SSM020OnloadObject obj = new SSM020OnloadObject();
                    obj.Items = tbl1;
                    obj.CtgryType = tbl2;
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
        public async Task<PageInfo<SSM022Object>> SearchData(SessionInfo sessionInfo, SSM022SearchInputs input)
        {
            var output = new PageInfo<SSM022Object>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tui_ctgry_nam", $"%{input.tui_ctgry_nam?.Trim()}%");
                dbParameters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParameters.Add("@tui_ctgry_aval", $"{input.tui_ctgry_aval}");
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                //SSM022 FilterTypes search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.sortType ? "ORDER BY tui_ctgry_nam" : "ORDER BY tui_ctgry_nam DESC")} ) AS cnt, 
                                (SELECT STRING_AGG(lang.en_GB, ', ') FROM wkg_tour_ctgry ctgry_inner
                                JOIN wkg_lang_data lang ON lang.data_srl = ctgry_inner.lang_data_srl
                                WHERE ctgry_inner.tour_ctgry_id IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(ctgry.wkg_ctgry_ids,''), ',')))) AS ctgry_typ_nam,
                                ctgry.tui_ctgry_id,ctgry.tui_ctgry_nam,ctgry.tui_ctgry_aval,ctgry.tui_ctgry_lvl,ctgry.tui_prnt_id,ctgry.wkg_ctgry_ids,
                                ctgry.sort_ordr,ctgry.act_inact_ind,COUNT(*) OVER () AS total_count FROM wkg_tui_ctgry ctgry
                                WHERE ctgry.tui_ctgry_nam LIKE @tui_ctgry_nam AND ctgry.lang_cd = 'en-GB' AND ctgry.act_inact_ind = @act_inact_ind AND 
                                ctgry.tui_ctgry_aval = @tui_ctgry_aval) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM022Object>(query, dbParameters, r =>
                {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM022Object
                    {
                        tui_ctgry_id = r.GetValue<string>("tui_ctgry_id"),
                        tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam"),
                        tui_ctgry_lvl = r.GetValue<string>("tui_ctgry_lvl"),
                        tui_ctgry_aval = r.GetValue<bool>("tui_ctgry_aval"),
                        tui_prnt_id = r.GetValue<string>("tui_prnt_id"),
                        wkg_ctgry_ids = r.GetValue<string>("wkg_ctgry_ids"),
                        ctgry_nam = r.GetValue<string>("ctgry_typ_nam"),
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
        public async Task<OperationStatus> SaveCategoryAsync(SessionInfo sessionInfo, SSM022Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tui_ctgry_id", input.tui_ctgry_id);
                dbParameters.Add("@tui_ctgry_nam", input.tui_ctgry_nam);
                dbParameters.Add("@wkg_ctgry_ids", input.wkg_ctgry_ids);
                dbParameters.Add("@sort_ordr", input.sort_ordr != "" ? input.sort_ordr : null);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);
                dbParameters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                //dbParameters.Add("@mod_dttm", $"{input.mod_dttm}");
                //SSM022 Filter types update to wkg_tui_ctgry
                string query = @"UPDATE wkg_tui_ctgry SET tui_ctgry_nam=@tui_ctgry_nam,wkg_ctgry_ids=@wkg_ctgry_ids, 
                                  sort_ordr=@sort_ordr , mod_by_usr_cd=@mod_by_usr_cd ,mod_dttm = getdate(), 
                                  act_inact_ind = @act_inact_ind WHERE tui_ctgry_id = @tui_ctgry_id AND lang_cd = 'en-GB';";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveCategoryAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveCategoryAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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
        public async Task<SSM022Object> LoadFormDataAsync(SessionInfo sessionInfo, SSM022Object input)
        {
            var output = new SSM022Object();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tui_ctgry_id", input.tui_ctgry_id);
                //SSM022 Filter types load selected data to edit
                string query = @"SELECT tca.tui_ctgry_id,tca.tui_ctgry_nam, tca.sort_ordr, tca.wkg_ctgry_ids ,tca.wkg_ctgry_ids,
                                  tca.act_inact_ind, tca.tui_ctgry_aval, REPLACE(CONVERT(VARCHAR, tca.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), tca.mod_dttm, 108) AS mod_dttm, 
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_tui_ctgry tca 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = tca.mod_by_usr_cd INNER JOIN rps_emp_mast emp 
                                  ON emp.emp_cd = usr.emp_cd WHERE tca.tui_ctgry_id = @tui_ctgry_id AND tca.lang_cd = 'en-GB';";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM022Object>(query, dbParameters, r =>
                {
                    return new SSM022Object
                    {
                        tui_ctgry_id = r.GetValue<string>("tui_ctgry_id"),
                        tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        tui_ctgry_aval = r.GetValue<bool>("tui_ctgry_aval"),
                        wkg_ctgry_ids = r.GetValue<string>("wkg_ctgry_ids"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
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
        public async Task<SSM023Object> SSM023OnLoadDataAsync(SessionInfo sessionInfo, SSM023Object input)
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
                //SSM023 Exception onload
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam) AS cnt, gpm.pos_grp_nam,gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,
                                  gxc.act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on 
                                  gpm.pos_grp_id = gxc.pos_grp_id WHERE gxc.act_inact_ind = 1 AND gxc.prod_id = @prod_id AND gxc.supp_map_id =@supp_map_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;
                                  select pos_grp_id,pos_grp_nam from wkg_pos_grp_mast where act_inact_ind = 1;";
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
        public async Task<PageInfo<SSM023Object>> SSM023SearchDataAsync(SessionInfo sessionInfo, SSM023Object input)
        {
            var output = new PageInfo<SSM023Object>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@pos_grp_id", input.pos_grp_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind ? 1 : 0);
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                //SSM023 Exception search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam {(input.sortType ? "ASC" : "DESC")}) AS cnt, gpm.pos_grp_nam,gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,
                                  gxc.act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on 
                                  gpm.pos_grp_id = gxc.pos_grp_id WHERE {(input.pos_grp_id == "" ? "" : "gxc.pos_grp_id = @pos_grp_id AND ")}gxc.act_inact_ind=@act_inact_ind AND gxc.supp_map_id = @supp_map_id AND 
                                  gxc.act_inact_ind = @act_inact_ind AND prod_id = @prod_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
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
        public async Task<SSM023Object> SSM023BlurSrchAsync(SessionInfo sessionInfo, SSM023Object input)
        {
            var output = new SSM023Object();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                //SSM023 Exception.checks if record exists in the wkg_supp_prod_grp_excptn for specified pos_grp_id
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

        public async Task<SSM023Object> SSM023LoadSelectedData(SessionInfo sessionInfo, SSM023Object input)
        {
            var output = new SSM023Object();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@excptn_srl", input.excptn_srl);
                //SSM023 Exception load selected to edit
                string query = @"SELECT gxc.excptn_srl,gxc.pos_grp_id,gxc.wkg_markup,gxc.wkg_markup_typ,gxc.sort_ordr,gxc.act_inact_ind,
                                  REPLACE(CONVERT(VARCHAR,gxc.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),gxc.mod_dttm,108) AS mod_dttm,
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd from 
                                  wkg_supp_prod_grp_excptn gxc 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = gxc.mod_by_usr_cd
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd
                                  WHERE excptn_srl = @excptn_srl;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM023Object>(query, dbParameters, r => {
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

        public async Task<OperationStatus> SaveDataAsyncSSM023(SessionInfo sessionInfo, SSM023Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@excptn_srl", input.excptn_srl);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@wkg_markup", input.wkg_markup);
                dbParamters.Add("@wkg_markup_typ", input.wkg_markup_typ);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.mode == "UPDATE")
                {  //SSM023 Exception update
                    query = @"UPDATE wkg_supp_prod_grp_excptn
                               SET pos_grp_id = @pos_grp_id, wkg_markup = @wkg_markup, wkg_markup_typ = @wkg_markup_typ,act_inact_ind = @act_inact_ind,
                               sort_ordr = @sort_ordr,
                               mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE()
                               WHERE excptn_srl = @excptn_srl;";
                }
                else
                {   //SSM023 Exception insert
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
        public async Task<OperationStatus> SaveDataSectionconfigandimg(SessionInfo sessionInfo, SSM020Overrides input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@prod_nam", input.prod_nam);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@lang_srl", input.lang_srl);

                string query = "";

                if (input.Savedata == "STMWINSERT")
                {   //SSM025 insert to wkg_supp_prod_grp_excptn_lang
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn_lang (prod_id, supp_map_id, lang_cd, prod_nam, 
                               mod_by_usr_cd, mod_dttm) VALUES (@prod_id,@supp_map_id,@lang_cd,@prod_nam,@mod_by_usr_cd, GETDATE());";
                }
                else
                {   //SSM025 update to wkg_supp_prod_grp_excptn_lang
                    query = @"UPDATE wkg_supp_prod_grp_excptn_lang SET supp_map_id = @supp_map_id,lang_cd = @lang_cd,
                               prod_nam = @prod_nam,mod_by_usr_cd= @mod_by_usr_cd,mod_dttm = GETDATE() WHERE 
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

        public async Task<OperationStatus> SaveDataSectionEdit(SessionInfo sessionInfo, SSM020Overrides input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@bkng_fee", input.bkng_fee != "" ? input.bkng_fee : null);
                dbParamters.Add("@bkng_fee_typ", input.bkng_fee_typ != "" ? input.bkng_fee_typ : null);
                dbParamters.Add("@latitude", input.latitude != "" ? input.latitude : null);
                dbParamters.Add("@longitude", input.longitude != "" ? input.longitude : null);
                dbParamters.Add("@sort_ordr", input.sort_ordr != "" ? input.sort_ordr : null);
                dbParamters.Add("@img_srl", input.img_srl != "" ? input.img_srl : null);
                dbParamters.Add("@tui_ctgry_ids", input.tui_ctgry_ids != "" ? input.tui_ctgry_ids : null);
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_featrd", input.prod_featrd);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
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
                        {   //SSM024 insert to wkg_supp_prod_ovrd and use old image from wkg_img_dtls
                            query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,tui_ctgry_ids,prod_featrd,
                                       sort_ordr,latitude,longitude,bkng_fee,bkng_fee_typ,mod_by_usr_cd,mod_dttm,img_srl)
                                       VALUES (@prod_id,@supp_map_id,@tui_ctgry_ids,@prod_featrd,@sort_ordr,@latitude,
                                       @longitude,@bkng_fee,@bkng_fee_typ,@mod_by_usr_cd,GETDATE(),@img_srl)";
                        }
                        else
                        {   //SSM024 insert to wkg_supp_prod_ovrd and insert new image to wkg_img_dtls
                            query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,mod_by_usr_cd,mod_dttm) 
                                      VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,@mod_by_usr_cd,getdate());
                                      INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,tui_ctgry_ids,prod_featrd,sort_ordr,latitude,longitude,
                                      bkng_fee,bkng_fee_typ,mod_by_usr_cd,mod_dttm,img_srl)VALUES (@prod_id,@supp_map_id,@tui_ctgry_ids,@prod_featrd,
                                      @sort_ordr,@latitude,@longitude,@bkng_fee,@bkng_fee_typ,@mod_by_usr_cd,GETDATE(),
                                      (SELECT MAX(img_srl) FROM wkg_img_dtls))";
                        }

                    }
                    else
                    {   //SSM024 insert to wkg_supp_prod_ovrd without any change in image
                        query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,tui_ctgry_ids,prod_featrd,sort_ordr,
                                   latitude,longitude,bkng_fee,bkng_fee_typ,mod_by_usr_cd,mod_dttm,img_srl)VALUES 
                                   (@prod_id,@supp_map_id,@tui_ctgry_ids,@prod_featrd,@sort_ordr,@latitude, @longitude,
                                   @bkng_fee,@bkng_fee_typ,@mod_by_usr_cd,GETDATE(),null)";
                    }
                }
                else if (input.Savedata == "UPDATE")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {   //SSM024 update to wkg_supp_prod_ovrd and use old image from wkg_img_dtls
                            query = @"UPDATE wkg_supp_prod_ovrd  SET tui_ctgry_ids=@tui_ctgry_ids,prod_featrd=@prod_featrd,
                                       sort_ordr=@sort_ordr,latitude=@latitude,longitude=@longitude,bkng_fee=@bkng_fee,
                                       bkng_fee_typ=@bkng_fee_typ,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                       img_srl=@img_srl  WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";

                        }
                        else
                        {
                            if (input.img_nam == "")
                            {   //SSM024 update to wkg_supp_prod_ovrd and remove image
                                query = @"UPDATE wkg_supp_prod_ovrd  SET tui_ctgry_ids=@tui_ctgry_ids,
                                           prod_featrd=@prod_featrd,sort_ordr=@sort_ordr,latitude=@latitude,
                                           longitude=@longitude,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ,
                                           mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),img_srl=null WHERE 
                                           ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                            else {
                                //SSM024 update to wkg_supp_prod_ovrd and insert new image to wkg_img_dtls
                                query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                           mod_by_usr_cd,mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,
                                           @mod_by_usr_cd,getdate());

                                           UPDATE wkg_supp_prod_ovrd  SET tui_ctgry_ids=@tui_ctgry_ids,
                                           prod_featrd=@prod_featrd,sort_ordr=@sort_ordr,latitude=@latitude,
                                           longitude=@longitude,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ,
                                           mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),img_srl=(SELECT MAX(img_srl) FROM 
                                           wkg_img_dtls) WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                        }
                    }
                    else
                    {   //SSM024 update to wkg_supp_prod_ovrd without any change in image
                        query = @"UPDATE wkg_supp_prod_ovrd  SET tui_ctgry_ids=@tui_ctgry_ids,prod_featrd=@prod_featrd,
                                   sort_ordr=@sort_ordr,latitude=@latitude,longitude=@longitude,bkng_fee=@bkng_fee,
                                   bkng_fee_typ=@bkng_fee_typ,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE() WHERE 
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

        public async Task<OperationStatus> RemoveImage(SessionInfo sessionInfo, SSM020Overrides input)
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

                //SSM024 remove img_srl from wkg_supp_prod_ovrd
                query = @"UPDATE wkg_img_dtls SET act_inact_ind=0 WHERE img_srl= @img_srl;

                           UPDATE wkg_supp_prod_ovrd SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),img_srl=null 
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
        #endregion
    }
}

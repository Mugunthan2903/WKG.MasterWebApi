using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using WKL.Service.Domain;

namespace WKG.Masters.Services
{
    internal class SMST020Service : WKLServiceManger, ISMST020Service
    {
        #region Constructor

        public SMST020Service(IServiceProvider serviceProvider, ILogger<SMST020Service> logger)
            : base(serviceProvider, logger)
        {
        }
        public async Task<PageInfo<SMST020Object>> GetTuiProductsAsync(SessionInfo sessionInfo, SMST020Object input)
        {
            var output = new PageInfo<SMST020Object>();
            try
            {
                var dbParamters = new DBParameters();
                string query = "";
                if (input.tui_city_nam == "")
                {
                    query = $"SELECT tui_city_cd, tui_city_nam, tui_cntry_cd, tui_cntry_nam, act_inact_ind, tui_city_aval FROM wkg_tui_city WHERE tui_city_aval = '1';";
                }
                else
                {
                    query = $"SELECT tui_city_cd, tui_city_nam, tui_cntry_cd, tui_cntry_nam, act_inact_ind, tui_city_aval FROM wkg_tui_city WHERE tui_city_nam LIKE '" + input.tui_city_nam + "%' And tui_city_aval = '1';";
                }
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST020Object>(query, dbParamters, r =>
                {
                    return new SMST020Object
                    {
                        tui_city_cd = r.GetValue<string>("tui_city_cd"),
                        tui_city_nam = r.GetValue<string>("tui_city_nam"),
                        tui_cntry_cd = r.GetValue<string>("tui_cntry_cd"),
                        tui_cntry_nam = r.GetValue<string>("tui_cntry_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        tui_city_aval = r.GetValue<string>("tui_city_aval")
                    };
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> SaveTuiAsync(SessionInfo sessionInfo, SMST020Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();
                foreach (var item in Loopdata)
                {

                    int act_inact = item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0;
                    string tui_city = item.tui_city_cd.ToString();

                    valuesBuilder.Append($"('{act_inact}','{tui_city}'),");
                }
                valuesBuilder.Length -= 1;
                string valuesClause = valuesBuilder.ToString();

                string query = $"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd FROM wkg_tui_city AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) ON SRC.col1 = TRGT.tui_city_cd;";


                //string query = "UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(),mod_by_usr_cd=@mod_by_usr_cd FROM wkg_tui_city AS TRGT INNER JOIN (VALUES('1', '4129'),('1', '812')) AS SRC(act, cty) ON SRC.cty = TRGT.tui_city_cd;";
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
        public async Task<SMST020Object> GetSrchcmbproduct(SessionInfo sessionInfo, SMST020Object input)
        {
            var output = new SMST020Object();
            try
            {
                List<SMST020CmbRsltColl> tbl1 = null;
                List<SMST020SrchRsltHome> tbl3 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = $"select lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY pd.tui_prod_nam" : "ORDER BY pd.tui_prod_nam DESC")}) AS cnt,pd.lang_cd,pd.tui_prod_id, pd.tui_prod_nam,pd.tui_city_cd,pd.act_inact_ind,pd.tui_prod_aval,city.tui_city_nam, COUNT(*) OVER () AS total_count FROM wkg_tui_prod_dtl AS pd INNER JOIN wkg_tui_city AS city ON pd.tui_city_cd = city.tui_city_cd  WHERE pd.act_inact_ind = '1' AND pd.tui_prod_aval = '1' AND pd.lang_cd='en-GB') AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SMST020CmbRsltColl>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SMST020CmbRsltColl obj1 = new SMST020CmbRsltColl();
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.lang_nam = r.GetValue<string>("lang_nam");

                        tbl1.Add(obj1);

                    }
                    tbl3 = new List<SMST020SrchRsltHome>();
                    foreach (DataRow DR2 in DS.Tables[1].Rows)
                    {
                        SMST020SrchRsltHome obj2 = new SMST020SrchRsltHome();
                        totalrecords = DR2.GetValue<int>("total_count");
                        obj2.tui_prod_id = DR2.GetValue<string>("tui_prod_id");
                        obj2.tui_prod_nam = DR2.GetValue<string>("tui_prod_nam");
                        obj2.tui_prod_aval = DR2.GetValue<string>("tui_prod_aval");
                        obj2.act_inact_ind = DR2.GetValue<string>("act_inact_ind");
                        obj2.tui_city_cd = DR2.GetValue<string>("tui_city_cd");
                        obj2.tui_city_nam = DR2.GetValue<string>("tui_city_nam");
                        tbl3.Add(obj2);
                    }
                }
                SMST020Object obj = new SMST020Object();
                obj.Lng_cmb_rslt = tbl1;
                obj.srch_rslt = tbl3;

                output = obj;
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
        public async Task<SMST020Object> GetCombobinding(SessionInfo sessionInfo, SMST020Object input)
        {
            var output = new SMST020Object();
            try
            {
                List<SMST020CmbRsltExpGrpname> combGrpname = null;
                List<SMST020CmbRsltExptuicat> combtui = null;
                List<SMST020CmbRsltExpvchtyp> combvchtyp = null;
                List<SMST020ExpSrchdata> Tblsrchrslt = null;
                var dbParamters = new DBParameters();

                string query = $"select pos_cd,pos_grp_nam from wkg_pos_grp_mast where act_inact_ind=1;select * from wkg_tui_ctgry where act_inact_ind = 1 AND lang_cd = 'en-gb';select vchr_typ_cd,vchr_typ_nam from wkg_vchr_typ_mast; select prod_id,pos_grp_id,tui_ctgry_ids,wkg_markup,vchr_typ_cd,prod_featrd,latitude,longitude,sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm from wkg_supp_prod_grp_excptn";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    combGrpname = new List<SMST020CmbRsltExpGrpname>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SMST020CmbRsltExpGrpname Grpname = new SMST020CmbRsltExpGrpname();
                        Grpname.pos_cd = r.GetValue<string>("pos_cd");
                        Grpname.pos_grp_nam = r.GetValue<string>("pos_grp_nam");

                        combGrpname.Add(Grpname);

                    }
                    combtui = new List<SMST020CmbRsltExptuicat>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SMST020CmbRsltExptuicat tui = new SMST020CmbRsltExptuicat();
                        tui.tui_ctgry_id = r.GetValue<string>("tui_ctgry_id");
                        tui.tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam");

                        combtui.Add(tui);

                    }
                    combvchtyp = new List<SMST020CmbRsltExpvchtyp>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SMST020CmbRsltExpvchtyp vchtyp = new SMST020CmbRsltExpvchtyp();
                        vchtyp.vchr_typ_cd = r.GetValue<string>("vchr_typ_cd");
                        vchtyp.vchr_typ_nam = r.GetValue<string>("vchr_typ_nam");

                        combvchtyp.Add(vchtyp);

                    }
                    Tblsrchrslt = new List<SMST020ExpSrchdata>();
                    foreach (DataRow DR2 in DS.Tables[3].Rows)
                    {
                        SMST020ExpSrchdata srchrslt = new SMST020ExpSrchdata();
                        srchrslt.prod_id = DR2.GetValue<string>("prod_id");
                        srchrslt.pos_grp_id = DR2.GetValue<string>("pos_grp_id");
                        srchrslt.tui_ctgry_ids = DR2.GetValue<string>("tui_ctgry_ids");
                        srchrslt.wkg_markup = DR2.GetValue<string>("wkg_markup");
                        srchrslt.vchr_typ_cd = DR2.GetValue<string>("vchr_typ_cd");
                        srchrslt.prod_featrd = DR2.GetValue<string>("prod_featrd");
                        srchrslt.latitude = DR2.GetValue<string>("latitude");
                        srchrslt.longitude = DR2.GetValue<string>("longitude");
                        srchrslt.sort_ordr = DR2.GetValue<string>("sort_ordr");
                        srchrslt.act_inact_ind = DR2.GetValue<string>("act_inact_ind");
                        srchrslt.mod_by_usr_cd = DR2.GetValue<string>("mod_by_usr_cd");
                        srchrslt.mod_dttm = DR2.GetValue<string>("mod_dttm");
                        Tblsrchrslt.Add(srchrslt);
                    }
                }
                SMST020Object objcmb = new SMST020Object();

                objcmb.Exc_cmb_grp_name = combGrpname;
                objcmb.Exc_cmb_tui_cat = combtui;
                objcmb.Exc_cmb_vch_typ = combvchtyp;
                objcmb.Exc_cmb_srch_data = Tblsrchrslt;
                output = objcmb;



            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<PageInfo<SMST022TableFields>> SearchData( SessionInfo sessionInfo, SMST022SearchInputs input )
        {
            var output = new PageInfo<SMST022TableFields>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@evnt_typ_nam", $"{input.tui_ctgry_nam}%");
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                string query = $"SELECT* FROM (SELECT ROW_NUMBER() OVER (ORDER BY tui_ctgry_nam {(input.sortType?"ASC":"DESC")}) AS cnt, tca.*, COUNT(*) OVER () AS total_count FROM wkg_tui_ctgry tca WHERE tca.tui_ctgry_nam LIKE '%' AND tca.lang_cd = 'en-GB') AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST022TableFields>(query, dbParameters, r => {
                    tolR = r.GetValue<int>("total_count");
                    return new SMST022TableFields
                    {
                        tui_ctgry_id = r.GetValue<string>("tui_ctgry_id"),
                        tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam"),
                        tui_ctgry_lvl = r.GetValue<string>("tui_ctgry_lvl"),
                        tui_prnt_id = r.GetValue<string>("tui_prnt_id"),
                        ctgry_typ = r.GetValue<string>("ctgry_typ"),
                        sort_ordr = r.GetValue<short>("sort_ordr"),
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
        public async Task<OperationStatus> SaveCategoryAsync( SessionInfo sessionInfo, SMST022TableFields input )
        {
            var output = new OperationStatus();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tui_ctgry_id", input.tui_ctgry_id);
                dbParameters.Add("@shrt_nam", input.shrt_nam);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);
                string query = $"UPDATE wkg_tui_ctgry SET act_inact_ind = @act_inact_ind WHERE tui_ctgry_id = @tui_ctgry_id;";
                using (var dbService = this.GetDBService())
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
        public async Task<SMST022TableFields> LoadFormDataAsync( SessionInfo sessionInfo, SMST022TableFields input )
        {
            var output = new SMST022TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@tui_ctgry_id", input.tui_ctgry_id);
                string query = $"SELECT tca.tui_ctgry_id,tca.tui_ctgry_nam, tca.sort_ordr, tca.act_inact_ind, tca.tui_ctgry_aval, REPLACE(CONVERT(VARCHAR, tca.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), tca.mod_dttm, 108) AS mod_dttm, emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_tui_ctgry tca INNER JOIN rps_usr_mast usr ON usr.Usr_id = tca.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE tca.tui_ctgry_id = @tui_ctgry_id AND tca.lang_cd = 'en-GB';";
                output = await this.DBUtils(true).GetEntityDataAsync<SMST022TableFields>(query, dbParameters, r => {
                return new SMST022TableFields
                {
                    tui_ctgry_id = r.GetValue<string>("tui_ctgry_id"),
                    tui_ctgry_nam = r.GetValue<string>("tui_ctgry_nam"),
                    act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                    tui_ctgry_aval = r.GetValue<bool>("tui_ctgry_aval"),
                    sort_ordr = r.GetValue<short>("sort_ordr"),
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
        #endregion
    }
}

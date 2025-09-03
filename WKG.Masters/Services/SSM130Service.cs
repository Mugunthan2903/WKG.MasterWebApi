using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
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
    internal class SSM130Service : WKLServiceManger, ISSM130Service
    {
        #region Constructor
        public SSM130Service(IServiceProvider serviceProvider, ILogger<SSM130Service> logger)
        : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM130-Main Grid

        public async Task<SSM130loadObject> SSM130OnloadSearch(SessionInfo sessionInfo, SSM130Object input)
        {
            var output = new SSM130loadObject();
            try
            {
                List<SSM130Object> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@crrg_nam", $"%{input.crrg_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.Distribusion);
                dbParamters.Add("@crrg_prod_aval", input.crrg_prod_aval);
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"dtls.crrg_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }
                //SSM130 onload and search query
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring}) AS cnt,crrg_id,ISNULL(exlang.prod_nam,dtls.crrg_nam)crrg_nam,crrg_vhcl_typs,cpy_lead_gst,
                                  crrg_trms_url,act_inact_ind,crrg_prod_aval,COUNT(*) OVER () AS total_count FROM wkg_dstrbsn_carriage_dtls dtls 
                                  LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang as exlang ON exlang.prod_id = dtls.crrg_id AND exlang.supp_map_id = @supp_map_id AND exlang.lang_cd = @lang_cd
                                  WHERE crrg_nam LIKE @crrg_nam AND act_inact_ind = @act_inact_ind AND crrg_prod_aval = @crrg_prod_aval AND dtls.lang_cd = @lang_cd) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT supp_map_id,supp_ftp_img_dir FROM wkg_supp_config WHERE supp_map_id = @supp_map_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM130Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM130Object obj1 = new SSM130Object();
                        totalrecords = r.GetValue<int>("total_count");
                        obj1.crrg_id = r.GetValue<string>("crrg_id");
                        obj1.crrg_nam = r.GetValue<string>("crrg_nam");
                        obj1.crrg_vhcl_typs = r.GetValue<string>("crrg_vhcl_typs");
                        obj1.crrg_trms_url = r.GetValue<string>("crrg_trms_url");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.crrg_prod_aval = r.GetValue<bool>("crrg_prod_aval");
                        obj1.cpy_lead_gst = r.GetValue<bool?>("cpy_lead_gst");
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
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<OperationStatus> SSM130CarriageSaveGrid(SessionInfo sessionInfo, SSM130Object input)
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

                var Imagequery = new StringBuilder();
                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@cpy_lead_gst{i}", item.cpy_lead_gst == true ? 1 : 0);
                    dbParamters.Add($"@crrg_id{i}", item.crrg_id.ToString());
                    if (item.act_inact_ind.ToString().ToUpper() == "ACTIVE")
                    {
                        Imagequery.Append(@$"UPDATE wkg_supp_img_dtls set mod_dttm = GETDATE() WHERE 
                                         prod_id = @crrg_id{i} AND supp_map_id = @supp_map_id AND act_inact_ind = 1;");
                    }
                    valuesBuilder.Append($"(@act_inact_ind{i},@cpy_lead_gst{i},@crrg_id{i}),");
                    ++i;
                }
                valuesBuilder.Length -= 1;
                string valuesClause = valuesBuilder.ToString();
                query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, cpy_lead_gst=SRC.cpy_lead, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd 
                           FROM wkg_dstrbsn_carriage_dtls AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,cpy_lead,col1) ON 
                           SRC.col1 = TRGT.crrg_id;";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM130CarriageSaveGrid)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM130CarriageSaveGrid)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM131-Override

        public async Task<SSM130loadObject> SSM131OverrideOnload(SessionInfo sessionInfo, SSM131Overrides input)
        {

            var output = new SSM130loadObject();
            try
            {

                List<SSM135ExceptionLang> ExpLang = null;
                List<SSM131Overrides> Overrides = null;
                var dbParamters = new DBParameters();
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

                                  SELECT dtls.crrg_nam,ovrd.ovrd_srl,ovrd.prod_id,ovrd.supp_map_id,ovrd.prod_featrd,
                                  ovrd.sort_ordr,ovrd.dstrbsn_srvc_untl,ovrd.bkng_fee,ovrd.bkng_fee_typ FROM wkg_supp_prod_ovrd ovrd 
                                  INNER JOIN wkg_dstrbsn_carriage_dtls dtls ON ovrd.prod_id = dtls.crrg_id
                                  WHERE ovrd.prod_id=@prod_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    ExpLang = new List<SSM135ExceptionLang>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM135ExceptionLang Grdexpone = new SSM135ExceptionLang();
                        Grdexpone.prod_id = r.GetValue<string>("prod_id");
                        Grdexpone.lang_cd = r.GetValue<string>("lang_cd");
                        Grdexpone.lang_nam = r.GetValue<string>("lang_nam");
                        Grdexpone.prod_nam = r.GetValue<string>("prod_nam");
                        ExpLang.Add(Grdexpone);
                    }
                    Overrides = new List<SSM131Overrides>();
                    var ftpService = GetService<IFileManagerService>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {

                        SSM131Overrides Ords = new SSM131Overrides();
                        Ords.ovrd_srl = r.GetValue<string>("ovrd_srl");
                        Ords.prod_nam = r.GetValue<string>("crrg_nam");
                        Ords.prod_id = r.GetValue<string>("prod_id");
                        Ords.supp_map_id = r.GetValue<string>("supp_map_id");
                        Ords.sort_ordr = r.GetValue<string>("sort_ordr");
                        Ords.dstrbsn_srvc_untl = r.GetValue<string>("dstrbsn_srvc_untl");
                        Ords.bkng_fee = r.GetValue<string>("bkng_fee");
                        Ords.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");
                        Overrides.Add(Ords);
                    }
                }
                output.ExpLanggrid = ExpLang;
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

        public async Task<OperationStatus> SSM131SaveOverride(SessionInfo sessionInfo, SSM131Overrides input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@dstrbsn_srvc_untl", input.dstrbsn_srvc_untl);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@bkng_fee", input.bkng_fee);
                dbParamters.Add("@bkng_fee_typ", input.bkng_fee_typ);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                string query = "";
                if (input.Mode == "INSERT")
                {
                    query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,mod_by_usr_cd,mod_dttm,sort_ordr,dstrbsn_srvc_untl,bkng_fee,bkng_fee_typ)
                              VALUES (@prod_id,@supp_map_id,@mod_by_usr_cd,GETDATE(),@sort_ordr,@dstrbsn_srvc_untl,@bkng_fee,@bkng_fee_typ);";
                }
                else if (input.Mode == "UPDATE")
                {
                    query = @"UPDATE wkg_supp_prod_ovrd SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                              sort_ordr=@sort_ordr,dstrbsn_srvc_untl=@dstrbsn_srvc_untl,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ 
                              WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM131SaveOverride)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM131SaveOverride)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM132-Exception

        public async Task<SSM023Object> SSM132OnLoadExcep(SessionInfo sessionInfo, SSM050Object input)
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

                                  SELECT pos_grp_id,pos_grp_nam,act_inact_ind FROM wkg_pos_grp_mast;";
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
                            pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                            act_inact_ind = r.GetValue<bool>("act_inact_ind")
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
        public async Task<PageInfo<SSM023Object>> SSM132SearchExcep(SessionInfo sessionInfo, SSM050Object input)
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

        public async Task<SSM023Object> SSM132BlurSrchExcep(SessionInfo sessionInfo, SSM050Object input)
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
        public async Task<SSM023Object> SSM132LoadSelectExcep(SessionInfo sessionInfo, SSM050Object input)
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

        public async Task<OperationStatus> SSM132SaveExcepData(SessionInfo sessionInfo, SSM050Object input)
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
                    query = @"UPDATE wkg_supp_prod_grp_excptn SET pos_grp_id = @pos_grp_id,wkg_markup = @wkg_markup, 
                               wkg_markup_typ = @wkg_markup_typ,act_inact_ind = @act_inact_ind,sort_ordr = @sort_ordr,
                               mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE() WHERE excptn_srl = @excptn_srl;";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM132SaveExcepData)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM132SaveExcepData)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM133-LangEdit 

        public async Task<SSM020Object> SSM133GetOnloadData(SessionInfo sessionInfo, SSM131Overrides input)
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
        public async Task<SSM020Object> SSM133OnBlurSearch(SessionInfo sessionInfo, SSM131Overrides input)
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

        public async Task<OperationStatus> SSM133SaveLangData(SessionInfo sessionInfo, SSM131Overrides input)
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
                if (input.Mode == "INSERT")
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
                            catch (Exception ex1)
                            {
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM133SaveLangData)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM133SaveLangData)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM134-Differential

        public async Task<SSM130DifferentialOnload> SSM134DifferentialOnload(SessionInfo sessionInfo, SSM130DifferentialObject input)
        {
            var output = new SSM130DifferentialOnload();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                dbParameters.Add("@crrg_id", input.crrg_id);
                dbParameters.Add("@diffrt_nam", $"%{input.diffrt_nam?.Trim()}%");
                dbParameters.Add("@diffrt_aval", $"{input.diffrt_aval}");
                dbParameters.Add("@act_inact_ind", $"{input.act_inact_ind}");

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY lang.en_GB) AS cnt,dtls.diffrt_cd,dtls.crrg_id,lang.en_GB AS diffrt_nam,
                                  lang2.en_GB AS diffrt_desc,dtls.diffrt_min_age,dtls.diffrt_max_age,dtls.sort_ordr,mast.diffrt_desc AS wkg_diffrt_cd,dtls.act_inact_ind,
                                  dtls.diffrt_aval,COUNT(*) OVER () AS total_count FROM wkg_dstrbsn_carriage_diff_dtls dtls
                                  INNER JOIN wkg_lang_data lang ON lang.data_srl = dtls.diffrt_nam_srl
                                  LEFT OUTER JOIN  wkg_lang_data lang2 ON lang2.data_srl = dtls.diffrt_desc_srl
                                  LEFT OUTER JOIN rps_diffrt_mast mast ON mast.diffrt_cd = dtls.wkg_diffrt_cd
                                  WHERE crrg_id=@crrg_id AND lang.en_GB LIKE @diffrt_nam) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT diffrt_cd,diffrt_desc FROM rps_diffrt_mast";

                List<SSM130DifferentialObject> tbl1 = null;
                List<SSM130DifferentialObject> tbl2 = null;

                int totalrecords = 0;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM130DifferentialObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM130DifferentialObject obj1 = new SSM130DifferentialObject();
                        obj1.crrg_id = r.GetValue<string>("crrg_id");
                        obj1.diffrt_cd = r.GetValue<string>("diffrt_cd");
                        obj1.diffrt_nam = r.GetValue<string>("diffrt_nam");
                        obj1.diffrt_desc = r.GetValue<string>("diffrt_desc");
                        obj1.diffrt_min_age = r.GetValue<byte>("diffrt_min_age");
                        obj1.diffrt_max_age = r.GetValue<byte>("diffrt_max_age");
                        obj1.wkg_diffrt_cd = r.GetValue<string>("wkg_diffrt_cd");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.diffrt_aval = r.GetValue<bool>("diffrt_aval");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM130DifferentialObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM130DifferentialObject obj2 = new SSM130DifferentialObject();
                        obj2.diffrt_cd = r.GetValue<string>("diffrt_cd");
                        obj2.diffrt_desc = r.GetValue<string>("diffrt_desc");
                        tbl2.Add(obj2);
                    }
                    output.Items = tbl1;
                    output.WKG_Diff_ComboList = tbl2;
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

        public async Task<PageInfo<SSM130DifferentialObject>> SSM134DifferentialSearch(SessionInfo sessionInfo, SSM130DifferentialObject input)
        {
            var output = new PageInfo<SSM130DifferentialObject>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                dbParameters.Add("@crrg_id", input.crrg_id);
                dbParameters.Add("@diffrt_nam", $"%{input.diffrt_nam?.Trim()}%");
                dbParameters.Add("@diffrt_aval", $"{input.diffrt_aval}");
                dbParameters.Add("@act_inact_ind", $"{input.act_inact_ind}");

                string query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY lang.en_GB {(input.SortTyp ?? false ? "ASC" : "DESC")}) AS cnt,dtls.diffrt_cd,dtls.crrg_id,lang.en_GB AS diffrt_nam,
                                  lang2.en_GB AS diffrt_desc,dtls.diffrt_min_age,dtls.diffrt_max_age,dtls.sort_ordr,mast.diffrt_desc AS wkg_diffrt_cd,dtls.act_inact_ind,
                                  dtls.diffrt_aval,COUNT(*) OVER () AS total_count FROM wkg_dstrbsn_carriage_diff_dtls dtls
                                  INNER JOIN wkg_lang_data lang ON lang.data_srl = dtls.diffrt_nam_srl
                                  LEFT OUTER JOIN  wkg_lang_data lang2 ON lang2.data_srl = dtls.diffrt_desc_srl
                                  LEFT OUTER JOIN rps_diffrt_mast mast ON mast.diffrt_cd = dtls.wkg_diffrt_cd
                                  WHERE crrg_id=@crrg_id AND lang.en_GB LIKE @diffrt_nam AND dtls.act_inact_ind = @act_inact_ind AND dtls.diffrt_aval = @diffrt_aval) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int totalrecords = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM130DifferentialObject>(query, dbParameters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM130DifferentialObject
                    {
                        crrg_id = r.GetValue<string>("crrg_id"),
                        diffrt_cd = r.GetValue<string>("diffrt_cd"),
                        diffrt_nam = r.GetValue<string>("diffrt_nam"),
                        diffrt_desc = r.GetValue<string>("diffrt_desc"),
                        diffrt_min_age = r.GetValue<byte>("diffrt_min_age"),
                        diffrt_max_age = r.GetValue<byte>("diffrt_max_age"),
                        wkg_diffrt_cd = r.GetValue<string>("wkg_diffrt_cd"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        diffrt_aval = r.GetValue<bool>("diffrt_aval"),
                        sort_ordr = r.GetValue<string>("sort_ordr")
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

        public async Task<SSM130DifferentialObject> SSM134DifferentialEdit(SessionInfo sessionInfo, SSM130DifferentialObject input)
        {
            var output = new SSM130DifferentialObject();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@crrg_id", input.crrg_id);
                dbParameters.Add("@diffrt_cd", input.diffrt_cd);

                string query = @"SELECT dtls.diffrt_cd,crrg_id,lang.en_GB AS diffrt_nam ,lang2.en_GB AS diffrt_desc,
                                 dtls.diffrt_min_age,dtls.diffrt_max_age,dtls.sort_ordr,wkg_diffrt_cd,act_inact_ind,diffrt_aval,
                                 REPLACE(CONVERT(VARCHAR, dtls.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), dtls.mod_dttm, 108) AS mod_dttm, 
                                 emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd 
                                 FROM wkg_dstrbsn_carriage_diff_dtls dtls INNER JOIN wkg_lang_data lang ON lang.data_srl = dtls.diffrt_nam_srl
                                 LEFT OUTER JOIN wkg_lang_data lang2 ON lang2.data_srl = dtls.diffrt_desc_srl
                                 LEFT OUTER JOIN rps_diffrt_mast mast ON mast.diffrt_cd = dtls.wkg_diffrt_cd
                                 INNER JOIN rps_usr_mast usr ON usr.Usr_id = dtls.mod_by_usr_cd 
                                 INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                 WHERE crrg_id=@crrg_id AND dtls.diffrt_cd = @diffrt_cd;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM130DifferentialObject>(query, dbParameters, r =>
                {
                    return new SSM130DifferentialObject
                    {
                        crrg_id = r.GetValue<string>("crrg_id"),
                        diffrt_cd = r.GetValue<string>("diffrt_cd"),
                        diffrt_nam = r.GetValue<string>("diffrt_nam"),
                        diffrt_desc = r.GetValue<string>("diffrt_desc"),
                        diffrt_min_age = r.GetValue<byte>("diffrt_min_age"),
                        diffrt_max_age = r.GetValue<byte>("diffrt_max_age"),
                        wkg_diffrt_cd = r.GetValue<string>("wkg_diffrt_cd"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        diffrt_aval = r.GetValue<bool>("diffrt_aval"),
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

        public async Task<OperationStatus> SSM134DifferentialSave(SessionInfo sessionInfo, SSM130DifferentialObject input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParameters = new DBParameters();

                dbParameters.Add("@crrg_id", input.crrg_id);
                dbParameters.Add("@diffrt_cd", input.diffrt_cd);
                dbParameters.Add("@sort_ordr", input.sort_ordr);
                dbParameters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                dbParameters.Add("@wkg_diffrt_cd", input.wkg_diffrt_cd);
                dbParameters.Add("@act_inact_ind", input.act_inact_ind);

                string query = "";

                if (input.Mode == "FORM")
                {
                    query = @"UPDATE wkg_dstrbsn_carriage_diff_dtls SET sort_ordr=@sort_ordr,wkg_diffrt_cd=@wkg_diffrt_cd,
                              mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(),act_inact_ind = @act_inact_ind 
                              WHERE crrg_id = @crrg_id AND diffrt_cd = @diffrt_cd;";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM134DifferentialSave)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM134DifferentialSave)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM135-Facilities
        public async Task<SSM130loadObject> SSM135FacilitiesOnloadSrch(SessionInfo sessionInfo, SSM130FacilityObject input)
        {
            var output = new SSM130loadObject();
            try
            {
                List<SSM130FacilityObject> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@fclty_nam", $"%{input.fclty_nam?.Trim()}%");
                dbParamters.Add("@crrg_id", input.crrg_id);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;

                string query = @$"SELECT fclty_id,crrg_id,fclty_cd,lang.en_GB AS fclty_nam,
                                  lang2.en_GB AS fclty_desc,img.img_nam,wkg_img_srl,dtls.act_inact_ind FROM 
                                  wkg_dstrbsn_carriage_fclty_dtls dtls LEFT OUTER JOIN wkg_lang_data lang ON lang.data_srl = dtls.fclty_nam_srl
                                  LEFT OUTER JOIN wkg_lang_data lang2 ON lang2.data_srl = dtls.fclty_desc_srl
                                  LEFT OUTER JOIN wkg_img_dtls img ON img.img_srl = dtls.wkg_img_srl
                                  WHERE crrg_id = @crrg_id AND lang.en_GB LIKE @fclty_nam AND dtls.act_inact_ind= @act_inact_ind 
                                  ORDER BY lang.en_GB {(input.SortTyp ?? false ? "ASC" : "DESC")};";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM130FacilityObject>();
                    foreach (DataRow DR1 in DS.Tables[0].Rows)
                    {
                        SSM130FacilityObject obj1 = new SSM130FacilityObject();
                        totalrecords = DR1.GetValue<int>("total_count");
                        obj1.fclty_id = DR1.GetValue<string>("fclty_id");
                        obj1.crrg_id = DR1.GetValue<string>("crrg_id");
                        obj1.fclty_cd = DR1.GetValue<string>("fclty_cd");
                        obj1.fclty_nam = DR1.GetValue<string>("fclty_nam");
                        obj1.fclty_desc = DR1.GetValue<string>("fclty_desc");
                        obj1.img_nam = DR1.GetValue<string>("img_nam");
                        obj1.act_inact_ind = DR1.GetValue<bool>("act_inact_ind");
                        tbl1.Add(obj1);
                    }
                }
                output.Facilities = tbl1;
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

        public async Task<OperationStatus> SSM135FacilitiesGridSave(SessionInfo sessionInfo, SSM130FacilityObject input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();

                int i = 1;
                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@fclty_id{i}", item.fclty_id.ToString());
                    valuesBuilder.Append($"(@act_inact_ind{i},@fclty_id{i}),");
                    ++i;
                }
                valuesBuilder.Length -= 1;
                string valuesClause = valuesBuilder.ToString();
                query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(), mod_by_usr_cd=@mod_by_usr_cd 
                           FROM wkg_dstrbsn_carriage_fclty_dtls AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) ON 
                           SRC.col1 = TRGT.fclty_id;";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM135FacilitiesGridSave)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM135FacilitiesGridSave)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM136-Facilities images
        public async Task<SSM130loadObject> SSM136FacilitiesImageOnloadSrch(SessionInfo sessionInfo, SSM130FacilityObject input)
        {
            var output = new SSM130loadObject();
            try
            {
                List<SSM130FacilityObject> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@fclty_nam", $"%{input.fclty_nam?.Trim()}%");
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@crrg_id", input.crrg_id);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;

                string query = @$"SELECT dtls.fclty_cd,dtls.fclty_id, dtls.crrg_id, lang.en_GB AS fclty_nam, lang2.en_GB AS fclty_desc, 
                                  img.img_nam, dtls.act_inact_ind FROM wkg_dstrbsn_carriage_fclty_dtls dtls
                                  LEFT JOIN wkg_lang_data lang ON lang.data_srl = dtls.fclty_nam_srl
                                  LEFT JOIN wkg_lang_data lang2 ON lang2.data_srl = dtls.fclty_desc_srl
                                  LEFT JOIN wkg_img_dtls img ON img.img_srl = dtls.wkg_img_srl
                                  WHERE dtls.fclty_id = (SELECT MIN(fclty_id) FROM wkg_dstrbsn_carriage_fclty_dtls 
                                  WHERE lang.en_GB LIKE @fclty_nam AND fclty_cd = dtls.fclty_cd AND act_inact_ind = @act_inact_ind) ORDER BY lang.en_GB {(input.SortTyp ?? false ? "ASC" : "DESC")};

                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM130FacilityObject>();
                    foreach (DataRow DR1 in DS.Tables[0].Rows)
                    {
                        SSM130FacilityObject obj1 = new SSM130FacilityObject();
                        totalrecords = DR1.GetValue<int>("total_count");
                        obj1.fclty_id = DR1.GetValue<string>("fclty_id");
                        obj1.crrg_id = DR1.GetValue<string>("crrg_id");
                        obj1.fclty_cd = DR1.GetValue<string>("fclty_cd");
                        obj1.fclty_nam = DR1.GetValue<string>("fclty_nam");
                        obj1.fclty_desc = DR1.GetValue<string>("fclty_desc");
                        obj1.img_nam = DR1.GetValue<string>("img_nam");
                        obj1.act_inact_ind = DR1.GetValue<bool>("act_inact_ind");
                        tbl1.Add(obj1);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");
                    }
                }
                output.Facilities = tbl1;
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

        public async Task<SSM130loadObject> SSM136FacilitiesImageBlurSrch(SessionInfo sessionInfo, SSM130FacilityObject input)
        {
            var output = new SSM130loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", $"{input.img_dir}");
                //SSM036 Checks if image name exists in the directory
                string query = @"SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls WHERE img_dir=@img_dir;";
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
        public async Task<OperationStatus> SSM136FacilitiesImageSave(SessionInfo sessionInfo, SSM130FacilityObject input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                string query = "";
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();

                StringBuilder Imagequery = new StringBuilder();
                int i = 1;
                if (files != null && files.Count != 0)
                {
                    var tourser = this.GetService<IFileManagerService>();
                    var uploadTasks = new List<Task<string>>();
                    foreach (IFormFile file in files)
                    {
                        if (file != null)
                        {
                            uploadTasks.Add(tourser.SaveFileAsync(file, new List<string> { input.img_dir }));
                        }
                    }
                    await Task.WhenAll(uploadTasks);
                }

                foreach (var item in Loopdata)
                {
                    dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                    dbParamters.Add($"@fclty_cd{i}", item.fclty_cd.ToString());
                    dbParamters.Add($"@img_nam{i}", item.img_nam.ToString());
                    dbParamters.Add($"@wkg_img_srl{i}", item.wkg_img_srl.ToString());

                    if (item.ImageChanged.ToString().ToUpper() == "YES")
                    {
                        if (item.OldImg.ToString().ToUpper() == "YES")
                        {
                            Imagequery.Append($@"UPDATE wkg_dstrbsn_carriage_fclty_dtls SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                       wkg_img_srl=@wkg_img_srl{i},act_inact_ind=@act_inact_ind{i} WHERE fclty_cd = @fclty_cd{i};");
                        }
                        else
                        {
                            if (item.img_nam.ToString() == "")
                            {
                                Imagequery.Append($@"UPDATE wkg_dstrbsn_carriage_fclty_dtls SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                       wkg_img_srl=null,act_inact_ind=@act_inact_ind{i} WHERE fclty_cd = @fclty_cd{i};");
                            }
                            else
                            {
                                Imagequery.Append($@"INSERT INTO wkg_img_dtls (img_nam, img_dir,supp_map_id,act_inact_ind,mod_by_usr_cd,mod_dttm) 
                                      VALUES (@img_nam{i},@img_dir,@supp_map_id,1,@mod_by_usr_cd,GETDATE());

                                       UPDATE wkg_dstrbsn_carriage_fclty_dtls SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                       wkg_img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),act_inact_ind=@act_inact_ind{i} 
                                       WHERE fclty_cd = @fclty_cd{i};");
                            }
                        }
                    }
                    else
                    {
                        Imagequery.Append($@"UPDATE wkg_dstrbsn_carriage_fclty_dtls SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                    act_inact_ind=@act_inact_ind{i} WHERE fclty_cd = @fclty_cd{i};");
                    }
                    ++i;
                }

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM136FacilitiesImageSave)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM136FacilitiesImageSave)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM137-Distribusion Location

        public async Task<SSM137loadObject> SSM137OnloadCntrySearch(SessionInfo sessionInfo, SSM137LocationObject input)
        {
            var output = new SSM137loadObject();
            try
            {
                var dbParamters = new DBParameters();
                List<SSM137LocationObject> tbl1 = null;
                string query = "";

                //SSM138 onload retrives country combo srch dtls and records for grid

                query = @"SELECT cty_cntry, Cntry_desc FROM (SELECT DISTINCT  cty.cty_cntry, cntry.Cntry_desc,
                        CASE WHEN cty.cty_cntry ='GB' THEN 0 ELSE 1 END AS sort_priority  FROM wkg_dstrbsn_loc_stn_dtls stn
                        INNER JOIN wkg_dstrbsn_loc_cty_dtls cty ON cty.cty_cd = stn.cty_cd
                        INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd = cty.cty_cntry ) AS sorted_countries
                        ORDER BY sort_priority, Cntry_desc ;";


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM137LocationObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM137LocationObject obj1 = new SSM137LocationObject();
                        obj1.Cntry_Cd = r.GetValue<string>("cty_cntry");
                        obj1.Cntry_desc = r.GetValue<string>("Cntry_desc");
                        tbl1.Add(obj1);
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
        public async Task<SSM137loadObject> SSM137OnloadSearch(SessionInfo sessionInfo, SSM137LocationObject input)
        {
            var output = new SSM137loadObject();
            try
            {
                List<SSM137LocationObject> tbl1 = null;
                var dbParamters = new DBParameters();
               
                dbParamters.Add("@Loc_nam", $"%{input.Loc_nam.Trim()}%");
                dbParamters.Add("@Loc_prod_aval", input.Loc_prod_aval);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@Cntry", input.Cntry);
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                string sortOrder = "";

                if (input.SortTyp != null)
                {
                   sortOrder = (input.SortTyp ?? false) ? "ASC" : "DESC";
                }

               
                bool citySearchEnabled = input.City_Srch;
                bool areaSearchEnabled = input.Area_Srch;
                bool stationSearchEnabled = input.Statn_Srch;
                StringBuilder query = new StringBuilder();

                if (citySearchEnabled)
                {
                     query.Append(@"SELECT cty_cd, cty_lat, cty_long, act_inact_ind, cty_aval, en_GB 
                     FROM wkg_dstrbsn_loc_cty_dtls 
                     WHERE en_GB LIKE @Loc_nam AND act_inact_ind = @act_inact_ind AND cty_aval = @Loc_prod_aval");

                    if (!string.IsNullOrEmpty(input.Cntry))
                    {
                        query.Append(@" AND EXISTS(
                            SELECT split_cd.custpricetype
                            FROM dbo.rms_fn_commasplit(ISNULL(@Cntry, ''), ',') AS split_cd
                            WHERE split_cd.custpricetype IN(SELECT custpricetype
                            FROM dbo.rms_fn_commasplit(ISNULL(cty_cntry, ''), ',')))");
                    }
                    query.Append($@" ORDER BY en_GB {sortOrder};");
                }

                if (areaSearchEnabled)
                {
                    query.Append(@"SELECT area.area_cd, area.area_lat, area.area_long, area.act_inact_ind, area.area_aval, area.en_GB FROM
                      wkg_dstrbsn_loc_area_dtls area
					  Inner Join wkg_dstrbsn_loc_cty_dtls  cty on cty.cty_cd = area.area_cty
                      WHERE area.en_GB LIKE @Loc_nam AND area.act_inact_ind = @act_inact_ind AND area.area_aval = @Loc_prod_aval");

                    if (!string.IsNullOrEmpty(input.Cntry))
                    {
                        query.Append(@" AND EXISTS(
                            SELECT split_cd.custpricetype 
                            FROM dbo.rms_fn_commasplit(ISNULL(@Cntry, ''), ',') AS split_cd
                            WHERE split_cd.custpricetype IN (SELECT custpricetype 
                            FROM dbo.rms_fn_commasplit(ISNULL(cty.cty_cntry, ''), ',')))");
                    }
                    query.Append($@" ORDER BY area.en_GB {sortOrder};");
                }
                if (stationSearchEnabled)
                {
                    query.Append(@"SELECT stn.stn_cd, stn.stn_typ, stn.stn_addr, stn.stn_lat, stn.stn_long, stn.act_inact_ind, stn.stn_aval, stn.stn_nam, stn.stn_post FROM
                          wkg_dstrbsn_loc_stn_dtls  stn
						  Inner Join wkg_dstrbsn_loc_cty_dtls  cty on cty.cty_cd = stn.cty_cd
                     WHERE stn.stn_nam LIKE @Loc_nam AND stn.act_inact_ind = @act_inact_ind AND stn.stn_aval = @Loc_prod_aval");

                    if (!string.IsNullOrEmpty(input.Cntry))
                    {
                        query.Append(@" AND EXISTS(
                            SELECT split_cd.custpricetype 
                            FROM dbo.rms_fn_commasplit(ISNULL(@Cntry, ''), ',') AS split_cd
                            WHERE split_cd.custpricetype IN (SELECT custpricetype 
                            FROM dbo.rms_fn_commasplit(ISNULL(cty.cty_cntry, ''), ',')))");
                    }
                    query.Append($@" ORDER BY stn.stn_nam {sortOrder};");

                }

               
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query.ToString(), dbParamters);

                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM137LocationObject>();

                    int tableIndex = 0; 

                    
                    if (citySearchEnabled)
                    {
                        
                        if (DS.Tables.Count > tableIndex && DS.Tables[tableIndex] != null && DS.Tables[tableIndex].Rows.Count > 0)
                        {
                            foreach (DataRow r in DS.Tables[tableIndex].Rows)
                            {
                                SSM137LocationObject obj1 = new SSM137LocationObject();
                                obj1.stn_cd = r.GetValue<string>("cty_cd");
                                obj1.stn_typ = "City";
                                obj1.stn_nam = r.GetValue<string>("en_GB");
                                obj1.stn_addr = "";
                                obj1.stn_lat = r.GetValue<string>("cty_lat");
                                obj1.stn_long = r.GetValue<string>("cty_long");
                                obj1.stn_post = "";
                                obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                                obj1.stn_aval = r.GetValue<bool>("cty_aval");
                                tbl1.Add(obj1);
                            }
                        }
                        tableIndex++;
                    }

                   if (areaSearchEnabled)
                    {
                        if (DS.Tables.Count > tableIndex && DS.Tables[tableIndex] != null && DS.Tables[tableIndex].Rows.Count > 0)
                        {
                            foreach (DataRow r in DS.Tables[tableIndex].Rows)
                            {
                                SSM137LocationObject obj1 = new SSM137LocationObject();
                                obj1.stn_cd = r.GetValue<string>("area_cd");
                                obj1.stn_typ = "Area";
                                obj1.stn_nam = r.GetValue<string>("en_GB");
                                obj1.stn_addr = "";
                                obj1.stn_lat = r.GetValue<string>("area_lat");
                                obj1.stn_long = r.GetValue<string>("area_long");
                                obj1.stn_post = "";
                                obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                                obj1.stn_aval = r.GetValue<bool>("area_aval");
                                tbl1.Add(obj1);
                            }
                        }
                        tableIndex++; 
                    }

                  
                    if (stationSearchEnabled)
                    {
                        if (DS.Tables.Count > tableIndex && DS.Tables[tableIndex] != null && DS.Tables[tableIndex].Rows.Count > 0)
                        {
                            foreach (DataRow r in DS.Tables[tableIndex].Rows)
                            {
                                SSM137LocationObject obj1 = new SSM137LocationObject();
                                obj1.stn_cd = r.GetValue<string>("stn_cd");
                                obj1.stn_typ = r.GetValue<string>("stn_typ"); 
                                obj1.stn_nam = r.GetValue<string>("stn_nam");
                                obj1.stn_addr = r.GetValue<string>("stn_addr");
                                obj1.stn_lat = r.GetValue<string>("stn_lat");
                                obj1.stn_long = r.GetValue<string>("stn_long");
                                obj1.stn_post = r.GetValue<string>("stn_post");
                                obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                                obj1.stn_aval = r.GetValue<bool>("stn_aval"); 
                                tbl1.Add(obj1);
                            }
                        }
                        tableIndex++; 
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

        public async Task<OperationStatus> SSM137LocationSaveGrid(SessionInfo sessionInfo, SSM130Object input)
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
                    dbParamters.Add($"@stn_cd{i}", item.stn_cd.ToString());
                 
                    if(item.stn_typ.ToString().ToUpper() == "CITY")
                    {
                        querybuild.Append(@$"UPDATE wkg_dstrbsn_loc_cty_dtls set mod_dttm = GETDATE() , mod_by_usr_cd = @mod_by_usr_cd , act_inact_ind = @act_inact_ind{i} WHERE 
                                          cty_cd = @stn_cd{i};");
                    }
                    else if (item.stn_typ.ToString().ToUpper() == "AREA")
                    {
                        querybuild.Append(@$"UPDATE wkg_dstrbsn_loc_area_dtls set mod_dttm = GETDATE() , mod_by_usr_cd = @mod_by_usr_cd , act_inact_ind = @act_inact_ind{i} WHERE 
                                          area_cd = @stn_cd{i};");
                    }
                    else
                    {
                        querybuild.Append(@$"UPDATE wkg_dstrbsn_loc_stn_dtls set mod_dttm = GETDATE() , mod_by_usr_cd = @mod_by_usr_cd , act_inact_ind = @act_inact_ind{i} WHERE 
                                          stn_cd = @stn_cd{i};");
                    }
                    
                    
                    ++i;
                }
                query = querybuild.ToString();

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM137LocationSaveGrid)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM137LocationSaveGrid)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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


        #region Public Methods SSM138-Group Station Combinations

        public async Task<SSM138loadObject> SSM138OnloadAsync(SessionInfo sessionInfo, SSM138Object input)
        {
            var output = new SSM138loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@combi_nam", $"%{input.combi_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                List<SSM138Object> tbl1 = null;
                List<SSM138PosGroupObject> tbl2 = null;
                int totalrecords = 0;
                string query = "";
               
                //SSM138 onload retrives station combo srch dtls and records for grid

                query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY Combi.combi_nam ) AS cnt ,combi_nam,pos_grp_ids ,
                           combi_srl,act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_dstrbsn_loc_stn_combi_srch_dtls Combi 
                           where Combi.act_inact_ind=@act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;
                          
                          SELECT pos_grp_id , pos_grp_nam ,act_inact_ind FROM wkg_pos_grp_mast;";

                           
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM138Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {

                        totalrecords = r.GetValue<int>("total_count");
                        SSM138Object obj1 = new SSM138Object();

                        obj1.combi_nam = r.GetValue<string>("combi_nam");
                        obj1.combi_srl = r.GetValue<string>("combi_srl");
                        obj1.pos_grp_ids = r.GetValue<string>("pos_grp_ids");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM138PosGroupObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM138PosGroupObject obj2 = new SSM138PosGroupObject();
                        obj2.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj2.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj2.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl2.Add(obj2);
                    }
                }
                output.Items = tbl1;
                output.PosGrpItem = tbl2;
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

        public async Task<SSM138loadObject> SSM138GetSearchAsync(SessionInfo sessionInfo, SSM138Object input)
        {
            var output = new SSM138loadObject();
            try
            {

                var dbParamters = new DBParameters();
                dbParamters.Add("@combi_nam", $"%{input.combi_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                List<SSM138Object> tbl1 = null;
                int totalrecords = 0;
                string query = "";
                string sortstring = "";
                if (input.SortTyp != null)
                {
                    sortstring += $"Combi.combi_nam {(input.SortTyp ?? false ? "ASC" : "DESC")}";
                }

                //SSM138 search records for grid

                query = $@"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY {sortstring}) 
                           AS cnt ,combi_nam,pos_grp_ids,combi_srl,act_inact_ind, COUNT(*) OVER () AS total_count FROM 
                           wkg_dstrbsn_loc_stn_combi_srch_dtls Combi WHERE Combi.combi_nam LIKE @combi_nam AND Combi.act_inact_ind=@act_inact_ind) AS temp 
                           WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM138Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        
                        totalrecords = r.GetValue<int>("total_count");
                        SSM138Object obj1 = new SSM138Object();

                        obj1.combi_nam = r.GetValue<string>("combi_nam");
                        obj1.combi_srl = r.GetValue<string>("combi_srl");
                        obj1.pos_grp_ids = r.GetValue<string>("pos_grp_ids");
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

        public async Task<SSM138loadObject> SSM138GetSelectAsync(SessionInfo sessionInfo, SSM138Object input)
        {
            var output = new SSM138loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@combi_srl", $"{input.combi_srl}");
                List<SSM138Object> tbl1 = null;
                string query = "";

                //SSM138 get details for selected data to edit

                query = @"SELECT  Combi.combi_srl,  Combi.combi_nam,Combi.act_inact_ind,Combi.pos_grp_ids,
                ISNULL(
                (SELECT STRING_AGG(CAST(stn.stn_cd AS VARCHAR) + '/' + stn.stn_nam + ' - ' + cty.en_GB + ' ' + cty.cty_cntry,',')
                FROM wkg_dstrbsn_loc_stn_dtls AS stn
                INNER JOIN wkg_dstrbsn_loc_cty_dtls AS cty ON cty.cty_cd = stn.cty_cd
                WHERE stn.stn_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(Combi.dprt_stn_cds,''), ','))), '') AS dprt_stn_cds,        
                ISNULL(
                (SELECT STRING_AGG(CAST(stn.stn_cd AS VARCHAR) + '/' + stn.stn_nam + ' - ' + cty.en_GB + ' ' + cty.cty_cntry,',')
                FROM wkg_dstrbsn_loc_stn_dtls AS stn
                INNER JOIN wkg_dstrbsn_loc_cty_dtls AS cty ON cty.cty_cd = stn.cty_cd
                WHERE stn.stn_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(Combi.arvl_stn_cds,''), ','))), '') AS arvl_stn_cds, 
                emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                REPLACE(CONVERT(VARCHAR,Combi.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),Combi.mod_dttm,108) AS mod_dttm
                FROM wkg_dstrbsn_loc_stn_combi_srch_dtls AS Combi
                INNER JOIN rps_usr_mast AS usr ON usr.Usr_id = Combi.mod_by_usr_cd
                INNER JOIN rps_emp_mast AS emp ON emp.emp_cd = usr.emp_cd
                WHERE Combi.combi_srl = @combi_srl;";
                        

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM138Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM138Object obj1 = new SSM138Object();

                        obj1.combi_srl = r.GetValue<string>("combi_srl");
                        obj1.combi_nam = r.GetValue<string>("combi_nam");
                        obj1.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj1.pos_grp_ids = r.GetValue<string>("pos_grp_ids");
                        obj1.dprt_stn_cds = r.GetValue<string>("dprt_stn_cds");
                        obj1.arvl_stn_cds = r.GetValue<string>("arvl_stn_cds");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");

                        tbl1.Add(obj1);
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

        public async Task<OperationStatus> SSM138SaveDataAsync(SessionInfo sessionInfo, SSM138Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@combi_srl", input.combi_srl.ToString());
                dbParamters.Add("@combi_nam", input.combi_nam.ToString());
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@pos_grp_ids", input.pos_grp_ids.ToString());
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd.ToString());
                dbParamters.Add("@dprt_stn_cds", input?.dprt_stn_cds?.ToString());
                dbParamters.Add("@arvl_stn_cds", input?.arvl_stn_cds?.ToString());

                StringBuilder query = new StringBuilder();

                if (input.Mode == "UPDATE")
                {
                    //SSM138 Update query for wkg_dstrbsn_loc_stn_combi_srch_dtls station & combinations
                    query.Append(@"UPDATE wkg_dstrbsn_loc_stn_combi_srch_dtls SET 
                     combi_nam=@combi_nam, act_inact_ind=@act_inact_ind,
                     pos_grp_ids=@pos_grp_ids, dprt_stn_cds=@dprt_stn_cds, arvl_stn_cds=@arvl_stn_cds,
                     mod_by_usr_cd=@mod_by_usr_cd, mod_dttm=getdate() WHERE combi_srl=@combi_srl;");
                }
                else if (input.Mode == "INSERT")
                {
                    //SSM138 Build insert query for wkg_dstrbsn_loc_stn_combi_srch_dtls station & combinations
                    query.Append(@"INSERT INTO wkg_dstrbsn_loc_stn_combi_srch_dtls(combi_nam, pos_grp_ids, act_inact_ind,
                            dprt_stn_cds, arvl_stn_cds, mod_dttm, mod_by_usr_cd)
                          VALUES(@combi_nam, @pos_grp_ids, @act_inact_ind, @dprt_stn_cds, @arvl_stn_cds,
                          getdate(), @mod_by_usr_cd);");
                }

                using (var dbService = this.GetDBService(true))
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        try
                        {
                            await dbService.ExecuteSqlCommandAsync(query.ToString(), dbParamters);
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM138SaveDataAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM138SaveDataAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            output.Message = "Something went wrong";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo?.ToJsonText()}, Input : {input?.ToJsonText()}");
            }
            return output;
        }


        #endregion
    }
}

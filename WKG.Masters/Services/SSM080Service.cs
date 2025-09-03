using Microsoft.AspNetCore.Http;
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
    public class SSM080Service : WKLServiceManger, ISSM080Service
    {
        #region Constructor
        public SSM080Service(IServiceProvider serviceProvider, ILogger<SSM080Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Public Methods SSM080
        public async Task<SSM060LoadObject> SSM080GetOnloadSrch(SessionInfo sessionInfo, SSM060Object input)
        {
            var output = new SSM060LoadObject();
            try
            {
                List<SSM060Object> tbl1 = null;

                var dbParamters = new DBParameters();
                dbParamters.Add("@lp_prod_nam", $"%{input.lp_prod_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.LondonPass);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM080 Onload and Search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY lp_prod_nam" : "ORDER BY lp_prod_nam DESC")}) 
                                  AS cnt,lp.lp_prod_id,ISNULL(lang.prod_nam, lp.lp_prod_nam) AS lp_prod_nam,lp.adult_aval,lp.child_aval,
                                  lp.act_inact_ind,COUNT(*) OVER () AS total_count FROM wkg_lp_prod_dtl lp LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang 
                                  lang ON lang.prod_id = lp.lp_prod_id AND lang.supp_map_id = @supp_map_id AND lang.lang_cd='en-GB' WHERE  lp.lp_prod_nam 
                                  LIKE @lp_prod_nam AND lp.act_inact_ind = @act_inact_ind AND lp.lp_prod_typ = @lp_prod_typ) 
                                  AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT supp_map_id, supp_ftp_img_dir FROM wkg_supp_config WHERE supp_map_id = @supp_map_id;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM060Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM060Object obj1 = new SSM060Object();
                        totalrecords = r.GetValue<int>("total_count");

                        obj1.lp_prod_id = r.GetValue<string>("lp_prod_id");
                        obj1.lp_prod_nam = r.GetValue<string>("lp_prod_nam");
                        obj1.adult_aval = r.GetValue<string>("adult_aval");
                        obj1.child_aval = r.GetValue<string>("child_aval");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");

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
        public async Task<SSM060LoadObject> SSM081OnLoadDataAsync(SessionInfo sessionInfo, SSM060Object input)
        {

            var output = new SSM060LoadObject();
            try
            {

                List<SSM061GridObject> tbl1 = null;
                SSM060Object tbl2 = null;
                SSM060Object tbl3 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@lp_prod_id", input.lp_prod_id);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                // SSM081 Edit Onload.retrives records from wkg_supp_prod_ovrd
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY exlang.prod_nam ) AS cnt , exlang.prod_id,
                                  exlang.lang_cd, LNG.lang_nam, exlang.prod_nam ,COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn_lang
                                  exlang INNER JOIN wkg_pos_accptd_lang LNG ON exlang.lang_cd = LNG.lang_cd WHERE exlang.prod_id =@lp_prod_id) 
                                  AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;
                                  select adult_aval,adult_price,child_aval,child_price,sort_ordr,act_inact_ind from
                                  wkg_lp_prod_dtl where lp_prod_id = @lp_prod_id AND lp_prod_typ = @lp_prod_typ;
                                  SELECT ovrd_srl,bkng_fee,bkng_fee_typ FROM wkg_supp_prod_ovrd WHERE prod_id = @lp_prod_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM061GridObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM061GridObject Grid = new SSM061GridObject();
                        Grid.lp_prod_id = r.GetValue<string>("prod_id");
                        Grid.lang_cd = r.GetValue<string>("lang_cd");
                        Grid.lang_nam = r.GetValue<string>("lang_nam");
                        Grid.lp_prod_nam = r.GetValue<string>("prod_nam");

                        tbl1.Add(Grid);

                    }
                    tbl2 = new SSM060Object();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM060Object Grid = new SSM060Object();
                        Grid.adult_aval = r.GetValue<string>("adult_aval");
                        Grid.adult_price = r.GetValue<string>("adult_price");
                        Grid.child_aval = r.GetValue<string>("child_aval");
                        Grid.child_price = r.GetValue<string>("child_price");
                        Grid.sort_ordr = r.GetValue<string>("sort_ordr");
                        Grid.act_inact_ind = r.GetValue<string>("act_inact_ind");

                        tbl2 = Grid;

                    }
                    tbl3 = new SSM060Object();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM060Object Grid = new SSM060Object();
                        Grid.ovrd_srl = r.GetValue<string>("ovrd_srl");
                        Grid.bkng_fee = r.GetValue<string>("bkng_fee");
                        Grid.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");

                        tbl3 = Grid;
                    }
                }

                output.EditGrid = tbl1;
                output.PrdDtl = tbl2;
                output.PrdOvrdDtl = tbl3;
                output.radios = StaticData.Common.BookingFeeType;

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

        public async Task<SSM034TableFields> SSM082LoadInitData(SessionInfo sessionInfo, SSM034TableFields input)
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
                //SSM082 Exception onload query
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam) AS cnt, gpm.pos_grp_nam,gxc.excptn_srl,
                                  gxc.wkg_markup,gxc.wkg_markup_typ,gxc.act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn 
                                  gxc Inner Join wkg_pos_grp_mast gpm on gpm.pos_grp_id = gxc.pos_grp_id WHERE gxc.act_inact_ind = 1 AND 
                                  gxc.prod_id = @prod_id AND gxc.supp_map_id = @supp_map_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;
                                  select pos_grp_id,pos_grp_nam,act_inact_ind from wkg_pos_grp_mast;";
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
                    output.radios = StaticData.Common.BookingFeeType;
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        var temp = new SSM034TableFields
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

        public async Task<SSM034TableFields> SSM082BlurAsync(SessionInfo sessionInfo, SSM034TableFields input)
        {
            var output = new SSM034TableFields();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_id", input.prod_id);
                //SSM082 Exception.checks if record exists for specified lang_cd in wkg_supp_prod_grp_excptn
                string query = @"select excptn_srl from wkg_supp_prod_grp_excptn where pos_grp_id = @pos_grp_id AND prod_id = @prod_id
                                  AND supp_map_id = @supp_map_id;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM034TableFields>(query, dbParamters, r =>
                {
                    return new SSM034TableFields
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
        public async Task<PageInfo<SSM034TableFields>> SSM082SearchData(SessionInfo sessionInfo, SSM034TableFields input)
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
                //SSM082 Exception search
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam {(input.sortType ? "ASC" : "DESC")}) AS cnt, gpm.pos_grp_nam,gxc.excptn_srl,
                                  gxc.wkg_markup,gxc.wkg_markup_typ,gxc.act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_supp_prod_grp_excptn gxc
                                  Inner Join wkg_pos_grp_mast gpm on gpm.pos_grp_id = gxc.pos_grp_id WHERE {(input.pos_grp_id == "" ? "" : "gxc.pos_grp_id = @pos_grp_id AND ")}
                                  gxc.act_inact_ind=@act_inact_ind AND gxc.supp_map_id = @supp_map_id AND gxc.act_inact_ind = @act_inact_ind AND prod_id = @prod_id)
                                  AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
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
        public async Task<SSM034TableFields> SSM082LoadSelectedData(SessionInfo sessionInfo, SSM034TableFields input)
        {
            var output = new SSM034TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@excptn_srl", input.excptn_srl);
                //SSM082 Exception load selected data
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
        public async Task<SSM020Object> SSM083GetOnloadData(SessionInfo sessionInfo, SSM060Object input)
        {
            var output = new SSM020Object();
            try
            {
                List<SSM020CmbRsltColl> tbl1 = null;
                List<SSM020Newdatasectwo> tbl2 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@lp_prod_id", input.lp_prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@lang_cd", input.lang_cd);
                //SSM083 retrives records from wkg_supp_prod_grp_excptn_lang for specific lp_prod_id
                string query = @"SELECT lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';
                                 SELECT lang_srl, prod_id, lang_cd, prod_nam, REPLACE(CONVERT(VARCHAR, lng.mod_dttm, 106), ' ', '-')
                                 + ' ' + CONVERT(VARCHAR(5), lng.mod_dttm, 108) AS mod_dttm, emp.emp_fname + ' ' + emp.emp_lname AS 
                                 mod_by_usr_cd FROM wkg_supp_prod_grp_excptn_lang lng INNER JOIN rps_usr_mast usr ON usr.Usr_id = lng.mod_by_usr_cd 
                                 INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd  WHERE lng.prod_id= @lp_prod_id AND lng.lang_cd= @lang_cd
                                 AND lng.supp_map_id=@supp_map_id;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM020CmbRsltColl>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM020CmbRsltColl lang = new SSM020CmbRsltColl();
                        lang.lang_cd = r.GetValue<string>("lang_cd");
                        lang.lang_nam = r.GetValue<string>("lang_nam");

                        tbl1.Add(lang);

                    }
                    tbl2 = new List<SSM020Newdatasectwo>();
                    foreach (DataRow DR2 in DS.Tables[1].Rows)
                    {
                        SSM020Newdatasectwo obj2 = new SSM020Newdatasectwo();
                        obj2.lang_srl = DR2.GetValue<string>("lang_srl");
                        obj2.prod_id = DR2.GetValue<string>("prod_id");
                        obj2.lang_cd = DR2.GetValue<string>("lang_cd");
                        obj2.prod_nam = DR2.GetValue<string>("prod_nam");
                        obj2.mod_by_usr_cd = DR2.GetValue<string>("mod_by_usr_cd");
                        obj2.mod_dttm = DR2.GetValue<string>("mod_dttm");
                        tbl2.Add(obj2);
                    }
                }
                SSM020Object obj = new SSM020Object();
                obj.Lng_cmb_rslt = tbl1;
                obj.Nwrsltsec = tbl2;
                output = obj;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<SSM020Object> SSM083OnBlurSearch(SessionInfo sessionInfo, SSM020Object input)
        {
            var output = new SSM020Object();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@prod_id", $"{input.prod_id}");
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");

                //SSM083 checks if record exists in wkg_supp_prod_grp_excptn_lang for specified lang_cd and lp_prod_id
                string query = @"select lang_srl,prod_id,lang_cd from wkg_supp_prod_grp_excptn_lang where prod_id = @prod_id and
                                 lang_cd = @lang_cd and supp_map_id = @supp_map_id; ";

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
        public async Task<SSM064loadObject> SSM084OnLoadData(SessionInfo sessionInfo, SSM064GridObject input)
        {
            var output = new SSM064loadObject();
            try
            {
                List<SSM064GridObject> tbl1 = null;
                List<SSM064Image> tbl2 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@lp_prod_id", input.lp_prod_id);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.LondonPass);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM084 retrives records from wkg_lp_prod_info for grid and get image details in onload
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY info.lp_info_head ) AS cnt , info.lp_srl, info.lang_cd, LNG.lang_nam, 
                                 info.lp_info_head ,info.lp_prod_nam,COUNT(*) OVER () AS total_count FROM wkg_lp_prod_info info INNER JOIN wkg_pos_accptd_lang 
                                 LNG ON info.lang_cd = LNG.lang_cd WHERE info.lp_prod_typ=@lp_prod_typ) AS temp WHERE temp.cnt  BETWEEN @startrow AND @endrow;
                                 select (SELECT ftp_supp_img_url FROM wkg_cntrl_param_mast) + LOWER(img.img_dir) + '/' + img.img_nam AS 'img_url', img.img_nam , 
                                 img.img_srl,img.prod_id,img.supp_map_id  from wkg_img_dtls img where prod_id=(SELECT prod_id FROM wkg_supp_config WHERE supp_map_id=@supp_map_id) AND
                                 act_inact_ind = 1 AND lp_prod_typ = @lp_prod_typ;
                                 SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir AND lp_prod_typ = @lp_prod_typ;
                                 SELECT prod_id FROM wkg_supp_config WHERE supp_map_id=@supp_map_id;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM064GridObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM064GridObject Grid = new SSM064GridObject();
                        Grid.lp_srl = r.GetValue<string>("lp_srl");
                        Grid.lang_cd = r.GetValue<string>("lang_cd");
                        Grid.lang_nam = r.GetValue<string>("lang_nam");
                        Grid.lp_prod_nam = r.GetValue<string>("lp_prod_nam");
                        Grid.lp_info_head = r.GetValue<string>("lp_info_head");

                        tbl1.Add(Grid);
                    }
                    tbl2 = new List<SSM064Image>();
                    var ftpService = GetService<IFileManagerService>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM064Image Img = new SSM064Image();
                        Img.img_srl = r.GetValue<string>("img_srl");
                        Img.img_nam = r.GetValue<string>("img_nam");
                        Img.img_url = !string.IsNullOrEmpty(Img.img_nam) ? await ftpService.ReadFileAsync(r.GetValue<string>("img_url"), Img.img_nam) :"";
                        Img.prod_id = r.GetValue<string>("prod_id");
                        Img.supp_map_id = r.GetValue<string>("supp_map_id");

                        tbl2.Add(Img);
                    }
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");
                    }
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        output.lp_prod_id = r.GetValue<string>("prod_id");
                    }
                }
                output.EditGrid = tbl1;
                output.Image = tbl2;
                output.LP_Prod_Type = StaticData.Common.LP_Prod_Type;

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
        public async Task<SSM064loadObject> SSM085GetOnloadData(SessionInfo sessionInfo, SSM064GridObject input)
        {
            var output = new SSM064loadObject();
            try
            {
                List<SSM020CmbRsltColl> tbl1 = null;
                List<SSM064GridObject> tbl2 = null;
                List<SSM065NoteObject> tbl3 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@lp_srl", input.lp_srl);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                //SSM085 retrives records from wkg_lp_prod_info and wkg_lp_prod_note_dtls in onload
                string query = @"SELECT lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';
                                 SELECT lp_srl, lp_info_head, lang_cd, lp_info_desc,lp_prod_nam, REPLACE(CONVERT
                                 (VARCHAR, info.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), info.mod_dttm,
                                 108) AS mod_dttm, emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_lp_prod_info 
                                 info INNER JOIN rps_usr_mast usr ON usr.Usr_id = info.mod_by_usr_cd 
                                 INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE info.lp_srl=@lp_srl AND 
                                 info.lang_cd=@lang_cd AND info.lp_prod_typ = @lp_prod_typ;
                                 select note_srl,note,lp_srl,sort_ordr from wkg_lp_prod_note_dtls where lp_srl = @lp_srl;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM020CmbRsltColl>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM020CmbRsltColl lang = new SSM020CmbRsltColl();
                        lang.lang_cd = r.GetValue<string>("lang_cd");
                        lang.lang_nam = r.GetValue<string>("lang_nam");
                        tbl1.Add(lang);
                    }
                    tbl2 = new List<SSM064GridObject>();
                    foreach (DataRow DR2 in DS.Tables[1].Rows)
                    {
                        SSM064GridObject obj2 = new SSM064GridObject();
                        obj2.lp_srl = DR2.GetValue<string>("lp_srl");
                        obj2.lp_info_head = DR2.GetValue<string>("lp_info_head");
                        obj2.lang_cd = DR2.GetValue<string>("lang_cd");
                        obj2.lp_info_desc = DR2.GetValue<string>("lp_info_desc");
                        obj2.lp_prod_nam = DR2.GetValue<string>("lp_prod_nam");
                        obj2.mod_by_usr_cd = DR2.GetValue<string>("mod_by_usr_cd");
                        obj2.mod_dttm = DR2.GetValue<string>("mod_dttm");
                        tbl2.Add(obj2);
                    }
                    tbl3 = new List<SSM065NoteObject>();
                    foreach (DataRow DR2 in DS.Tables[2].Rows)
                    {
                        SSM065NoteObject obj3 = new SSM065NoteObject();
                        obj3.note_srl = DR2.GetValue<string>("note_srl");
                        obj3.lp_srl = DR2.GetValue<string>("lp_srl");
                        obj3.note = DR2.GetValue<string>("note");
                        obj3.sort_ordr = DR2.GetValue<string>("sort_ordr");
                        tbl3.Add(obj3);
                    }
                }
                output.LangList = tbl1;
                output.EditGrid = tbl2;
                output.Notes = tbl3;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SSM064GridObject> SSM085OnBlurSearch(SessionInfo sessionInfo, SSM064GridObject input)
        {
            var output = new SSM064GridObject();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);

                //SSM085 checks if records exists in wkg_lp_prod_info for specified lang_cd
                string query = @"select lp_srl, lang_cd from wkg_lp_prod_info  where lang_cd=@lang_cd AND lp_prod_typ =@lp_prod_typ;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM064GridObject>(query, dbParamters, r =>
                {
                    return new SSM064GridObject
                    {
                        lp_srl = r.GetValue<string>("lp_srl"),
                        lang_cd = r.GetValue<string>("lang_cd"),
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
        public async Task<OperationStatus> SSM080SaveExcDataAsync(SessionInfo sessionInfo, SSM062Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();

                dbParamters.Add("@excptn_srl", input.excptn_srl);
                dbParamters.Add("@prod_id", input.lp_prod_id);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@wkg_markup", input.wkg_markup);
                dbParamters.Add("@wkg_markup_typ", input.wkg_markup_typ);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                string query = "";
                if (input.Mode == "EXUPDATE")
                {   //SSM082 Insert to wkg_supp_prod_grp_excptn
                    query = @"UPDATE wkg_supp_prod_grp_excptn
                              SET prod_id = @prod_id, pos_grp_id = @pos_grp_id, wkg_markup = @wkg_markup,
                              wkg_markup_typ = @wkg_markup_typ,act_inact_ind = @act_inact_ind,sort_ordr = @sort_ordr,
                              mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE() WHERE excptn_srl = @excptn_srl;";
                }
                else if (input.Mode == "EXINSERT")
                {   //SSM082 Update to wkg_supp_prod_grp_excptn
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn (prod_id, supp_map_id, pos_grp_id, wkg_markup, wkg_markup_typ, sort_ordr, act_inact_ind, mod_by_usr_cd, mod_dttm)
                              VALUES (@prod_id, @supp_map_id, @pos_grp_id, @wkg_markup, @wkg_markup_typ, @sort_ordr, @act_inact_ind, @mod_by_usr_cd, GETDATE());";
                }
                else
                {
                    string Imagequery = "";
                    int i = 1;
                    foreach (var item in Loopdata)
                    {
                        if (item.act_inact_ind.ToString().ToUpper() == "ACTIVE")
                        {   //Change mod_dttm in wkg_img_dtls while update in wkg_lp_prod_dtl
                            Imagequery = @"UPDATE wkg_img_dtls set mod_dttm = GETDATE() WHERE prod_id = 
                                           (SELECT prod_id FROM wkg_supp_config WHERE supp_map_id=@supp_map_id) AND supp_map_id = @supp_map_id 
                                           AND act_inact_ind = 1 AND lp_prod_typ = @lp_prod_typ;";
                        }
                        dbParamters.Add($"@act_inact{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                        dbParamters.Add($"@prod_id{i}", item.lp_prod_id.ToString());
                        //int act_inact = item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0;
                        //string prod_id = item.lp_prod_id.ToString();
                        valuesBuilder.Append($"(@act_inact{i},@prod_id{i}),");
                        ++i;
                    }
                    valuesBuilder.Length -= 1;
                    string valuesClause = valuesBuilder.ToString();
                    //SSM080 Update to wkg_lp_prod_dtl
                    query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(),mod_by_usr_cd = @mod_by_usr_cd
                               FROM wkg_lp_prod_dtl AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) ON
                               SRC.col1 = TRGT.lp_prod_id;";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM080SaveExcDataAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM080SaveExcDataAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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
        public async Task<OperationStatus> SSM081SaveDataAsync(SessionInfo sessionInfo, SSM060Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lp_prod_id", input.lp_prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@adult_aval", input.adult_aval);
                dbParamters.Add("@adult_price", input.adult_price);
                dbParamters.Add("@child_aval", input.child_aval);
                dbParamters.Add("@child_price", input.child_price);
                //dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                dbParamters.Add("@bkng_fee", input.bkng_fee);
                dbParamters.Add("@bkng_fee_typ", input.bkng_fee_typ);
                //SSM081 Edit save.Update in wkg_lp_prod_dtl and Insert or Update in wkg_supp_prod_ovrd 
                string query = @$"UPDATE wkg_lp_prod_dtl SET sort_ordr = @sort_ordr, adult_aval = @adult_aval, adult_price = @adult_price,child_aval = @child_aval,
                                  child_price = @child_price,mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() WHERE lp_prod_id = @lp_prod_id;
                                  {((input.ovrd_srl != "") ? @"UPDATE wkg_supp_prod_ovrd SET bkng_fee = @bkng_fee,bkng_fee_typ = @bkng_fee_typ WHERE
                                  ovrd_srl = @ovrd_srl;" :@"INSERT INTO wkg_supp_prod_ovrd (prod_id, supp_map_id, bkng_fee, bkng_fee_typ,mod_by_usr_cd,
                                  mod_dttm)VALUES (@lp_prod_id, @supp_map_id, @bkng_fee, @bkng_fee_typ,@mod_by_usr_cd,GETDATE());")}";


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
        public async Task<OperationStatus> SSM083SaveDataAsync(SessionInfo sessionInfo, SSM062Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@lang_srl", input.lang_srl);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@prod_nam", input.prod_nam);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.Mode == "INSERT")
                {  //SSM083 Insert to wkg_supp_prod_grp_excptn_lang
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn_lang (prod_id, supp_map_id, lang_cd, prod_nam,mod_by_usr_cd, mod_dttm)
                              VALUES (@prod_id,@supp_map_id,@lang_cd,@prod_nam,@mod_by_usr_cd, GETDATE());";
                }
                else
                {   //SSM083 Update to wkg_supp_prod_grp_excptn_lang
                    query = @"UPDATE wkg_supp_prod_grp_excptn_lang SET supp_map_id = @supp_map_id,lang_cd = @lang_cd,
                              prod_nam = @prod_nam,mod_by_usr_cd =@mod_by_usr_cd,mod_dttm = GETDATE() 
                              WHERE lang_srl = @lang_srl AND prod_id = @prod_id;";
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
        public async Task<OperationStatus> SSM084SaveImageData(SessionInfo sessionInfo, SSM064Image input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@img_srl", input.img_srl);
                dbParamters.Add("@img_srl_old", input.img_srl_old);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                if (input.ImageChanged == "YES" && input.OldImg == "NO" && input.img_nam != "")
                {
                    if (files != null)
                    {
                        var tourser = this.GetService<IFileManagerService>();
                        var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });
                    }
                }
                string query = "";
                if (input.Mode == "INSERT")
                {
                    if (input.OldImg == "YES")
                    {   //SSM084 Update wkg_img_dtls while using the old image
                        query = "UPDATE wkg_img_dtls SET act_inact_ind=1 WHERE img_srl= @img_srl_old;";
                    }
                    else
                    {   //SSM084 Insert to wkg_img_dtls
                        query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                  mod_by_usr_cd,mod_dttm,lp_prod_typ)VALUES (@img_nam,@img_dir,
                                  (SELECT prod_id FROM wkg_supp_config WHERE supp_map_id=@supp_map_id),@supp_map_id,1 ,@mod_by_usr_cd,getdate(),@lp_prod_typ);";
                    }
                }
                else if (input.Mode == "UPDATE")
                {
                    if (input.OldImg == "NO")
                    {
                        if (input.img_nam == "")
                        {    //SSM084 Update to wkg_img_dtls
                            query = "UPDATE wkg_img_dtls SET act_inact_ind=0 WHERE img_srl= @img_srl;";
                        }
                        else
                        {    //SSM084 Update wkg_img_dtls using the old image
                            query = @"UPDATE wkg_img_dtls SET act_inact_ind=0 WHERE img_srl= @img_srl;
                                      INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                      mod_by_usr_cd,mod_dttm,lp_prod_typ) VALUES (@img_nam,@img_dir,
                                      (SELECT prod_id FROM wkg_supp_config WHERE supp_map_id=@supp_map_id),@supp_map_id,1 ,@mod_by_usr_cd,getdate(),@lp_prod_typ);";
                        }
                    }
                    else if (input.OldImg == "YES")
                    {   //SSM084 Update to wkg_img_dtls
                        query = @"UPDATE wkg_img_dtls SET act_inact_ind=1 WHERE img_srl= @img_srl_old;
                                  UPDATE wkg_img_dtls SET act_inact_ind=0 WHERE img_srl= @img_srl;";
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
        public async Task<OperationStatus> SSM085SaveDataAsync(SessionInfo sessionInfo, SSM064GridObject input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();
                dbParamters.Add("@lang_cd", input.lang_cd);
                dbParamters.Add("@lp_info_head", input.lp_info_head);
                dbParamters.Add("@lp_prod_nam", input.lp_prod_nam);
                dbParamters.Add("@lp_info_desc", input.lp_info_desc);
                dbParamters.Add("@lp_srl", input.lp_srl);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                dbParamters.Add("@lp_prod_typ", StaticData.Common.LP_Prod_Type["ExplorerPass"]);
                string query = "";
                string querynote = "";
                if (input.InfoChanged == "YES")
                {
                    if (input.Mode == "INSERT")
                    {   //SSM085 Insert to wkg_lp_prod_info
                        query = @"INSERT INTO wkg_lp_prod_info (lang_cd, lp_info_head, lp_info_desc,lp_prod_nam, mod_by_usr_cd, mod_dttm,lp_prod_typ) 
                                  VALUES (@lang_cd,@lp_info_head,@lp_info_desc,@lp_prod_nam,@mod_by_usr_cd, GETDATE(),@lp_prod_typ);";
                    }
                    else if (input.Mode == "UPDATE")
                    {   //SSM085 Update to wkg_lp_prod_info
                        query = @"UPDATE wkg_lp_prod_info SET lp_info_head = @lp_info_head,lp_info_desc = @lp_info_desc,lp_prod_nam=@lp_prod_nam,
                                  mod_by_usr_cd =@mod_by_usr_cd,mod_dttm = GETDATE() WHERE lp_srl = @lp_srl AND lang_cd = @lang_cd AND lp_prod_typ =@lp_prod_typ;";
                    }
                }
                if (input.NotesChanged == "YES")
                {
                    int i = 1;
                    foreach (var item in Loopdata)
                    {
                        dbParamters.Add($"@sort_ordr{i}", item.sort_ordr.ToString());
                        dbParamters.Add($"@note{i}", item.note.ToString());
                        //string sort = item.sort_ordr.ToString();
                        //string note = item.note.ToString().Replace("'", "''");
                        //string lpsrl = input.lp_srl;
                        if (item.note_srl == "")
                        {
                            if (input.Mode == "INSERT")
                            {   //SSM085 Insert in wkg_lp_prod_note_dtls when Insert in wkg_lp_prod_info 
                                querynote += @$"INSERT wkg_lp_prod_note_dtls  (lp_srl,note, sort_ordr,mod_by_usr_cd, mod_dttm, lp_prod_typ) 
                                                VALUES ((SELECT MAX(lp_srl) FROM wkg_lp_prod_info),@note{i},@sort_ordr{i},@mod_by_usr_cd,GETDATE(),@lp_prod_typ);";
                            }
                            else
                            {   //SSM085 Insert in wkg_lp_prod_note_dtls when Update in wkg_lp_prod_info
                                querynote += @$"INSERT wkg_lp_prod_note_dtls  (lp_srl,note, sort_ordr,mod_by_usr_cd, mod_dttm, lp_prod_typ)
                                                VALUES (@lp_srl,@note{i},@sort_ordr{i},@mod_by_usr_cd,GETDATE(),@lp_prod_typ);";
                            }
                        }
                        else
                        {   //SSM085 Update to wkg_lp_prod_note_dtls
                            dbParamters.Add($"@note_srl{i}", item.note_srl.ToString());
                            querynote += @$"UPDATE wkg_lp_prod_note_dtls SET note = @note{i}, sort_ordr = @sort_ordr{i}, 
                                            mod_dttm = GETDATE(),mod_by_usr_cd = @mod_by_usr_cd WHERE note_srl = @note_srl{i};";
                        }
                        ++i;
                    }
                }
                query += querynote;
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
        public async Task<OperationStatus> SSM085DeleteData(SessionInfo sessionInfo, SSM064GridObject input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@note_srl", input.note_srl);
                //SSM085 Delete record from wkg_lp_prod_note_dtls specified by note_srl
                string query = "DELETE FROM wkg_lp_prod_note_dtls WHERE note_srl = @note_srl;";

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

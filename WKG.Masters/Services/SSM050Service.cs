using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
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
    public class SSM050Service : WKLServiceManger, ISSM050Service
    {
        #region Constructor
        public SSM050Service(IServiceProvider serviceProvider, ILogger<SSM050Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Private Methods

        #endregion

        #region Public Methods SSM050


        public async Task<SSM050loadObject> GetOnloadSrchprod(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM050loadObject();
            try
            {
                List<SSM050Object> tbl1 = null;

                var dbParamters = new DBParameters();
                dbParamters.Add("@bg_prod_nam", $"%{input.bg_prod_nam}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@bg_prod_aval", input.bg_prod_aval == "true" ? "1" : "0");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.Bigbus);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM050 Onload and Search.retrives records from the wkg_bg_prod_dtl
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY prd.bg_prod_nam" : "ORDER BY prd.bg_prod_nam DESC")}) AS cnt,
                                  prd.bg_prod_id,prd.lang_cd,ISNULL(lang.prod_nam,prd.bg_prod_nam) bg_prod_nam,
                                  prd.bg_prod_dtls,prd.act_inact_ind,prd.bg_prod_aval,prd.mod_by_usr_cd,prd.mod_dttm,
                                  COUNT(*) OVER () AS total_count FROM wkg_bg_prod_dtl prd left outer join 
                                  wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=prd.bg_prod_id AND 
                                  lang.supp_map_id=@supp_map_id AND lang.lang_cd= @lang_cd WHERE  prd.bg_prod_nam LIKE @bg_prod_nam 
                                  AND prd.act_inact_ind= @act_inact_ind AND prd.bg_prod_aval = @bg_prod_aval AND 
                                  prd.lang_cd=@lang_cd) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT supp_ftp_img_dir,supp_map_id FROM wkg_supp_config WHERE supp_map_id=@supp_map_id;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM050Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM050Object obj1 = new SSM050Object();
                        totalrecords = r.GetValue<int>("total_count");
                        obj1.bg_prod_id = r.GetValue<string>("bg_prod_id");
                        obj1.bg_prod_nam = r.GetValue<string>("bg_prod_nam");
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.bg_prod_aval = r.GetValue<string>("bg_prod_aval");
                        obj1.bg_prod_dtls = r.GetValue<string>("bg_prod_dtls");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.BigbusSuppID = r.GetValue<string>("supp_map_id");
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

        public async Task<SSM050loadObject> SSM051Gridbinding(SessionInfo sessionInfo, SSM050Object input)
        {

            var output = new SSM050loadObject();
            try
            {

                List<SSM050GridExpLang> ExpLang = null;
                List<SSM050Imagedata> Imgdata = null;
                List<SSM051Overrides> Overrides = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@bg_prod_id", input.bg_prod_id);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM051 Edit.retrives records from wkg_supp_prod_ovrd, wkg_img_dtls, wkg_supp_img_dtls and wkg_supp_prod_grp_excptn_lang for specific bg_prod_id
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY exlang.prod_nam ) AS cnt , 
                                  exlang.prod_id, exlang.lang_cd, LNG.lang_nam, exlang.prod_nam ,COUNT(*) OVER () AS total_count 
                                  FROM wkg_supp_prod_grp_excptn_lang exlang INNER JOIN wkg_pos_accptd_lang LNG ON 
                                  exlang.lang_cd = LNG.lang_cd WHERE exlang.prod_id =@bg_prod_id) AS temp WHERE temp.cnt 
                                  BETWEEN @startrow AND @endrow;

                                  SELECT img_srl,img_nam,img_path FROM wkg_supp_img_dtls WHERE prod_id=@bg_prod_id AND supp_map_id=@supp_map_id;

                                  select (SELECT ftp_supp_img_url FROM wkg_cntrl_param_mast) + LOWER(img.img_dir) + '/' + img.img_nam AS 'img_url', 
                                  img.img_nam, dtl.bg_prod_nam, ovrd.img_srl,ovrd.ovrd_srl,ovrd.prod_id,ovrd.supp_map_id,ovrd.prod_featrd,
                                  ovrd.latitude,ovrd.longitude,ovrd.sort_ordr,ovrd.cncl_plcy,ovrd.cncl_rfnd,ovrd.bkng_fee,ovrd.bkng_fee_typ 
                                  from wkg_supp_prod_ovrd ovrd INNER JOIN wkg_bg_prod_dtl dtl ON ovrd.prod_id = dtl.bg_prod_id AND dtl.lang_cd = 'en-GB'
                                  left outer join wkg_img_dtls img ON img.img_srl=ovrd.img_srl where ovrd.prod_id=@bg_prod_id;

                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    ExpLang = new List<SSM050GridExpLang>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM050GridExpLang Grdexpone = new SSM050GridExpLang();
                        Grdexpone.bg_prod_id = r.GetValue<string>("prod_id");
                        Grdexpone.lang_cd = r.GetValue<string>("lang_cd");
                        Grdexpone.lang_nam = r.GetValue<string>("lang_nam");
                        Grdexpone.bg_prod_nam = r.GetValue<string>("prod_nam");

                        ExpLang.Add(Grdexpone);

                    }
                    Imgdata = new List<SSM050Imagedata>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM050Imagedata Img = new SSM050Imagedata();
                        Img.img_srl = r.GetValue<string>("img_srl");
                        Img.img_nam = r.GetValue<string>("img_nam");
                        Img.img_path = r.GetValue<string>("img_path");
                        Imgdata.Add(Img);

                    }
                    Overrides = new List<SSM051Overrides>();
                    var ftpService = GetService<IFileManagerService>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {

                        SSM051Overrides Ords = new SSM051Overrides();
                        Ords.img_srl = r.GetValue<string>("img_srl");
                        Ords.img_nam = r.GetValue<string>("img_nam");
                        Ords.img_url = !string.IsNullOrEmpty(Ords.img_nam) ? await ftpService.ReadFileAsync(r.GetValue<string>("img_url"), Ords.img_nam) : "";
                        Ords.ovrd_srl = r.GetValue<string>("ovrd_srl");
                        Ords.bg_prod_nam = r.GetValue<string>("bg_prod_nam");
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

                        Overrides.Add(Ords);

                    }
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");

                    }

                }
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
        public async Task<SSM023Object> SSM052OnLoadDataAsync(SessionInfo sessionInfo, SSM050Object input)
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
                //SSM052 Exception onload
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY gpm.pos_grp_nam) AS cnt, gpm.pos_grp_nam, 
                                  gxc.excptn_srl,gxc.wkg_markup,gxc.wkg_markup_typ,gxc.act_inact_ind, COUNT(*) OVER () AS total_count  
                                  FROM wkg_supp_prod_grp_excptn gxc Inner Join wkg_pos_grp_mast gpm on gpm.pos_grp_id = gxc.pos_grp_id  
                                  WHERE gxc.act_inact_ind = 1 AND gxc.prod_id = @prod_id AND gxc.supp_map_id =@supp_map_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;
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
        public async Task<PageInfo<SSM023Object>> SSM052SearchDataAsync(SessionInfo sessionInfo, SSM050Object input)
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
                //SSM052 Exception Search
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
        public async Task<SSM023Object> SSM052BlurSrchAsync(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM023Object();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                //SSM052 Exception.checks if record exists for specified lang_cd in wkg_supp_prod_grp_excptn table
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
        public async Task<SSM023Object> SSM052LoadSelectedData(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM023Object();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@excptn_srl", input.excptn_srl);
                //SSM052 Exception load selected data
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
        public async Task<SSM020Object> SSM053GetOnloadEditData(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new SSM020Object();
            try
            {
                List<SSM020CmbRsltColl> langCD = null;
                List<SSM020Newdatasectwo> Nwsec = null;

                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@bg_prod_id",input.bg_prod_id);
                dbParamters.Add("@lang_cd",input.lang_cd);
                //SSM053 retrives records from wkg_supp_prod_grp_excptn_lang for specific bg_prod_id
                string query = @"SELECT lang_cd,lang_nam from wkg_pos_accptd_lang WHERE act_inact_ind='1';

                                  SELECT lang_srl, prod_id, lang_cd, prod_nam, REPLACE(CONVERT(VARCHAR, lng.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), lng.mod_dttm, 108) AS mod_dttm, 
                                  emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd FROM wkg_supp_prod_grp_excptn_lang lng 
                                  INNER JOIN rps_usr_mast usr ON usr.Usr_id = lng.mod_by_usr_cd INNER JOIN rps_emp_mast emp 
                                  ON emp.emp_cd = usr.emp_cd  WHERE lng.prod_id=@bg_prod_id AND lng.lang_cd=@lang_cd AND 
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
        public async Task<SSM020Object> SSM053OnBlurSearch( SessionInfo sessionInfo, SSM050Object input )
        {
            var output = new SSM020Object();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@prod_id", $"{input.prod_id}");
                dbParamters.Add("@supp_map_id", $"{input.supp_map_id}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");

                //SSM053 checks if record exists for particular lang_cd in wkg_supp_prod_grp_excptn_lang table
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
        public async Task<OperationStatus> SSM052SaveDataExcAsync(SessionInfo sessionInfo, SSM050Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                var Loopdata = input.Selectedrow;
                var valuesBuilder = new StringBuilder();

                dbParamters.Add("@excptn_srl", input.excptn_srl);
                dbParamters.Add("@prod_id", input.bg_prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@wkg_markup", input.wkg_markup);
                dbParamters.Add("@wkg_markup_typ", input.wkg_markup_typ);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.EXSavedata == "EXUPDATE")
                {   //SSM052 Exception Update
                    query = @"UPDATE wkg_supp_prod_grp_excptn SET prod_id = @prod_id, pos_grp_id = @pos_grp_id, 
                               wkg_markup = @wkg_markup, wkg_markup_typ = @wkg_markup_typ,act_inact_ind = @act_inact_ind,
                               sort_ordr = @sort_ordr,mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE() WHERE 
                               excptn_srl = @excptn_srl;";
                }
                else if (input.EXSavedata == "EXINSERT")
                {   //SSM052 Exception Insert
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn (prod_id, supp_map_id, pos_grp_id, wkg_markup, wkg_markup_typ,
                               sort_ordr, act_inact_ind, mod_by_usr_cd, mod_dttm)VALUES (@prod_id, @supp_map_id, @pos_grp_id, @wkg_markup,
                               @wkg_markup_typ, @sort_ordr, @act_inact_ind,@mod_by_usr_cd, GETDATE());";
                }
                else
                {
                    string Imagequery = "";
                    int i = 1;
                    foreach (var item in Loopdata)
                    {
                        dbParamters.Add($"@act_inact_ind{i}", item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0);
                        dbParamters.Add($"@bg_prod_id{i}", item.bg_prod_id.ToString());
                        if (item.act_inact_ind.ToString().ToUpper() == "ACTIVE")
                        {   //Update mod_dttm for active products in wkg_supp_img_dtls and wkg_img_dtls table specified by bg_prod_id
                            Imagequery += @$"UPDATE wkg_supp_img_dtls set mod_dttm = GETDATE() WHERE prod_id = @bg_prod_id{i} 
                                             AND supp_map_id = @supp_map_id AND act_inact_ind = 1;
                                             UPDATE wkg_img_dtls set mod_dttm = GETDATE() WHERE prod_id = @bg_prod_id{i} 
                                             AND supp_map_id = @supp_map_id AND act_inact_ind = 1;";
                        }
                        int act_inact = item.act_inact_ind.ToString().ToUpper() == "ACTIVE" ? 1 : 0;
                        string prod_id = item.bg_prod_id.ToString();
                        valuesBuilder.Append($"(@act_inact_ind{i},@bg_prod_id{i}),");
                        ++i;
                    }
                    valuesBuilder.Length -= 1;
                    string valuesClause = valuesBuilder.ToString();
                    //SSM050 Save.Update to wkg_bg_prod_dtl table
                    query = @$"UPDATE TRGT SET act_inact_ind = SRC.act, mod_dttm = GETDATE(),mod_by_usr_cd = @mod_by_usr_cd 
                               FROM wkg_bg_prod_dtl AS TRGT INNER JOIN (Values{valuesClause}) AS SRC(act,col1) ON 
                               SRC.col1 = TRGT.bg_prod_id;";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM052SaveDataExcAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM052SaveDataExcAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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
        public async Task<OperationStatus> SSM053SaveDataAsync(SessionInfo sessionInfo, SSM050Object input)
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
                if (input.EXSavedata == "SOMWINSERT")
                {   //SSM053 Insert to wkg_supp_prod_grp_excptn_lang
                    query = @"INSERT INTO wkg_supp_prod_grp_excptn_lang (prod_id, supp_map_id, lang_cd, prod_nam, mod_by_usr_cd, 
                               mod_dttm) VALUES (@prod_id, @supp_map_id,@lang_cd,@prod_nam,@mod_by_usr_cd, GETDATE());";
                }
                else
                {   //SSM053 Update to wkg_supp_prod_grp_excptn_lang
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
        public async Task<OperationStatus> SSM051SaveDataImg(SessionInfo sessionInfo, SSM051Overrides input, List<IFormFile> files)
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
                dbParamters.Add("@prod_id", input.prod_id);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                if (input.ImageChanged == "YES" && input.OldImg == "NO" && input.img_nam !="")
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
                        {   //SSM051 Insert to wkg_supp_prod_ovrd and using old image from wkg_img_dtls
                            query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,mod_by_usr_cd,mod_dttm,img_srl,
                                       prod_featrd,latitude,longitude,cncl_plcy,sort_ordr,cncl_rfnd,bkng_fee,bkng_fee_typ)
                                       VALUES(@prod_id,@supp_map_id,@mod_by_usr_cd,GETDATE(),@img_srl,@prod_featrd,@latitude,
                                       @longitude,@cncl_plcy,@sort_ordr,@cncl_rfnd,@bkng_fee,@bkng_fee_typ)";
                        }
                        else
                        {   //SSM051 Insert to wkg_supp_prod_ovrd and Insert new image to wkg_img_dtls
                            query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,mod_by_usr_cd,
                                       mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,@mod_by_usr_cd,getdate());
                                       INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,mod_by_usr_cd,mod_dttm,img_srl,prod_featrd,
                                       latitude,longitude,cncl_plcy,sort_ordr,cncl_rfnd,bkng_fee,bkng_fee_typ)VALUES(@prod_id,@supp_map_id,
                                       @mod_by_usr_cd,GETDATE(),(SELECT MAX(img_srl) FROM wkg_img_dtls),@prod_featrd,@latitude,@longitude,
                                       @cncl_plcy,@sort_ordr,@cncl_rfnd,@bkng_fee,@bkng_fee_typ);";
                        }
                            
                    }
                    else
                    {   //SSM051 Insert to wkg_supp_prod_ovrd and no change image 
                        query = @"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,prod_featrd,latitude,longitude,
                                   mod_by_usr_cd,mod_dttm,img_srl,sort_ordr,cncl_plcy,cncl_rfnd,bkng_fee,bkng_fee_typ)
                                   VALUES (@prod_id,@supp_map_id,@prod_featrd,@latitude,@longitude,@mod_by_usr_cd,GETDATE(),
                                   null,@sort_ordr,@cncl_plcy,@cncl_rfnd,@bkng_fee,@bkng_fee_typ)";
                    }
                }
                else if (input.Savedata == "UPDATE")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {   //SSM051 Update to wkg_supp_prod_ovrd and using old image from wkg_img_dtls
                            query = @"UPDATE wkg_supp_prod_ovrd  SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                       img_srl=@img_srl,prod_featrd = @prod_featrd,latitude = @latitude,longitude = @longitude,
                                       cncl_plcy = @cncl_plcy,sort_ordr = @sort_ordr,cncl_rfnd = @cncl_rfnd,bkng_fee=@bkng_fee,
                                       bkng_fee_typ=@bkng_fee_typ WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";

                        }
                        else
                        {
                            if (input.img_nam =="")
                            {   //SSM051 Update to wkg_supp_prod_ovrd 
                                query = @"UPDATE wkg_supp_prod_ovrd  SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                           img_srl=null,prod_featrd = @prod_featrd,latitude = @latitude,longitude = @longitude,
                                           cncl_plcy = @cncl_plcy,sort_ordr = @sort_ordr,cncl_rfnd = @cncl_rfnd,bkng_fee = @bkng_fee,
                                           bkng_fee_typ = @bkng_fee_typ WHERE ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                            else
                            {    //SSM051 Update to wkg_supp_prod_ovrd and Insert new image to wkg_img_dtls
                                query = @"INSERT INTO wkg_img_dtls (img_nam, img_dir,prod_id,supp_map_id,act_inact_ind,
                                           mod_by_usr_cd,mod_dttm)VALUES (@img_nam,@img_dir,@prod_id,@supp_map_id,1 ,
                                           @mod_by_usr_cd,getdate());
                                           UPDATE wkg_supp_prod_ovrd SET mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),
                                           img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),prod_featrd = @prod_featrd,
                                           latitude = @latitude,longitude = @longitude,cncl_plcy = @cncl_plcy,sort_ordr = @sort_ordr,
                                           cncl_rfnd = @cncl_rfnd,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ WHERE 
                                           ovrd_srl = @ovrd_srl AND prod_id = @prod_id;";
                            }
                        }
                    }
                    else
                    {   //SSM051 Update to wkg_supp_prod_ovrd and no change in image
                        query = @"UPDATE wkg_supp_prod_ovrd  SET prod_featrd=@prod_featrd,latitude=@latitude,longitude=@longitude,
                                   mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),sort_ordr=@sort_ordr,cncl_plcy=@cncl_plcy,
                                   cncl_rfnd=@cncl_rfnd,bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ WHERE 
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
        public async Task<OperationStatus> SSM051RemoveImage(SessionInfo sessionInfo, SSM020Overrides input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_srl", input.img_srl);
                dbParamters.Add("@ovrd_srl", input.ovrd_srl);
                dbParamters.Add("@prod_id", input.prod_id);

                string query = "";
                //SSM051 Update to wkg_supp_prod_ovrd
                query = @"UPDATE wkg_img_dtls SET act_inact_ind=0 WHERE img_srl= @img_srl;UPDATE wkg_supp_prod_ovrd SET 
                           mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE(),img_srl=null  WHERE ovrd_srl = @ovrd_srl AND 
                           prod_id = @prod_id;";

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



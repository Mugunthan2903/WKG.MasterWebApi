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

    internal class SMST015Service : WKLServiceManger, ISMST015Service
    {
        #region Constructor

        public SMST015Service(IServiceProvider serviceProvider, ILogger<SMST015Service> logger)
            : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Private Methods

       

        #endregion

        #region Public Methods SMST015
        public async Task<SMST015loadObject> GetOnloadAsync(SessionInfo sessionInfo, SMST015Object input)
        {
            var output = new SMST015loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY sm.ssm_nam ) AS cnt, sm.ssm_nam,hmpg.*, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_config hmpg INNER JOIN wkg_pos_ssm_config sm ON hmpg.ssm_id = sm.ssm_id WHERE hmpg.act_inact_ind=1) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;select ssm_id,ssm_nam from wkg_pos_ssm_config where ssm_status=1;select arpt_srl,arpt_nam from wkg_pos_ssm_arpt_dtls where act_inact_ind=1;select arpt_srl,arpt_nam from wkg_pos_ssm_arpt_dtls";

                List<SMST015Object> tbl1 = null;
                List<SMST015SSMObject> tbl2 = null;
                List<SMST015AirportObject> tbl3 = null;
                List<SMST015AirportObject> tbl4 = null;


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SMST015Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SMST015Object obj1 = new SMST015Object();
                        obj1.ssm_srl = int.Parse(r.GetValue<string>("ssm_srl"));
                        obj1.ssm_id = r.GetValue<string>("ssm_id");
                        obj1.ssm_nam = r.GetValue<string>("ssm_nam");
                        obj1.hmpg_car_typ = r.GetValue<string>("hmpg_car_typ");
                        obj1.hmpg_slide = r.GetValue<string>("hmpg_slide");
                        obj1.hmpg_todo = r.GetValue<string>("hmpg_todo");
                        obj1.hmpg_concier_hlp = r.GetValue<string>("hmpg_concier_hlp");
                        obj1.hmpg_concier_flght = r.GetValue<string>("hmpg_concier_flght");
                        obj1.hmpg_concier_cncl = r.GetValue<string>("hmpg_concier_cncl");
                        obj1.email_req = r.GetValue<string>("email_req");
                        obj1.dflt_arpt_srl = r.GetValue<string>("dflt_arpt_srl");
                        obj1.appl_arpt_srls = r.GetValue<string>("appl_arpt_srls");
                        obj1.arpt_jrny_typ = r.GetValue<string>("arpt_jrny_typ");
                        obj1.ubr_all_cars = r.GetValue<string>("ubr_all_cars");
                        obj1.ubr_bkng_fee = r.GetValue<string>("ubr_bkng_fee");
                        obj1.mj_bkng_fee = r.GetValue<string>("mj_bkng_fee");
                        obj1.dflt_loc_desc = r.GetValue<string>("dflt_loc_desc");
                        obj1.dflt_loc_lat = r.GetValue<string>("dflt_loc_lat");
                        obj1.dflt_loc_lon = r.GetValue<string>("dflt_loc_lon");
                        obj1.dflt_loc_post_cd = r.GetValue<string>("dflt_loc_post_cd");
                        obj1.dflt_loc_shrt_nam = r.GetValue<string>("dflt_loc_shrt_nam");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SMST015SSMObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SMST015SSMObject obj2 = new SMST015SSMObject();
                        obj2.ssm_id_mast = r.GetValue<string>("ssm_id");
                        obj2.ssm_nam_mast = r.GetValue<string>("ssm_nam");

                        tbl2.Add(obj2);

                    }
                    tbl3 = new List<SMST015AirportObject>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SMST015AirportObject obj3 = new SMST015AirportObject();
                        obj3.arpt_srl_mast = r.GetValue<string>("arpt_srl");
                        obj3.arpt_nam_mast = r.GetValue<string>("arpt_nam");

                        tbl3.Add(obj3);
                    }
                    tbl4 = new List<SMST015AirportObject>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SMST015AirportObject obj4 = new SMST015AirportObject();
                        obj4.arpt_srl_mast = r.GetValue<string>("arpt_srl");
                        obj4.arpt_nam_mast = r.GetValue<string>("arpt_nam");

                        tbl4.Add(obj4);
                    }

                    SMST015loadObject obj = new SMST015loadObject();
                    obj.Items = tbl1;
                    obj.SSMItem = tbl2;
                    obj.AirportItem = tbl3;
                    obj.AirportItemAll = tbl4;

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

        public async Task<SMST015BlurObject> BlurSearchAsync(SessionInfo sessionInfo, SMST015Object input)
        {
            var output = new SMST015BlurObject();
            try
            {
                var dbParamters = new DBParameters();

              //  dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");

                //string query = $"SELECT lang_srl,ssm_srl,lang_cd,car_head,todo_head,slide_head,concier_head,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,lghm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),lghm.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_lang lghm INNER JOIN rps_usr_mast usr ON usr.Usr_id = lghm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl and lang_cd = @lang_cd;";

                string query = $"SELECT hm.*,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd_final,REPLACE(CONVERT(VARCHAR,hm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hm.mod_dttm,108) AS mod_dttm_final FROM wkg_pos_ssm_hmpg_config hm INNER JOIN rps_usr_mast usr ON usr.Usr_id = hm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_id = @ssm_id;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST015Object>(query, dbParamters, r =>
                {

                    return new SMST015Object
                    {
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        ssm_id = r.GetValue<string>("ssm_id"),
                        //ssm_nam = r.GetValue<string>("ssm_nam"),
                        hmpg_car_typ = r.GetValue<string>("hmpg_car_typ"),
                        hmpg_todo = r.GetValue<string>("hmpg_todo"),
                        hmpg_slide = r.GetValue<string>("hmpg_slide"),
                        hmpg_concier_hlp = r.GetValue<string>("hmpg_concier_hlp"),
                        hmpg_concier_flght = r.GetValue<string>("hmpg_concier_flght"),
                        hmpg_concier_cncl = r.GetValue<string>("hmpg_concier_cncl"),
                        email_req = r.GetValue<string>("email_req"),
                        appl_arpt_srls = r.GetValue<string>("appl_arpt_srls"),
                        dflt_arpt_srl = r.GetValue<string>("dflt_arpt_srl"),
                        arpt_jrny_typ = r.GetValue<string>("arpt_jrny_typ"),
                        ubr_all_cars = r.GetValue<string>("ubr_all_cars"),
                        ubr_bkng_fee = r.GetValue<string>("ubr_bkng_fee"),
                        mj_bkng_fee = r.GetValue<string>("mj_bkng_fee"),
                        dflt_loc_desc = r.GetValue<string>("dflt_loc_desc"),
                        dflt_loc_lat = r.GetValue<string>("dflt_loc_lat"),
                        dflt_loc_lon = r.GetValue<string>("dflt_loc_lon"),
                        dflt_loc_post_cd = r.GetValue<string>("dflt_loc_post_cd"),
                        dflt_loc_shrt_nam = r.GetValue<string>("dflt_loc_shrt_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd =  r.GetValue<string>("mod_by_usr_cd_final") ,
                        mod_dttm =  r.GetValue<string>("mod_dttm_final"),
                    };
                });

                if (output.Items != null && output.Items.Count > 0)
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

        public async Task<PageInfo<SMST015Object>> GetSearchAsync(SessionInfo sessionInfo, SMST015Object input)
        {
            var output = new PageInfo<SMST015Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                if (input.Mode.ToUpper() == "SEARCH")
                {
                    if (!string.IsNullOrWhiteSpace(input.ssm_id))
                    {
                        query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY sm.ssm_nam" : "ORDER BY sm.ssm_nam DESC")}) AS cnt, sm.ssm_nam, hmpg.*, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_config hmpg INNER JOIN wkg_pos_ssm_config sm ON sm.ssm_status=1 AND hmpg.ssm_id = sm.ssm_id  WHERE hmpg.act_inact_ind=@act_inact_ind and hmpg.ssm_id=@ssm_id) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                    }
                    else
                    {
                        query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY sm.ssm_nam" : "ORDER BY sm.ssm_nam DESC")}) AS cnt, sm.ssm_nam, hmpg.*, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_config hmpg INNER JOIN wkg_pos_ssm_config sm ON sm.ssm_status=1 AND hmpg.ssm_id = sm.ssm_id  WHERE hmpg.act_inact_ind=@act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                    }

                }
                if (input.Mode.ToUpper() == "SELECT")
                {
                    query = $"SELECT hm.*,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd_final,REPLACE(CONVERT(VARCHAR,hm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hm.mod_dttm,108) AS mod_dttm_final FROM wkg_pos_ssm_hmpg_config hm INNER JOIN rps_usr_mast usr ON usr.Usr_id = hm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl;";
                }

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST015Object>(query, dbParamters, r =>
                {
                    totalrecords = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<int>("total_count") : 0;
                    return new SMST015Object
                    {
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        ssm_id = r.GetValue<string>("ssm_id"),
                        ssm_nam = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<string>("ssm_nam") : null,
                        hmpg_car_typ = r.GetValue<string>("hmpg_car_typ"),
                        hmpg_todo = r.GetValue<string>("hmpg_todo"),
                        hmpg_slide = r.GetValue<string>("hmpg_slide"),
                        hmpg_concier_hlp = r.GetValue<string>("hmpg_concier_hlp"),
                        hmpg_concier_flght = r.GetValue<string>("hmpg_concier_flght"),
                        hmpg_concier_cncl = r.GetValue<string>("hmpg_concier_cncl"),
                        email_req = r.GetValue<string>("email_req"),
                        appl_arpt_srls = r.GetValue<string>("appl_arpt_srls"),
                        dflt_arpt_srl = r.GetValue<string>("dflt_arpt_srl"),
                        arpt_jrny_typ = r.GetValue<string>("arpt_jrny_typ"),
                        ubr_all_cars = r.GetValue<string>("ubr_all_cars"),
                        ubr_bkng_fee = r.GetValue<string>("ubr_bkng_fee"),
                        mj_bkng_fee = r.GetValue<string>("mj_bkng_fee"),
                        dflt_loc_desc = r.GetValue<string>("dflt_loc_desc"),
                        dflt_loc_lat = r.GetValue<string>("dflt_loc_lat"),
                        dflt_loc_lon = r.GetValue<string>("dflt_loc_lon"),
                        dflt_loc_post_cd = r.GetValue<string>("dflt_loc_post_cd"),
                        dflt_loc_shrt_nam = r.GetValue<string>("dflt_loc_shrt_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = input.Mode.ToUpper() == "SELECT" ? r.GetValue<string>("mod_by_usr_cd_final") : r.GetValue<string>("mod_dttm"),
                        mod_dttm = input.Mode.ToUpper() == "SELECT" ? r.GetValue<string>("mod_dttm_final") : r.GetValue<string>("mod_dttm"),

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

        public async Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, SMST015Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@hmpg_car_typ", $"{input.hmpg_car_typ}");
                dbParamters.Add("@hmpg_todo", input.hmpg_todo == "1" ? 1 : 0);
                dbParamters.Add("@hmpg_slide", input.hmpg_slide == "1" ? 1 : 0);
                dbParamters.Add("@hmpg_concier_hlp", input.hmpg_concier_hlp == "1" ? 1 : 0);
                dbParamters.Add("@hmpg_concier_flght", input.hmpg_concier_flght == "1" ? 1 : 0);
                dbParamters.Add("@hmpg_concier_cncl", input.hmpg_concier_cncl == "1" ? 1 : 0);
                dbParamters.Add("@email_req", input.email_req == "1" ? 1 : 0);
                dbParamters.Add("@dflt_arpt_srl", $"{input.dflt_arpt_srl}");
                dbParamters.Add("@appl_arpt_srls", $"{input.appl_arpt_srls}");
                dbParamters.Add("@arpt_jrny_typ", $"{input.arpt_jrny_typ}");
                dbParamters.Add("@ubr_all_cars", input.hmpg_todo == "1" ? 1 : 0);
                dbParamters.Add("@ubr_bkng_fee", input.ubr_bkng_fee != "" ? $"{input.ubr_bkng_fee}" : null); //double.Parse(input.ubr_bkng_fee)
                dbParamters.Add("@mj_bkng_fee", input.mj_bkng_fee != "" ? $"{input.mj_bkng_fee}" : null); //double.Parse(input.mj_bkng_fee)
                dbParamters.Add("@dflt_loc_desc", $"{input.dflt_loc_desc}");
                dbParamters.Add("@dflt_loc_lat", $"{input.dflt_loc_lat}"); //double.Parse(input.dflt_loc_lat)
                dbParamters.Add("@dflt_loc_lon", $"{input.dflt_loc_lon}"); //double.Parse(input.dflt_loc_lon)
                dbParamters.Add("@dflt_loc_post_cd", $"{input.dflt_loc_post_cd}");
                dbParamters.Add("@dflt_loc_shrt_nam", $"{input.dflt_loc_shrt_nam}");
                dbParamters.Add("@act_inact_ind", input.act_inact_ind == "1" ? 1 : 0);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {
                    query = $"UPDATE wkg_pos_ssm_hmpg_config SET hmpg_car_typ=@hmpg_car_typ,hmpg_todo=@hmpg_todo,hmpg_slide=@hmpg_slide,hmpg_concier_hlp=@hmpg_concier_hlp,hmpg_concier_flght=@hmpg_concier_flght,hmpg_concier_cncl= @hmpg_concier_cncl,email_req= @email_req,dflt_arpt_srl=@dflt_arpt_srl,appl_arpt_srls= @appl_arpt_srls,arpt_jrny_typ= @arpt_jrny_typ,ubr_all_cars= @ubr_all_cars,ubr_bkng_fee= @ubr_bkng_fee,mj_bkng_fee= @mj_bkng_fee,dflt_loc_desc= @dflt_loc_desc,dflt_loc_lat= @dflt_loc_lat,dflt_loc_lon= @dflt_loc_lon,dflt_loc_post_cd= @dflt_loc_post_cd,dflt_loc_shrt_nam= @dflt_loc_shrt_nam,act_inact_ind= @act_inact_ind,mod_by_usr_cd= @mod_by_usr_cd,mod_dttm = getdate() WHERE ssm_srl = @ssm_srl;";

                }
                if (input.Mode.ToUpper() == "SAVE")
                {
                    query = $"INSERT INTO wkg_pos_ssm_hmpg_config(ssm_id,hmpg_car_typ,hmpg_todo,hmpg_slide,hmpg_concier_hlp,hmpg_concier_flght,hmpg_concier_cncl,email_req,dflt_arpt_srl,appl_arpt_srls,arpt_jrny_typ,ubr_all_cars,ubr_bkng_fee,mj_bkng_fee,dflt_loc_desc,dflt_loc_lat, dflt_loc_lon,dflt_loc_post_cd,dflt_loc_shrt_nam,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@ssm_id,@hmpg_car_typ,@hmpg_todo,@hmpg_slide,@hmpg_concier_hlp,@hmpg_concier_flght,@hmpg_concier_cncl,@email_req,@dflt_arpt_srl,@appl_arpt_srls,@arpt_jrny_typ,@ubr_all_cars,@ubr_bkng_fee,@mj_bkng_fee,@dflt_loc_desc,@dflt_loc_lat,@dflt_loc_lon,@dflt_loc_post_cd,@dflt_loc_shrt_nam,@act_inact_ind,@mod_by_usr_cd,getdate());";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SMST016
        public async Task<SMST016loadObject> GetLangOnloadAsync(SessionInfo sessionInfo, SMST016Object input)
        {
            var output = new SMST016loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", input.ssm_srl);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY alm.lang_nam) AS cnt,lang_srl,ssm_srl,hmln.lang_cd, alm.lang_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmln.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmln.mod_dttm,108) AS mod_dttm , COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_lang hmln INNER jOIN wkg_pos_accptd_lang alm ON alm.lang_cd = hmln.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmln.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmln.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind=1;select lang_cd,lang_nam from wkg_pos_accptd_lang;";

                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY alm.lang_nam) AS cnt,lang_srl,ssm_srl,hmln.lang_cd, alm.lang_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmln.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmln.mod_dttm,108) AS mod_dttm , COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_lang hmln INNER jOIN wkg_pos_accptd_lang alm ON alm.act_inact_ind = 1 AND alm.lang_cd = hmln.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmln.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmln.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind=1;";

                List<SMST016Object> tbl1 = null;
                List<SMST016LangObject> tbl2 = null;
           


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SMST016Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SMST016Object obj1 = new SMST016Object();
                        obj1.lang_srl = int.Parse(r.GetValue<string>("lang_srl"));
                        obj1.ssm_srl = int.Parse(r.GetValue<string>("ssm_srl"));
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.lang_nam = r.GetValue<string>("lang_nam");
                        obj1.car_head = r.GetValue<string>("car_head");
                        obj1.todo_head = r.GetValue<string>("todo_head");
                        obj1.slide_head = r.GetValue<string>("slide_head");
                        obj1.concier_head = r.GetValue<string>("concier_head");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SMST016LangObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SMST016LangObject obj2 = new SMST016LangObject();
                        obj2.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj2.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl2.Add(obj2);

                    }
               
                    SMST016loadObject obj = new SMST016loadObject();
                    obj.Items = tbl1;
                    obj.LangItems = tbl2;
              
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
        public async Task<SMST016BlurObject> LangBlurSearchAsync(SessionInfo sessionInfo, SMST016Object input)
        {
            var output = new SMST016BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                //string query = $"  SELECT slide_srl,ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl and lang_cd = @lang_cd;";

                string query = $"SELECT lang_srl,ssm_srl,lang_cd,car_head,todo_head,slide_head,concier_head,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,lghm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),lghm.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_lang lghm INNER JOIN rps_usr_mast usr ON usr.Usr_id = lghm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl and lang_cd = @lang_cd;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST016Object>(query, dbParamters, r =>
                {

                    return new SMST016Object
                    {
                        lang_srl = int.Parse(r.GetValue<string>("lang_srl")),
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        car_head = r.GetValue<string>("car_head"),
                        todo_head = r.GetValue<string>("todo_head"),
                        slide_head = r.GetValue<string>("slide_head"),
                        concier_head = r.GetValue<string>("concier_head"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });

                if (output.Items != null && output.Items.Count > 0)
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
        public async Task<PageInfo<SMST016Object>> GetLangSearchAsync(SessionInfo sessionInfo, SMST016Object input)
        {
            var output = new PageInfo<SMST016Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@lang_srl", $"{input.lang_srl}");
                dbParamters.Add("@ssm_srl", input.ssm_srl);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                if (input.Mode.ToUpper() == "SEARCH")
                {
                    if (!string.IsNullOrWhiteSpace(input.lang_cd))
                    {
                        query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY alm.lang_nam" : "ORDER BY alm.lang_nam DESC")}) AS cnt, lang_srl,ssm_srl,hmln.lang_cd, alm.lang_nam,car_head,todo_head,slide_head,concier_head,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmln.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmln.mod_dttm,108) AS mod_dttm , COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_lang hmln INNER jOIN wkg_pos_accptd_lang alm ON  alm.act_inact_ind = 1 AND alm.lang_cd = hmln.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmln.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmln.lang_cd = @lang_cd and hmln.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                    }
                    else
                    {
                        query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY alm.lang_nam" : "ORDER BY alm.lang_nam DESC")}) AS cnt, lang_srl,ssm_srl,hmln.lang_cd, alm.lang_nam,car_head,todo_head,slide_head,concier_head,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmln.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmln.mod_dttm,108) AS mod_dttm , COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_lang hmln INNER jOIN wkg_pos_accptd_lang alm ON  alm.act_inact_ind = 1 AND alm.lang_cd = hmln.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmln.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmln.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                    }

                }
                if (input.Mode.ToUpper() == "SELECT")
                {
                    query = $"SELECT lang_srl,ssm_srl,lang_cd,car_head,todo_head,slide_head,concier_head,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,lghm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),lghm.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_lang lghm INNER JOIN rps_usr_mast usr ON usr.Usr_id = lghm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where lang_srl = @lang_srl;";
                }

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST016Object>(query, dbParamters, r =>
                {
                    totalrecords = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<int>("total_count") : 0;
                    return new SMST016Object
                    {
                        lang_srl = int.Parse(r.GetValue<string>("lang_srl")),
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<string>("lang_nam") : null,
                        car_head = r.GetValue<string>("car_head"),
                        todo_head = r.GetValue<string>("todo_head"),
                        slide_head = r.GetValue<string>("slide_head"),
                        concier_head = r.GetValue<string>("concier_head"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
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

        public async Task<OperationStatus> LangSaveAsync(SessionInfo sessionInfo, SMST016Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_srl", $"{input.lang_srl}");
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@car_head", input.car_head != "" ? $"{input.car_head}" : null);
                dbParamters.Add("@todo_head", input.todo_head != "" ? $"{input.todo_head}" : null);
                dbParamters.Add("@slide_head", input.slide_head != "" ? $"{input.slide_head}" : null);
                dbParamters.Add("@concier_head", input.concier_head != "" ? $"{input.concier_head}" : null);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                
                    if (input.Mode.ToUpper() == "UPDATE")
                    {
                        query = $"UPDATE wkg_pos_ssm_hmpg_lang SET lang_cd=@lang_cd,car_head=@car_head,todo_head=@todo_head,slide_head=@slide_head,concier_head=@concier_head,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate() WHERE lang_srl = @lang_srl;";

                    }
                    if (input.Mode.ToUpper() == "SAVE")
                    {
                        query = $"INSERT INTO wkg_pos_ssm_hmpg_lang(ssm_srl,lang_cd,car_head,todo_head,slide_head,concier_head,mod_by_usr_cd,mod_dttm) VALUES(@ssm_srl,@lang_cd,@car_head,@todo_head,@slide_head,@concier_head,@mod_by_usr_cd,getdate());";

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
                                    this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                                }
                                this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SMST017
        public async Task<SMST017loadObject> GetSlideOnloadAsync(SessionInfo sessionInfo, SMST017Object input)
        {
            var output = new SMST017loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", input.ssm_srl);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY alm.lang_nam) AS cnt,slide_srl,ssm_srl,hmsl.act_inact_ind,hmsl.lang_cd, alm.lang_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm ,COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER jOIN wkg_pos_accptd_lang alm ON alm.act_inact_ind = 1 AND alm.lang_cd = hmsl.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmsl.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind=1;select form_id,form_nam,prod_dtl_aval from wkg_pos_ssm_form_dtls;";

                List<SMST017Object> tbl1 = null;
                List<SMST016LangObject> tbl2 = null;
                List<SMST017SlideObject> tbl3 = null;


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SMST017Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SMST017Object obj1 = new SMST017Object();
                        obj1.slide_srl = int.Parse(r.GetValue<string>("slide_srl"));
                        obj1.ssm_srl = int.Parse(r.GetValue<string>("ssm_srl"));
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.lang_nam = r.GetValue<string>("lang_nam");
                        obj1.slide_img = r.GetValue<string>("slide_img");
                        obj1.form_id = r.GetValue<string>("form_id");
                        obj1.prod_id = r.GetValue<string>("prod_id");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SMST016LangObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SMST016LangObject obj2 = new SMST016LangObject();
                        obj2.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj2.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl2.Add(obj2);

                    }
                    tbl3 = new List<SMST017SlideObject>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SMST017SlideObject obj3 = new SMST017SlideObject();
                        obj3.form_id_mast = r.GetValue<string>("form_id");
                        obj3.form_nam_mast = r.GetValue<string>("form_nam");
                        obj3.prod_dtl_aval = r.GetValue<string>("prod_dtl_aval");

                        tbl3.Add(obj3);

                    }

                    SMST017loadObject obj = new SMST017loadObject();
                    obj.Items = tbl1;
                    obj.LangItems = tbl2;
                    obj.SlideItems = tbl3;


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

        public async Task<SMST017BlurObject> SlideBlurSearchAsync(SessionInfo sessionInfo, SMST017Object input)
        {
            var output = new SMST017BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                string query = $"  SELECT slide_srl,ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl and lang_cd = @lang_cd;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST017Object>(query, dbParamters, r =>
                {

                    return new SMST017Object
                    {
                        slide_srl = int.Parse(r.GetValue<string>("lang_srl")),
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = r.GetValue<string>("lang_nam") ,
                        slide_img = r.GetValue<string>("car_head"),
                        form_id = r.GetValue<string>("form_id"),
                        prod_id = r.GetValue<string>("prod_id"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });

                if (output.Items != null && output.Items.Count > 0)
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

        public async Task<PageInfo<SMST017Object>> GetSlideSearchAsync(SessionInfo sessionInfo, SMST017Object input)
        {
            var output = new PageInfo<SMST017Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@slide_srl", $"{input.slide_srl}");
                dbParamters.Add("@ssm_srl", input.ssm_srl);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                if (input.Mode.ToUpper() == "SEARCH")
                {
                    query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY alm.lang_nam" : "ORDER BY alm.lang_nam DESC")}) AS cnt, slide_srl,ssm_srl,hmsl.lang_cd, alm.lang_nam,slide_img,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm ,COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER jOIN wkg_pos_accptd_lang alm ON alm.act_inact_ind = 1 AND alm.lang_cd = hmsl.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmsl.act_inact_ind = @act_inact_ind and hmsl.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }
                if (input.Mode.ToUpper() == "SELECT")
                {
                    query = $"SELECT slide_srl,ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where slide_srl = @slide_srl;";
                }
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST017Object>(query, dbParamters, r =>
                {
                    totalrecords = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<int>("total_count") : 0;
                    return new SMST017Object
                    {
                        slide_srl = int.Parse(r.GetValue<string>("lang_srl")),
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<string>("lang_nam") : null,
                        slide_img = r.GetValue<string>("car_head"),
                        form_id = r.GetValue<string>("form_id"),
                        prod_id = r.GetValue<string>("prod_id"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
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

        public async Task<OperationStatus> SlideSaveAsync(SessionInfo sessionInfo, SMST017Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@slide_srl", $"{input.slide_srl}");
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@slide_img", $"{input.slide_img}");
                dbParamters.Add("@form_id", $"{input.form_id}");
                dbParamters.Add("@prod_id", $"{input.prod_id}");
                dbParamters.Add("@sort_ordr", $"{input.sort_ordr}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";

                if (input.Mode.ToUpper() == "UPDATE")
                {
                    query = $"UPDATE wkg_pos_ssm_hmpg_slide_dtls SET ssm_srl=@ssm_srl,lang_cd=@lang_cd,slide_img=@slide_img,form_id=@form_id,prod_id=@prod_id,sort_ordr=@sort_ordr,act_inact_ind=@act_inact_ind,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate() WHERE slide_srl = @slide_srl;";

                }
                if (input.Mode.ToUpper() == "SAVE")
                {
                    query = $"INSERT INTO wkg_pos_ssm_hmpg_slide_dtls(ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@ssm_srl,@lang_cd,@slide_img,@form_id,@prod_id,@sort_ordr,@act_inact_ind,@mod_by_usr_cd,getdate());";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SMST018
        public async Task<SMST018loadObject> GetTodoOnloadAsync(SessionInfo sessionInfo, SMST018Object input)
        {
            var output = new SMST018loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", input.ssm_srl);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                string query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY alm.lang_nam) AS cnt,slide_srl,ssm_srl,hmsl.act_inact_ind,hmsl.lang_cd, alm.lang_nam,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm ,COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER jOIN wkg_pos_accptd_lang alm ON alm.act_inact_ind = 1 AND alm.lang_cd = hmsl.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmsl.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind=1;select form_id,form_nam,prod_dtl_aval from wkg_pos_ssm_form_dtls;";

                List<SMST018Object> tbl1 = null;
                List<SMST016LangObject> tbl2 = null;
               

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SMST018Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SMST018Object obj1 = new SMST018Object();
                        obj1.ssm_srl = int.Parse(r.GetValue<string>("ssm_srl"));
                        obj1.lang_cd = r.GetValue<string>("lang_cd");
                        obj1.lang_nam = r.GetValue<string>("lang_nam");
                        obj1.slide_img = r.GetValue<string>("slide_img");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SMST016LangObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SMST016LangObject obj2 = new SMST016LangObject();
                        obj2.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj2.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl2.Add(obj2);

                    }

                    SMST018loadObject obj = new SMST018loadObject();
                    obj.Items = tbl1;
                    obj.LangItems = tbl2;

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

        public async Task<SMST018BlurObject> TodoBlurSearchAsync(SessionInfo sessionInfo, SMST018Object input)
        {
            var output = new SMST018BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                string query = $"  SELECT slide_srl,ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where ssm_srl = @ssm_srl and lang_cd = @lang_cd;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST018Object>(query, dbParamters, r =>
                {

                    return new SMST018Object
                    {
                        
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = r.GetValue<string>("lang_nam"),
                        slide_img = r.GetValue<string>("car_head"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });

                if (output.Items != null && output.Items.Count > 0)
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

        public async Task<PageInfo<SMST018Object>> GetTodoSearchAsync(SessionInfo sessionInfo, SMST018Object input)
        {
            var output = new PageInfo<SMST018Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", input.ssm_srl);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                if (input.Mode.ToUpper() == "SEARCH")
                {
                    query = $"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY alm.lang_nam" : "ORDER BY alm.lang_nam DESC")}) AS cnt, slide_srl,ssm_srl,hmsl.lang_cd, alm.lang_nam,slide_img,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm ,COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER jOIN wkg_pos_accptd_lang alm ON alm.act_inact_ind = 1 AND alm.lang_cd = hmsl.lang_cd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE hmsl.act_inact_ind = @act_inact_ind and hmsl.ssm_srl =@ssm_srl) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }
                if (input.Mode.ToUpper() == "SELECT")
                {
                    query = $"SELECT slide_srl,ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,hmsl.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmsl.mod_dttm,108) AS mod_dttm FROM wkg_pos_ssm_hmpg_slide_dtls hmsl INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmsl.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where slide_srl = @slide_srl;";
                }
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SMST018Object>(query, dbParamters, r =>
                {
                    totalrecords = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<int>("total_count") : 0;
                    return new SMST018Object
                    {
                        ssm_srl = int.Parse(r.GetValue<string>("ssm_srl")),
                        lang_cd = r.GetValue<string>("lang_cd"),
                        lang_nam = input.Mode.ToUpper() == "SEARCH" ? r.GetValue<string>("lang_nam") : null,
                        slide_img = r.GetValue<string>("car_head"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
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
        public async Task<OperationStatus> TodoSaveAsync(SessionInfo sessionInfo, SMST018Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_srl", $"{input.ssm_srl}");
                dbParamters.Add("@lang_cd", $"{input.lang_cd}");
                dbParamters.Add("@slide_img", $"{input.slide_img}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";

                if (input.Mode.ToUpper() == "UPDATE")
                {
                    query = $"UPDATE wkg_pos_ssm_hmpg_slide_dtls SET ssm_srl=@ssm_srl,lang_cd=@lang_cd,slide_img=@slide_img,form_id=@form_id,prod_id=@prod_id,sort_ordr=@sort_ordr,act_inact_ind=@act_inact_ind,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate() WHERE slide_srl = @slide_srl;";

                }
                if (input.Mode.ToUpper() == "SAVE")
                {
                    query = $"INSERT INTO wkg_pos_ssm_hmpg_slide_dtls(ssm_srl,lang_cd,slide_img,form_id,prod_id,sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@ssm_srl,@lang_cd,@slide_img,@form_id,@prod_id,@sort_ordr,@act_inact_ind,@mod_by_usr_cd,getdate());";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

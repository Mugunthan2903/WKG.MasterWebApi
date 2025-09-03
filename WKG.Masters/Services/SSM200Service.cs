using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using WKL.Service.Domain;
using static System.Net.Mime.MediaTypeNames;

namespace WKG.Masters.Services
{
    public class SSM200Service : WKLServiceManger, ISSM200Service
    {
        #region Constructor
        public SSM200Service(IServiceProvider serviceProvider, ILogger<SSM200Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Public Methods SSM200-Group Copy

        public async Task<SSM200loadObject> SSM200GetOnloadAsync(SessionInfo sessionInfo, SSM200Object input)
        {
            var output = new SSM200loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM200 Onload - Load group data and SSM information
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY grp.pos_grp_nam ) AS cnt ,pos_grp_id,
                                  pos_grp_nam, act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast grp 
                                  where grp.act_inact_ind=1) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  select lang_cd,lang_nam from wkg_pos_accptd_lang where act_inact_ind=1;

                                  select lang_cd,lang_nam from wkg_pos_accptd_lang;

                                  select arpt_srl,arpt_nam from wkg_pos_ssm_arpt_dtls where act_inact_ind=1;

                                  select arpt_srl,arpt_nam from wkg_pos_ssm_arpt_dtls;

                                  select end_pnt_nam from wkg_pos_end_pnts;

                                  SELECT 'FLT' supp_map_id,'Flight Api' supp_nam,act_inact_ind from wkg_supp_config 
                                  WHERE supp_map_id='FLT' UNION SELECT cng.supp_map_id,supp.supp_nam,cng.act_inact_ind 
                                  from wkg_supp_config cng INNER join rps_supp_mast supp ON supp.supp_map_id=cng.supp_map_id;

                                  select pos_cd, pos_nam from wkg_pos_mast where act_inact_ind=1;

                                  select ssm_id, ssm_nam, dflt_lang_cd from wkg_pos_ssm_config where ssm_status=1;";

                List<SSM200Object> tbl1 = null;
                List<SSM200LangObject> tbl2 = null;
                List<SSM200LangObject> tbl3 = null;
                List<SSM200AirportObject> tbl4 = null;
                List<SSM200AirportObject> tbl5 = null;
                List<SSM200EndpointObject> tbl6 = null;
                List<SSM200ApiEnableObject> tbl7 = null;
                List<SelectBox> tbl8 = null;
                List<SSM200SSMObject> tbl9 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM200Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM200Object obj1 = new SSM200Object();
                        obj1.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj1.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");

                        tbl1.Add(obj1);
                        totalrecords = r.GetValue<int>("total_count");
                    }

                    tbl2 = new List<SSM200LangObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM200LangObject obj2 = new SSM200LangObject();

                        obj2.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj2.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl2.Add(obj2);
                    }

                    tbl3 = new List<SSM200LangObject>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM200LangObject obj3 = new SSM200LangObject();

                        obj3.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj3.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl3.Add(obj3);
                    }

                    tbl4 = new List<SSM200AirportObject>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SSM200AirportObject obj4 = new SSM200AirportObject();

                        obj4.arpt_srl_mast = r.GetValue<string>("arpt_srl");
                        obj4.arpt_nam_mast = r.GetValue<string>("arpt_nam");

                        tbl4.Add(obj4);
                    }

                    tbl5 = new List<SSM200AirportObject>();
                    foreach (DataRow r in DS.Tables[4].Rows)
                    {
                        SSM200AirportObject obj5 = new SSM200AirportObject();

                        obj5.arpt_srl_mast = r.GetValue<string>("arpt_srl");
                        obj5.arpt_nam_mast = r.GetValue<string>("arpt_nam");

                        tbl5.Add(obj5);
                    }

                    tbl6 = new List<SSM200EndpointObject>();
                    foreach (DataRow r in DS.Tables[5].Rows)
                    {
                        SSM200EndpointObject obj6 = new SSM200EndpointObject();

                        obj6.end_pnt_nam = r.GetValue<string>("end_pnt_nam");

                        tbl6.Add(obj6);
                    }

                    tbl7 = new List<SSM200ApiEnableObject>();
                    foreach (DataRow r in DS.Tables[6].Rows)
                    {
                        SSM200ApiEnableObject obj7 = new SSM200ApiEnableObject();

                        obj7.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj7.supp_nam = r.GetValue<string>("supp_nam");
                        obj7.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        tbl7.Add(obj7);
                    }

                    tbl8 = new List<SelectBox>();
                    foreach (DataRow r in DS.Tables[7].Rows)
                    {
                        SelectBox obj8 = new SelectBox();
                        obj8.ID = r.GetValue<string>("pos_cd");
                        obj8.Text = r.GetValue<string>("pos_nam");

                        tbl8.Add(obj8);
                    }

                    tbl9 = new List<SSM200SSMObject>();
                    foreach (DataRow r in DS.Tables[8].Rows)
                    {
                        SSM200SSMObject obj9 = new SSM200SSMObject();
                        obj9.ssm_id_mast = r.GetValue<string>("ssm_id");
                        obj9.ssm_nam_mast = r.GetValue<string>("ssm_nam");
                        obj9.dflt_lang_cd_mast = r.GetValue<string>("dflt_lang_cd");

                        tbl9.Add(obj9);
                    }

                    SSM200loadObject obj = new SSM200loadObject();
                    obj.Items = tbl1;
                    obj.LangItems = tbl2;
                    obj.LangItemsAll = tbl3;
                    obj.AirportItem = tbl4;
                    obj.AirportItemAll = tbl5;
                    obj.EndpointItem = tbl6;
                    obj.ApiEnableItem = tbl7;
                    obj.PosNameList = tbl8;
                    obj.SSMItems = tbl9;
                    obj.SetPages(totalrecords, input.PageSize);

                    output = obj;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<SSM200BlurObject> SSM200BlurAsync(SessionInfo sessionInfo, SSM200Object input)
        {
            var output = new SSM200BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam}");
                string query = @"select pos_grp_id,pos_grp_nam from wkg_pos_grp_mast 
                                where pos_grp_nam=@pos_grp_nam AND act_inact_ind=1;";

                SSM200Object Items = null;
                Items = await this.DBUtils(true).GetEntityDataAsync<SSM200Object>(query, dbParamters, r =>
                {
                    return new SSM200Object
                    {
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                    };
                });

                if (Items != null)
                {
                    output.Isavailable = true;
                    output.Items = Items;
                }
                else
                {
                    output.Isavailable = false;
                    output.Items = null;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<PageInfo<SSM200Object>> SSM200GetSearchAsync(SessionInfo sessionInfo, SSM200Object input)
        {
            var output = new PageInfo<SSM200Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";

                if (!string.IsNullOrWhiteSpace(input.pos_grp_nam))
                {
                    query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY grp.pos_grp_nam{(input.SortTyp ? "" : " DESC")}) AS cnt ,
                               pos_grp_id,pos_grp_nam, act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast grp 
                               where grp.pos_grp_nam LIKE @pos_grp_nam AND grp.act_inact_ind=@act_inact_ind) AS temp 
                               WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }
                else
                {
                    query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY grp.pos_grp_nam{(input.SortTyp ? "" : " DESC")}) AS cnt ,
                               pos_grp_id,pos_grp_nam, act_inact_ind, COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast grp 
                               where grp.act_inact_ind=@act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM200Object>(query, dbParamters, r =>
                {
                    return new SSM200Object
                    {
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                    };
                });

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<SSM200loadObject> SSM200GetSelectAsync(SessionInfo sessionInfo, SSM200Object input)
        {
            var output = new SSM200loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = @"select grp.pos_grp_id,grp.pos_grp_nam,grp.pos_cd,grp.lang_cds,grp.dflt_lang_cd,
                                grp.end_pnt_nam,grp.tui_city_cds,grp.tour_city_nam,grp.auto_rfrsh_tm,grp.apis_enbld,
                                grp.trm_appl_cds,grp.hmpg_typ,grp.hmpg_todo,grp.hmpg_slide,grp.hmpg_hlp,grp.hmpg_flght,
                                grp.hmpg_cncl,grp.appl_arpt_srls,grp.dflt_arpt_srl,grp.dflt_arpt_jrny_typ,grp.dflt_car_typ,
                                grp.ubr_all_cars,grp.ubr_supp,grp.ubr_bkngfee_dsply,grp.pos_pymnt_typ,grp.pos_cntry_cd,
                                grp.bkng_fee,grp.act_inact_ind,grp.mod_by_usr_cd,grp.mod_dttm 
                                from wkg_pos_grp_mast grp where grp.pos_grp_id=@pos_grp_id;

                                select ssm.ssm_id, ssm.ssm_nam, ssm.dflt_lang_cd 
                                from wkg_pos_ssm_config ssm where ssm.pos_grp_id=@pos_grp_id and ssm.ssm_status=1;";

                List<SSM200Object> tbl1 = null;
                List<SSM200SSMObject> tbl2 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM200Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM200Object obj1 = new SSM200Object();
                        obj1.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj1.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj1.pos_cd = r.GetValue<string>("pos_cd");
                        obj1.lang_cds = r.GetValue<string>("lang_cds");
                        obj1.dflt_lang_cd = r.GetValue<string>("dflt_lang_cd");
                        obj1.end_pnt_nam = r.GetValue<string>("end_pnt_nam");
                        obj1.tui_city_cds = r.GetValue<string>("tui_city_cds");
                        obj1.tour_city_nam = r.GetValue<string>("tour_city_nam");
                        obj1.auto_rfrsh_tm = r.GetValue<string>("auto_rfrsh_tm");
                        obj1.apis_enbld = r.GetValue<string>("apis_enbld");
                        obj1.trm_appl_cds = r.GetValue<string>("trm_appl_cds");
                        obj1.hmpg_typ = r.GetValue<string>("hmpg_typ");
                        obj1.hmpg_todo = r.GetValue<string>("hmpg_todo");
                        obj1.hmpg_slide = r.GetValue<string>("hmpg_slide");
                        obj1.hmpg_hlp = r.GetValue<string>("hmpg_hlp");
                        obj1.hmpg_flght = r.GetValue<string>("hmpg_flght");
                        obj1.hmpg_cncl = r.GetValue<string>("hmpg_cncl");
                        obj1.appl_arpt_srls = r.GetValue<string>("appl_arpt_srls");
                        obj1.dflt_arpt_srl = r.GetValue<string>("dflt_arpt_srl");
                        obj1.dflt_arpt_jrny_typ = r.GetValue<string>("dflt_arpt_jrny_typ");
                        obj1.dflt_car_typ = r.GetValue<string>("dflt_car_typ");
                        obj1.ubr_all_cars = r.GetValue<string>("ubr_all_cars");
                        obj1.ubr_supp = r.GetValue<string>("ubr_supp");
                        obj1.ubr_bkngfee_dsply = r.GetValue<string>("ubr_bkngfee_dsply");
                        obj1.pos_pymnt_typ = r.GetValue<string>("pos_pymnt_typ");
                        obj1.pos_cntry_cd = r.GetValue<string>("pos_cntry_cd");
                        obj1.bkng_fee = r.GetValue<string>("bkng_fee");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");

                        tbl1.Add(obj1);
                    }

                    tbl2 = new List<SSM200SSMObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM200SSMObject obj2 = new SSM200SSMObject();
                        obj2.ssm_id_mast = r.GetValue<string>("ssm_id");
                        obj2.ssm_nam_mast = r.GetValue<string>("ssm_nam");
                        obj2.dflt_lang_cd_mast = r.GetValue<string>("dflt_lang_cd");

                        tbl2.Add(obj2);
                    }

                    SSM200loadObject obj = new SSM200loadObject();
                    obj.Items = tbl1;
                    obj.SSMItems = tbl2;

                    output = obj;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<OperationStatus> SSM200SaveAsync(SessionInfo sessionInfo, SSM200Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@pos_grp_nam", input.pos_grp_nam);
                dbParamters.Add("@pos_cd", input.pos_cd);
                dbParamters.Add("@lang_cds", input.lang_cds);
                dbParamters.Add("@dflt_lang_cd", input.dflt_lang_cd);
                dbParamters.Add("@end_pnt_nam", input.end_pnt_nam);
                dbParamters.Add("@tui_city_cds", input.tui_city_cds);
                dbParamters.Add("@tour_city_nam", input.tour_city_nam);
                dbParamters.Add("@auto_rfrsh_tm", input.auto_rfrsh_tm);
                dbParamters.Add("@apis_enbld", input.apis_enbld);
                dbParamters.Add("@trm_appl_cds", input.trm_appl_cds);
                dbParamters.Add("@hmpg_typ", input.hmpg_typ);
                dbParamters.Add("@hmpg_todo", input.hmpg_todo);
                dbParamters.Add("@hmpg_slide", input.hmpg_slide);
                dbParamters.Add("@hmpg_hlp", input.hmpg_hlp);
                dbParamters.Add("@hmpg_flght", input.hmpg_flght);
                dbParamters.Add("@hmpg_cncl", input.hmpg_cncl);
                dbParamters.Add("@appl_arpt_srls", input.appl_arpt_srls);
                dbParamters.Add("@dflt_arpt_srl", input.dflt_arpt_srl);
                dbParamters.Add("@dflt_arpt_jrny_typ", input.dflt_arpt_jrny_typ);
                dbParamters.Add("@dflt_car_typ", input.dflt_car_typ);
                dbParamters.Add("@ubr_all_cars", input.ubr_all_cars);
                dbParamters.Add("@ubr_supp", input.ubr_supp);
                dbParamters.Add("@ubr_bkngfee_dsply", input.ubr_bkngfee_dsply);
                dbParamters.Add("@pos_pymnt_typ", input.pos_pymnt_typ);
                dbParamters.Add("@pos_cntry_cd", input.pos_cntry_cd);
                dbParamters.Add("@bkng_fee", input.bkng_fee);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                if (input.Mode == "I")
                {
                    query = @"INSERT INTO wkg_pos_grp_mast (pos_grp_id,pos_grp_nam,pos_cd,lang_cds,dflt_lang_cd,
                             end_pnt_nam,tui_city_cds,tour_city_nam,auto_rfrsh_tm,apis_enbld,trm_appl_cds,hmpg_typ,
                             hmpg_todo,hmpg_slide,hmpg_hlp,hmpg_flght,hmpg_cncl,appl_arpt_srls,dflt_arpt_srl,
                             dflt_arpt_jrny_typ,dflt_car_typ,ubr_all_cars,ubr_supp,ubr_bkngfee_dsply,pos_pymnt_typ,
                             pos_cntry_cd,bkng_fee,act_inact_ind,crt_by_usr_cd,crt_dttm,mod_by_usr_cd,mod_dttm) 
                             VALUES (@pos_grp_id,@pos_grp_nam,@pos_cd,@lang_cds,@dflt_lang_cd,@end_pnt_nam,@tui_city_cds,
                             @tour_city_nam,@auto_rfrsh_tm,@apis_enbld,@trm_appl_cds,@hmpg_typ,@hmpg_todo,@hmpg_slide,
                             @hmpg_hlp,@hmpg_flght,@hmpg_cncl,@appl_arpt_srls,@dflt_arpt_srl,@dflt_arpt_jrny_typ,
                             @dflt_car_typ,@ubr_all_cars,@ubr_supp,@ubr_bkngfee_dsply,@pos_pymnt_typ,@pos_cntry_cd,
                             @bkng_fee,@act_inact_ind,@mod_by_usr_cd,GETDATE(),@mod_by_usr_cd,GETDATE());";
                }
                else
                {
                    query = @"UPDATE wkg_pos_grp_mast SET pos_grp_nam=@pos_grp_nam,pos_cd=@pos_cd,lang_cds=@lang_cds,
                             dflt_lang_cd=@dflt_lang_cd,end_pnt_nam=@end_pnt_nam,tui_city_cds=@tui_city_cds,
                             tour_city_nam=@tour_city_nam,auto_rfrsh_tm=@auto_rfrsh_tm,apis_enbld=@apis_enbld,
                             trm_appl_cds=@trm_appl_cds,hmpg_typ=@hmpg_typ,hmpg_todo=@hmpg_todo,hmpg_slide=@hmpg_slide,
                             hmpg_hlp=@hmpg_hlp,hmpg_flght=@hmpg_flght,hmpg_cncl=@hmpg_cncl,appl_arpt_srls=@appl_arpt_srls,
                             dflt_arpt_srl=@dflt_arpt_srl,dflt_arpt_jrny_typ=@dflt_arpt_jrny_typ,dflt_car_typ=@dflt_car_typ,
                             ubr_all_cars=@ubr_all_cars,ubr_supp=@ubr_supp,ubr_bkngfee_dsply=@ubr_bkngfee_dsply,
                             pos_pymnt_typ=@pos_pymnt_typ,pos_cntry_cd=@pos_cntry_cd,bkng_fee=@bkng_fee,
                             act_inact_ind=@act_inact_ind,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm=GETDATE() 
                             WHERE pos_grp_id=@pos_grp_id;";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM200SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM200SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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
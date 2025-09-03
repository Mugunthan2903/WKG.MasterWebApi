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
    public class SSM010Service : WKLServiceManger, ISSM010Service
    {
        #region Constructor
        public SSM010Service(IServiceProvider serviceProvider, ILogger<SSM010Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Private Methods
        public static string GenerateUniqueID()
        {
            DateTime date = DateTime.Now;
            string uniqueID = string.Format("{0}{1}{2}", date.Second, date.Millisecond, Guid.NewGuid().ToString("N").Substring(0, 15));
            return uniqueID;
        }

        private async Task<string> CallGetWs(string DomainPath, string cred)
        {
            string RemoteResponse = string.Empty;
            string ServicePath = "api/KeyRefresh/AddSSMConfiguration";
            try
            {

                var _qstr = "";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(DomainPath + ServicePath + _qstr);
                request.Method = "GET";
                request.Timeout = 60000;
                request.Headers.Add("api-key", cred);
                request.Headers.Add("Content-Type", "application/json");
                request.ContentType = "application/json";
                using (HttpWebResponse response = (HttpWebResponse)(await request.GetResponseAsync()))
                using (System.IO.Stream dataStream = response.GetResponseStream())
                using (System.IO.StreamReader reader = new System.IO.StreamReader(dataStream))
                {
                    RemoteResponse = await reader.ReadToEndAsync();
                }

                return RemoteResponse;
            }
            catch (WebException ex)
            {

                RemoteResponse = "×" + ex.Message.ToString();
            }
            return RemoteResponse;
        }

        #endregion

        #region Public Methods SSM010-Group

        public async Task<SSM010loadObject> SSM010GetOnloadAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM010loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM010 Onload
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

                                  SELECT Cntry_cd,Cntry_desc FROM rps_cntry_mast WHERE ssm_actv=1 AND Act_inact_ind='A'
                                  ORDER BY ISNULL(Sort_ordr,9999);

                                  SELECT crrg_id,crrg_nam,act_inact_ind FROM wkg_dstrbsn_carriage_dtls WHERE lang_cd=@lang_cd AND crrg_prod_aval= 1;
                                 
                                  SELECT pos_cd , pos_nam ,act_inact_ind FROM wkg_pos_mast WHERE  act_inact_ind = 1;

                                  SELECT trm_srl, trm_nam, act_inact_ind FROM wkg_supp_terms_mast;";

                List<SSM010Object> tbl1 = null;
                List<SSM010LangObject> tbl2 = null;
                List<SSM010LangObject> tbl3 = null;
                List<SSM010AirportObject> tbl4 = null;
                List<SSM010AirportObject> tbl5 = null;
                List<SSM010EndpointObject> tbl6 = null;
                List<SSM020SrchRsltHome> tbl7 = null;
                List<SSM010ApiEnableObject> tbl8 = null;
                List<SelectBox> tbl9 = null;
                List<SelectBox> tbl10 = null;
                List<SelectBox> tbl11 = null;
                List<SelectBox> tbl12 = null;


                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM010Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM010Object obj1 = new SSM010Object();

                        obj1.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj1.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");

                        tbl1.Add(obj1);
                    }

                    tbl2 = new List<SSM010LangObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM010LangObject obj2 = new SSM010LangObject();
                        obj2.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj2.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl2.Add(obj2);

                    }

                    tbl3 = new List<SSM010LangObject>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM010LangObject obj3 = new SSM010LangObject();
                        obj3.lang_cd_mast = r.GetValue<string>("lang_cd");
                        obj3.lang_nam_mast = r.GetValue<string>("lang_nam");

                        tbl3.Add(obj3);

                    }
                    tbl4 = new List<SSM010AirportObject>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SSM010AirportObject obj4 = new SSM010AirportObject();
                        obj4.arpt_srl_mast = r.GetValue<string>("arpt_srl");
                        obj4.arpt_nam_mast = r.GetValue<string>("arpt_nam");

                        tbl4.Add(obj4);
                    }
                    tbl5 = new List<SSM010AirportObject>();
                    foreach (DataRow r in DS.Tables[4].Rows)
                    {
                        SSM010AirportObject obj5 = new SSM010AirportObject();
                        obj5.arpt_srl_mast = r.GetValue<string>("arpt_srl");
                        obj5.arpt_nam_mast = r.GetValue<string>("arpt_nam");

                        tbl5.Add(obj5);
                    }
                    tbl6 = new List<SSM010EndpointObject>();
                    foreach (DataRow r in DS.Tables[5].Rows)
                    {
                        SSM010EndpointObject obj6 = new SSM010EndpointObject();
                        obj6.end_pnt_nam = r.GetValue<string>("end_pnt_nam");
                        tbl6.Add(obj6);
                    }
                    tbl8 = new List<SSM010ApiEnableObject>();
                    foreach (DataRow r in DS.Tables[6].Rows)
                    {
                        SSM010ApiEnableObject obj8 = new SSM010ApiEnableObject();
                        obj8.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj8.supp_nam = r.GetValue<string>("supp_nam");
                        obj8.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        tbl8.Add(obj8);
                    }
                    tbl9 = new List<SelectBox>();
                    foreach (DataRow r in DS.Tables[7].Rows)
                    {
                        SelectBox obj9 = new SelectBox();
                        obj9.ID = r.GetValue<string>("Cntry_cd");
                        obj9.Text = r.GetValue<string>("Cntry_desc");
                        tbl9.Add(obj9);
                    }
                    tbl10 = new List<SelectBox>();
                    foreach (DataRow r in DS.Tables[8].Rows)
                    {
                        SelectBox obj10 = new SelectBox();
                        obj10.ID = r.GetValue<string>("crrg_id");
                        obj10.Text = r.GetValue<string>("crrg_nam");
                        obj10.Default = r.GetValue<bool?>("act_inact_ind");
                        tbl10.Add(obj10);
                    }
                    tbl11 = new List<SelectBox>();
                    foreach (DataRow r in DS.Tables[9].Rows)
                    {
                        SelectBox obj11 = new SelectBox();
                        obj11.ID = r.GetValue<string>("pos_cd");
                        obj11.Text = r.GetValue<string>("pos_nam");
                        obj11.Default = r.GetValue<bool?>("act_inact_ind");
                        tbl11.Add(obj11);
                    }
                    tbl12 = new List<SelectBox>();
                    foreach (DataRow r in DS.Tables[10].Rows)
                    {
                        SelectBox obj12 = new SelectBox();
                        obj12.ID = r.GetValue<string>("trm_srl");
                        obj12.Text = r.GetValue<string>("trm_nam");
                        obj12.Default = r.GetValue<bool?>("act_inact_ind");
                        tbl12.Add(obj12);
                    }
                    SSM010loadObject obj = new SSM010loadObject();
                    obj.Items = tbl1;
                    obj.LangItems = tbl2;
                    obj.LangItemsAll = tbl3;
                    obj.AirportItem = tbl4;
                    obj.AirportItemAll = tbl5;
                    obj.EndpointItem = tbl6;
                    obj.TuiCityItem = tbl7;
                    obj.ApiEnableItem = tbl8;
                    obj.CountryCodeList = tbl9;
                    obj.DistribusionCrrgList = tbl10;
                    obj.PosconfigList = tbl11;
                    obj.TermsList = tbl12;
                    obj.JourneyTpyeList = StaticData.SSM010SC.JourneyTpyeList;
                    obj.HomePageList = StaticData.SSM010SC.HomePageList;
                    obj.HomescreenList = StaticData.SSM010SC.HomescreenList;
                    obj.CartypeList = StaticData.SSM010SC.CartypeList;
                    obj.PaymentTypList = StaticData.SSM010SC.PaymentTypeList;
                    obj.UberSupplierList = StaticData.SSM010SC.UberSupplierList;
                    obj.UberPricingList = StaticData.SSM010SC.UberPricingList;
                    obj.Pos_code = StaticData.SSM010SC.Pos_code;
                    obj.CarType = StaticData.SSM017SC.CarType;
                    obj.DBSuppMapID = StaticData.SupplierMapId.Distribusion;
                    obj.HomeScreenTypes = StaticData.SSM010SC.HomeScreenTypes;
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

        public async Task<SSM010BlurObject> SSM010BlurAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM010BlurObject();
            var Items = new SSM010Object();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                //SSM010 checks if record exists in home page for group id
                string query = @"SELECT (SELECT MIN(hmpg.pos_grp_id) FROM wkg_pos_grp_hmpg_dtls hmpg WHERE hmpg.pos_grp_id =@pos_grp_id) AS pos_grp_id,
                                 mast.hmpg_typ FROM wkg_pos_grp_mast mast WHERE mast.pos_grp_id = @pos_grp_id;";

                Items = await this.DBUtils(true).GetEntityDataAsync<SSM010Object>(query, dbParamters, r =>
                {
                    return new SSM010Object
                    {
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        hmpg_typ = r.GetValue<string>("hmpg_typ"),
                    };
                });

                if (Items != null && Items.pos_grp_id != null)
                {
                    output.Items = Items;
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

        public async Task<PageInfo<SSM010Object>> SSM010GetSearchAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new PageInfo<SSM010Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"%{input.pos_grp_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;

                if (!string.IsNullOrWhiteSpace(input.pos_grp_nam))
                {
                    var SSMOutput = new PageInfo<SSM010Object>();
                    //SSM010 Search.retrives records from the wkg_pos_ssm_config table
                    query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY grp.pos_grp_nam" : "ORDER BY grp.pos_grp_nam DESC")}) AS cnt, 
                               ssm.pos_grp_id, MIN(grp.pos_grp_nam) AS pos_grp_nam,grp.act_inact_ind, 
                               COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_config ssm INNER JOIN wkg_pos_grp_mast grp ON 
                               grp.pos_grp_id = ssm.pos_grp_id AND grp.act_inact_ind = @act_inact_ind 
                               WHERE ssm_id LIKE @pos_grp_nam OR ssm_nam LIKE @pos_grp_nam GROUP BY ssm.pos_grp_id, 
                               grp.pos_grp_nam,grp.act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                    SSMOutput.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM010Object>(query, dbParamters, r =>
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        return new SSM010Object
                        {
                            pos_grp_id = r.GetValue<string>("pos_grp_id"),
                            pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                            act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        };
                    });
                    SSMOutput.TotalRecords = totalrecords;
                    SSMOutput.CurrentPage = input.PageNo;
                    SSMOutput.SetPages(output.TotalRecords, input.PageSize);
                    if (SSMOutput.Items != null && SSMOutput.Items.Count > 0)
                    {
                        output = SSMOutput;
                        return output;
                    }
                    else
                    {   //SSM010 Search.retrives records from the wkg_pos_grp_mast table
                        query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY grp.pos_grp_nam" : "ORDER BY grp.pos_grp_nam DESC")} ) AS cnt ,
                                   grp.pos_grp_id,grp.pos_grp_nam,grp.act_inact_ind,grp.pos_cd, 
                                   COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast grp Where 
                                   grp.pos_grp_nam LIKE @pos_grp_nam AND  grp.act_inact_ind = @act_inact_ind ) AS temp WHERE 
                                   temp.cnt BETWEEN @startrow AND @endrow;";
                    }
                }
                else
                {   //SSM010 Empty Search.retrives records from wkg_pos_grp_mast
                    query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY grp.pos_grp_nam" : "ORDER BY grp.pos_grp_nam DESC")} ) AS cnt,
                               grp.pos_grp_id,grp.pos_grp_nam,grp.act_inact_ind,grp.pos_cd, COUNT(*) OVER () AS total_count FROM wkg_pos_grp_mast grp Where grp.pos_grp_nam 
                               LIKE @pos_grp_nam AND  grp.act_inact_ind = @act_inact_ind ) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                }

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM010Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM010Object
                    {
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
                        pos_cd = r.GetValue<string>("pos_cd"),


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

        public async Task<SSM010loadObject> SSM010GetSelectAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM010loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                //SSM010 load selected data
                query = @"SELECT grp.pos_grp_id,grp.pos_grp_nam,grp.act_inact_ind,grp.pos_cd,grp.lang_cds,grp.trm_appl_cds,
                          ISNULL(grp.pos_cntry_cd,'GB') AS pos_cntry_cd,ISNULL(grp.pos_pymnt_typ,'S') AS pos_pymnt_typ,
                          grp.dflt_lang_cd,grp.end_pnt_nam,grp.hmpg_typ,grp.apis_enbld,grp.dstrbsn_cntry_cds,grp.dstrbsn_cnctd_stn,
                          grp.auto_rfrsh_tm,grp.hmpg_todo,grp.hmpg_slide,grp.hmpg_hlp,grp.hmpg_flght,grp.hmpg_cncl,grp.dstrbsn_crrg_ids,
                          grp.appl_arpt_srls,grp.dflt_arpt_srl,grp.dflt_arpt_jrny_typ,grp.dflt_car_typ,grp.ubr_all_cars,
                          grp.ubr_supp,grp.ubr_bkngfee_dsply,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd_final,
                          REPLACE(CONVERT(VARCHAR,grp.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),grp.mod_dttm,108) AS mod_dttm_final,
                          (SELECT STRING_AGG((CAST(citymast.City_cd AS VARCHAR) + '/' + citymast.City_desc + ' - ' + cntry.Cntry_desc), ', ') FROM rps_city_mast citymast
                          INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd=citymast.Cntry_cd
                          WHERE citymast.City_cd IN((SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(grp.tui_city_cds,''), ',')))) AS tui_city_cds 
                          FROM wkg_pos_grp_mast grp 
                          INNER JOIN rps_usr_mast usr ON usr.Usr_id = grp.mod_by_usr_cd 
                          INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where pos_grp_id = @pos_grp_id;

                           SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY ssm.ssm_nam ) AS cnt ,ssm.ssm_nam ,ssm.ssm_id, 
                           ssm.ssm_status, COUNT(*) OVER () AS total_count FROM wkg_pos_ssm_config ssm Where 
                           ssm.pos_grp_id = @pos_grp_id AND ssm.ssm_status = @act_inact_ind) AS temp WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                List<SSM010Object> tbl1 = null;
                List<SSM010SSMObject> tbl2 = null;
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM010Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM010Object obj1 = new SSM010Object();

                        obj1.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj1.pos_grp_nam = r.GetValue<string>("pos_grp_nam");
                        obj1.act_inact_ind = r.GetValue<string>("act_inact_ind");
                        obj1.pos_cd = r.GetValue<string>("pos_cd");
                        obj1.lang_cds = r.GetValue<string>("lang_cds");
                        obj1.dflt_lang_cd = r.GetValue<string>("dflt_lang_cd");
                        obj1.end_pnt_nam = r.GetValue<string>("end_pnt_nam");
                        obj1.tui_city_cds = r.GetValue<string>("tui_city_cds");
                        obj1.hmpg_typ = r.GetValue<string>("hmpg_typ");
                        obj1.apis_enbld = r.GetValue<string>("apis_enbld");
                        obj1.auto_rfrsh_tm = r.GetValue<string>("auto_rfrsh_tm");
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
                        obj1.dstrbsn_cntry_cds = r.GetValue<string>("dstrbsn_cntry_cds");
                        obj1.dstrbsn_cnctd_stn = r.GetValue<bool?>("dstrbsn_cnctd_stn");
                        obj1.dstrbsn_crrg_ids = r.GetValue<string>("dstrbsn_crrg_ids");
                        obj1.trm_appl_cds = r.GetValue<string>("trm_appl_cds");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd_final");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm_final");

                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM010SSMObject>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM010SSMObject obj2 = new SSM010SSMObject();
                        obj2.ssm_nam_mast = r.GetValue<string>("ssm_nam");
                        obj2.ssm_id_mast = r.GetValue<string>("ssm_id");
                        obj2.ssm_status_mast = r.GetValue<string>("ssm_status");

                        tbl2.Add(obj2);

                    }

                    SSM010loadObject obj = new SSM010loadObject();
                    obj.Items = tbl1;
                    obj.SSMItems = tbl2;
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

        public async Task<OperationStatus> SSM010SaveAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam}");
                dbParamters.Add("@pos_cd", $"{input.pos_cd}");
                dbParamters.Add("@lang_cds", input.lang_cds != "" ? $"{input.lang_cds}" : null);
                dbParamters.Add("@dflt_lang_cd", input.dflt_lang_cd != "" ? $"{input.dflt_lang_cd}" : null);
                dbParamters.Add("@end_pnt_nam", $"{input.end_pnt_nam}");
                dbParamters.Add("@tui_city_cds", input.tui_city_cds);
                dbParamters.Add("@auto_rfrsh_tm", input.auto_rfrsh_tm != "" ? $"{input.auto_rfrsh_tm}" : null);
                dbParamters.Add("@hmpg_todo", $"{input.hmpg_todo}");
                dbParamters.Add("@hmpg_slide", $"{input.hmpg_slide}");
                dbParamters.Add("@hmpg_hlp", $"{input.hmpg_hlp}");
                dbParamters.Add("@hmpg_flght", $"{input.hmpg_flght}");
                dbParamters.Add("@hmpg_cncl", $"{input.hmpg_cncl}");
                dbParamters.Add("@appl_arpt_srls", input.appl_arpt_srls != "" ? $"{input.appl_arpt_srls}" : null);
                dbParamters.Add("@dflt_arpt_srl ", input.dflt_arpt_srl != "" ? $"{input.dflt_arpt_srl}" : null);
                dbParamters.Add("@dflt_arpt_jrny_typ", input.dflt_arpt_jrny_typ != "" ? $"{input.dflt_arpt_jrny_typ}" : null);
                dbParamters.Add("@dflt_car_typ", input.dflt_car_typ != "" ? $"{input.dflt_car_typ}" : null);
                dbParamters.Add("@ubr_all_cars", $"{input.ubr_all_cars}");
                dbParamters.Add("@ubr_supp", $"{input.ubr_supp}");
                dbParamters.Add("@ubr_bkngfee_dsply", $"{input.ubr_bkngfee_dsply}");
                dbParamters.Add("@hmpg_typ", $"{input.hmpg_typ}");
                dbParamters.Add("@apis_enbld", $"{input.apis_enbld}");
                dbParamters.Add("@trm_appl_cds", $"{input.trm_appl_cds}");
                dbParamters.Add("@pos_pymnt_typ", $"{input.pos_pymnt_typ}");
                dbParamters.Add("@pos_cntry_cd", $"{input.pos_cntry_cd}");
                dbParamters.Add("@dstrbsn_crrg_ids", $"{input.dstrbsn_crrg_ids}");
                dbParamters.Add("@dstrbsn_cntry_cds", $"{input.dstrbsn_cntry_cds}");
                dbParamters.Add("@dstrbsn_cnctd_stn", input.dstrbsn_cnctd_stn);
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                dbParamters.Add("@mod_dttm", $"{input.mod_dttm}");

                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {   //SSM010 Update
                    query = @"UPDATE wkg_pos_grp_mast SET pos_grp_nam=@pos_grp_nam,pos_cd =@pos_cd,lang_cds=@lang_cds,trm_appl_cds=@trm_appl_cds,
                               dflt_lang_cd=@dflt_lang_cd,end_pnt_nam=@end_pnt_nam,tui_city_cds=@tui_city_cds,
                               auto_rfrsh_tm= @auto_rfrsh_tm,hmpg_todo= @hmpg_todo,hmpg_slide=@hmpg_slide,dstrbsn_cnctd_stn=@dstrbsn_cnctd_stn,
                               hmpg_hlp= @hmpg_hlp,hmpg_flght= @hmpg_flght,hmpg_cncl= @hmpg_cncl,appl_arpt_srls= @appl_arpt_srls,
                               dflt_arpt_srl= @dflt_arpt_srl,dflt_arpt_jrny_typ= @dflt_arpt_jrny_typ,dflt_car_typ=@dflt_car_typ,
                               ubr_all_cars=@ubr_all_cars,ubr_supp =@ubr_supp,ubr_bkngfee_dsply=@ubr_bkngfee_dsply,apis_enbld=@apis_enbld,hmpg_typ=@hmpg_typ,dstrbsn_crrg_ids=@dstrbsn_crrg_ids,
                               pos_cntry_cd=@pos_cntry_cd,dstrbsn_cntry_cds=@dstrbsn_cntry_cds,pos_pymnt_typ=@pos_pymnt_typ,act_inact_ind=@act_inact_ind,
                               mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate() WHERE pos_grp_id = @pos_grp_id;";
                    if (input.DISBTNCHANGE == true)
                    {
                        query += @"UPDATE wkg_pos_ssm_config SET dstrbsn_loc_upd_dttm = null WHERE pos_grp_id = @pos_grp_id;";
                    }
                    if (!string.IsNullOrEmpty(input.hmpg_typ) && input.hmpg_typ != StaticData.SSM010SC.HomeScreenTypes["Standard"] && input.hmpg_typ != StaticData.SSM010SC.HomeScreenTypes["HomeScreen2"] && input.hmpg_typ != StaticData.SSM010SC.HomeScreenTypes["Tenerife"])
                    {
                        query += @"UPDATE wkg_pos_grp_hmpg_dtls SET act_inact_ind = 0 WHERE pos_grp_id = @pos_grp_id AND hmpg_sctn_cd = 'SEC5';
                                   UPDATE wkg_pos_grp_slide_dtls SET act_inact_ind = 0 WHERE pos_grp_id = @pos_grp_id;
                                   UPDATE wkg_pos_grp_todo_dtls SET act_inact_ind = 0 WHERE pos_grp_id = @pos_grp_id;";
                    }
                    if (!string.IsNullOrEmpty(input.hmpg_typ) && input.hmpg_typ == StaticData.SSM010SC.HomeScreenTypes["OTHHeathrow"])
                    {
                        query += @"UPDATE wkg_pos_grp_hmpg_dtls SET form_id = null WHERE pos_grp_id = @pos_grp_id AND hmpg_sctn_cd = 'SEC1';";
                    }


                }
                if (input.Mode.ToUpper() == "SAVE")
                {   //SSM010 Insert
                    query = @"INSERT INTO wkg_pos_grp_mast(pos_grp_nam,pos_cd,lang_cds,dflt_lang_cd,end_pnt_nam,dstrbsn_crrg_ids,trm_appl_cds,
                               tui_city_cds,auto_rfrsh_tm,hmpg_todo,hmpg_slide,hmpg_hlp,hmpg_flght,hmpg_cncl,dstrbsn_cntry_cds,
                               appl_arpt_srls,dflt_arpt_srl,dflt_arpt_jrny_typ,dflt_car_typ,ubr_all_cars,ubr_supp,ubr_bkngfee_dsply,dstrbsn_cnctd_stn,
                               apis_enbld,hmpg_typ,pos_cntry_cd,pos_pymnt_typ,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES(@pos_grp_nam,@pos_cd,
                               @lang_cds,@dflt_lang_cd,@end_pnt_nam,@dstrbsn_crrg_ids,@trm_appl_cds,@tui_city_cds,@auto_rfrsh_tm,@hmpg_todo,@hmpg_slide,
                               @hmpg_hlp,@hmpg_flght,@hmpg_cncl,@dstrbsn_cntry_cds,@appl_arpt_srls,@dflt_arpt_srl,@dflt_arpt_jrny_typ,
                               @dflt_car_typ,@ubr_all_cars,@ubr_supp,@ubr_bkngfee_dsply,@dstrbsn_cnctd_stn,@apis_enbld,@hmpg_typ,@pos_cntry_cd,@pos_pymnt_typ,
                               @act_inact_ind,@mod_by_usr_cd,getdate());";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM010SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM010SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM011-SSM

        public async Task<SSM011BlurObject> SSM011BlurAsync(SessionInfo sessionInfo, SSM011Object input)
        {
            var output = new SSM011BlurObject();
            try
            {
                var dbParamters = new DBParameters();


                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string grp_id = "";
                //SSM011 Checks if records exists in the wkg_pos_ssm_config
                string query = @"select ssm_id ,ssm_nam, ssm.pos_grp_id , grp.pos_grp_nam FROM wkg_pos_ssm_config ssm 
                                  INNER JOIN wkg_pos_grp_mast grp ON ssm.pos_grp_id = grp.pos_grp_id where 
                                  ssm.ssm_id = @ssm_id;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM011Object>(query, dbParamters, r =>
                {
                    grp_id = r.GetValue<string>("pos_grp_id");
                    return new SSM011Object
                    {
                        ssm_id = r.GetValue<string>("ssm_id"),
                        ssm_nam = r.GetValue<string>("ssm_nam"),
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        pos_grp_nam = r.GetValue<string>("pos_grp_nam"),
                    };
                });

                if (output.Items != null && output.Items.Count > 0)
                {
                    if (input.pos_grp_id == grp_id)
                    {
                        output.Isavailable = true;
                    }
                    else
                    {
                        output.ErrorNo = -1;
                    }

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

        public async Task<SSM011loadObject> SSM011GetSearchAsync(SessionInfo sessionInfo, SSM011Object input)
        {
            var output = new SSM011loadObject();
            try
            {
                List<SSM011Object> tbl1 = null;
                List<SSM011Custdtls> tbl2 = null;
                List<SSM011Outlt> tbl3 = null;
                List<SSM011UberUuid> tbl4 = null;
                List<SSM011ArenaLocation> tbl5 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.Distribusion);
                //SSM011 Onload
                string query = @"SELECT ssm.ssm_id,ssm.pos_grp_id,ssm.ssm_nam,ssm.rfrsh_crtd,ssm.rfrsh_schdld,
                                 ssm.rfrsh_compl,ssm.last_rfrsh,ssm.dflt_loc_desc,ssm.dflt_loc_lat,ssm.dflt_loc_lon,ssm.hndpnt_key,
                                 ssm.dflt_loc_post_cd,ssm.dflt_loc_shrt_nam,ssm.Outlt_cd,ssm.Cust_cd,ssm.bkng_fee,ssm.ubr_org_uuid,ssm.arena_loc_srl,
                                 ssm.bkng_fee_typ,ssm.ssm_status,ssm.pos_pymnt_typ,ssm.dflt_ubr_subzn_nam,ssm.dflt_ubr_acspnt_nam,ssm.frdm_str_id,ssm.frdm_trmnl_id,ssm.frdm_dcc_req,ssm.hndpnt_srl_num,ssm.hndpnt_trmnl_typ,emp.emp_fname + ' ' + emp.emp_lname
                                 AS mod_by_usr_cd_final,REPLACE(CONVERT(VARCHAR,ssm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),ssm.mod_dttm,108)
                                 AS mod_dttm_final FROM wkg_pos_ssm_config ssm INNER JOIN rps_usr_mast usr
                                 ON usr.Usr_id = ssm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                 WHERE ssm_id = @ssm_id AND pos_grp_id = @pos_grp_id;

                                  select Cust_cd,Cust_nam from rps_cust_mast where Cust_stat='A';select Outlt_cd,Outlt_nam 
                                  from rps_outlt_mast where Act_inact_ind='A';

                                  SELECT ubr_org_uuid_nam,ubr_org_uuid FROM wkg_supp_ubr_uuid;

                                  SELECT loc_srl,loc_nam,act_inact_ind FROM wkg_trnsfr_arena_loc_dtls;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {

                    tbl1 = new List<SSM011Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM011Object obj1 = new SSM011Object();
                        obj1.ssm_id = r.GetValue<string>("ssm_id");
                        obj1.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        obj1.ssm_nam = r.GetValue<string>("ssm_nam");
                        obj1.rfrsh_crtd = r.GetValue<string>("rfrsh_crtd");
                        obj1.rfrsh_schdld = r.GetValue<string>("rfrsh_schdld");
                        obj1.rfrsh_compl = r.GetValue<string>("rfrsh_compl");
                        obj1.last_rfrsh = r.GetValue<string>("last_rfrsh");
                        obj1.dflt_loc_desc = r.GetValue<string>("dflt_loc_desc");
                        obj1.dflt_loc_lat = r.GetValue<string>("dflt_loc_lat");
                        obj1.dflt_loc_lon = r.GetValue<string>("dflt_loc_lon");
                        obj1.dflt_loc_post_cd = r.GetValue<string>("dflt_loc_post_cd");
                        obj1.dflt_loc_shrt_nam = r.GetValue<string>("dflt_loc_shrt_nam");
                        obj1.Outlt_cd = r.GetValue<string>("Outlt_cd");
                        obj1.Cust_cd = r.GetValue<string>("Cust_cd");
                        obj1.ubr_org_uuid = r.GetValue<string>("ubr_org_uuid");
                        obj1.arena_loc_srl = r.GetValue<string>("arena_loc_srl");
                        obj1.bkng_fee = r.GetValue<string>("bkng_fee");
                        obj1.bkng_fee_typ = r.GetValue<string>("bkng_fee_typ");
                        obj1.hndpnt_srl_num = r.GetValue<string>("hndpnt_srl_num");
                        obj1.hndpnt_trmnl_typ = r.GetValue<string>("hndpnt_trmnl_typ");
                        obj1.hndpnt_key = r.GetValue<string>("hndpnt_key");
                        obj1.pos_pymnt_typ = r.GetValue<string>("pos_pymnt_typ");
                        obj1.frdm_str_id = r.GetValue<string>("frdm_str_id");
                        obj1.frdm_trmnl_id = r.GetValue<string>("frdm_trmnl_id");
                        obj1.frdm_dcc_req = r.GetValue<string>("frdm_dcc_req");
                        obj1.dflt_ubr_subzn_nam = r.GetValue<string>("dflt_ubr_subzn_nam");
                        obj1.dflt_ubr_acspnt_nam = r.GetValue<string>("dflt_ubr_acspnt_nam");
                        obj1.ssm_status = r.GetValue<string>("ssm_status");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd_final");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm_final");
                        tbl1.Add(obj1);

                    }
                    tbl2 = new List<SSM011Custdtls>();
                    foreach (DataRow DR2 in DS.Tables[1].Rows)
                    {
                        SSM011Custdtls obj2 = new SSM011Custdtls();
                        obj2.Cust_cd = DR2.GetValue<string>("Cust_cd");
                        obj2.Cust_nam = DR2.GetValue<string>("Cust_nam");
                        tbl2.Add(obj2);
                    }
                    tbl3 = new List<SSM011Outlt>();
                    foreach (DataRow DR2 in DS.Tables[2].Rows)
                    {
                        SSM011Outlt obj3 = new SSM011Outlt();
                        obj3.Outlt_cd = DR2.GetValue<string>("Outlt_cd");
                        obj3.Outlt_nam = DR2.GetValue<string>("Outlt_nam");
                        tbl3.Add(obj3);
                    }
                    tbl4 = new List<SSM011UberUuid>();
                    foreach (DataRow DR3 in DS.Tables[3].Rows)
                    {
                        SSM011UberUuid obj4 = new SSM011UberUuid();
                        obj4.Uber_Uuid = DR3.GetValue<string>("ubr_org_uuid");
                        obj4.Uber_Uuid_nam = DR3.GetValue<string>("ubr_org_uuid_nam");
                        tbl4.Add(obj4);
                    }
                    tbl5 = new List<SSM011ArenaLocation>();
                    foreach (DataRow DR4 in DS.Tables[4].Rows)
                    {
                        SSM011ArenaLocation obj5 = new SSM011ArenaLocation();
                        obj5.loc_srl = DR4.GetValue<string>("loc_srl");
                        obj5.loc_nam = DR4.GetValue<string>("loc_nam");
                        obj5.act_inact_ind = DR4.GetValue<bool>("act_inact_ind");
                        tbl5.Add(obj5);
                    }
                }
                output.Items = tbl1;
                output.Custdtls = tbl2;
                output.Outlt = tbl3;
                output.UberUuidList = tbl4;
                output.ArenaLocations = tbl5;
                output.PaymentTypList = StaticData.SSM010SC.PaymentTypeList;
                output.BookingFeeType = StaticData.Common.BookingFeeType;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<OperationStatus> SSM011SaveAsync(SessionInfo sessionInfo, SSM011Object input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@ssm_nam", input.ssm_nam != "" ? $"{input.ssm_nam}" : null);
                dbParamters.Add("@rfrsh_crtd", input.rfrsh_crtd != "" ? $"{input.rfrsh_crtd}" : null);
                dbParamters.Add("@rfrsh_schdld", input.rfrsh_schdld != "" ? $"{input.rfrsh_schdld}" : null);
                dbParamters.Add("@rfrsh_compl", input.rfrsh_compl != "" ? $"{input.rfrsh_compl}" : null);
                dbParamters.Add("@last_rfrsh", input.last_rfrsh != "" ? $"{input.last_rfrsh}" : null);
                dbParamters.Add("@dflt_loc_desc", input.dflt_loc_desc != "" ? $"{input.dflt_loc_desc}" : null);
                dbParamters.Add("@dflt_loc_lat", input.dflt_loc_lat != "" ? $"{input.dflt_loc_lat}" : null);
                dbParamters.Add("@dflt_loc_lon", input.dflt_loc_lon != "" ? $"{input.dflt_loc_lon}" : null);
                dbParamters.Add("@dflt_loc_post_cd", input.dflt_loc_post_cd != "" ? $"{input.dflt_loc_post_cd}" : null);
                dbParamters.Add("@dflt_loc_shrt_nam", input.dflt_loc_shrt_nam != "" ? $"{input.dflt_loc_shrt_nam}" : null);
                dbParamters.Add("@Outlt_cd ", input.Outlt_cd != "" ? $"{input.Outlt_cd}" : null);
                dbParamters.Add("@Cust_cd", input.Cust_cd != "" ? $"{input.Cust_cd}" : null);
                dbParamters.Add("@ubr_org_uuid", input.ubr_org_uuid != "" ? $"{input.ubr_org_uuid}" : null);
                dbParamters.Add("@arena_loc_srl", input.arena_loc_srl != "" ? $"{input.arena_loc_srl}" : null);
                dbParamters.Add("@bkng_fee", input.bkng_fee != "" ? $"{input.bkng_fee}" : null);
                dbParamters.Add("@bkng_fee_typ", input.bkng_fee_typ != "" ? $"{input.bkng_fee_typ}" : null);
                dbParamters.Add("@hndpnt_srl_num", input.hndpnt_srl_num != "" ? $"{input.hndpnt_srl_num}" : null);
                dbParamters.Add("@hndpnt_trmnl_typ", input.hndpnt_trmnl_typ != "" ? $"{input.hndpnt_trmnl_typ}" : null);
                dbParamters.Add("@hndpnt_key", input.hndpnt_key != "" ? $"{input.hndpnt_key}" : null);
                dbParamters.Add("@pos_pymnt_typ", input.pos_pymnt_typ != "" ? $"{input.pos_pymnt_typ}" : null);
                dbParamters.Add("@frdm_str_id", input.frdm_str_id != "" ? $"{input.frdm_str_id}" : null);
                dbParamters.Add("@frdm_trmnl_id", input.frdm_trmnl_id != "" ? $"{input.frdm_trmnl_id}" : null);
                dbParamters.Add("@frdm_dcc_req", input.frdm_dcc_req != "" ? $"{input.frdm_dcc_req}" : null);
                dbParamters.Add("@dflt_ubr_subzn_nam", input.dflt_ubr_subzn_nam != "" ? $"{input.dflt_ubr_subzn_nam}" : null);
                dbParamters.Add("@dflt_ubr_acspnt_nam", input.dflt_ubr_acspnt_nam != "" ? $"{input.dflt_ubr_acspnt_nam}" : null);
                dbParamters.Add("@ssm_status ", $"{input.ssm_status}");
                dbParamters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                dbParamters.Add("@mod_dttm", $"{input.mod_dttm}");
                dbParamters.Add("@stop_rfrsh", $"{input.stoprefresh}");
                //if (input.ImageChanged == "YES" && input.OldImg == "NO" && input.img_nam != null)
                //{
                //    if (files != null)
                //    {
                //        var tourser = this.GetService<IFileManagerService>();
                //        _ = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });

                //    }
                //}
                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {   //SSM011 Update

                    query = @"UPDATE wkg_pos_ssm_config SET ssm_nam=@ssm_nam,Outlt_cd=@Outlt_cd,Cust_cd=@Cust_cd,
                               bkng_fee=@bkng_fee,bkng_fee_typ=@bkng_fee_typ,rfrsh_crtd=@rfrsh_crtd,
                               rfrsh_schdld=@rfrsh_schdld,rfrsh_compl=@rfrsh_compl,last_rfrsh=@last_rfrsh,
                               dflt_loc_desc=@dflt_loc_desc,dflt_loc_lat=@dflt_loc_lat,dflt_loc_lon=@dflt_loc_lon,
                               dflt_loc_post_cd=@dflt_loc_post_cd,dflt_loc_shrt_nam=@dflt_loc_shrt_nam,hndpnt_key=@hndpnt_key,
                               hndpnt_srl_num=@hndpnt_srl_num,hndpnt_trmnl_typ=@hndpnt_trmnl_typ,pos_pymnt_typ=@pos_pymnt_typ,
                               frdm_str_id=@frdm_str_id,frdm_trmnl_id=@frdm_trmnl_id,frdm_dcc_req=@frdm_dcc_req,
                               dflt_ubr_subzn_nam=@dflt_ubr_subzn_nam,dflt_ubr_acspnt_nam=@dflt_ubr_acspnt_nam ,ssm_status=@ssm_status,
                               ubr_org_uuid=@ubr_org_uuid,arena_loc_srl=@arena_loc_srl,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate() 
                               WHERE pos_grp_id = @pos_grp_id AND ssm_id =@ssm_id;";

                }
                if (input.Mode.ToUpper() == "SAVE")
                {   //SSM011 Insert
                    string ssm_pwd = GenerateUniqueID();
                    dbParamters.Add("@ssm_pwd", ssm_pwd);

                    query = @"INSERT INTO wkg_pos_ssm_config(ssm_id,pos_grp_id,ssm_nam,Outlt_cd,Cust_cd,bkng_fee,
                               bkng_fee_typ,rfrsh_crtd,rfrsh_schdld,rfrsh_compl,last_rfrsh,dflt_loc_desc,dflt_loc_lat,
                               dflt_loc_lon,dflt_loc_post_cd,dflt_loc_shrt_nam,dflt_ubr_subzn_nam,dflt_ubr_acspnt_nam,ssm_status,ssm_pwd,pos_pymnt_typ,frdm_str_id,frdm_trmnl_id,frdm_dcc_req,hndpnt_srl_num,ubr_org_uuid,
                               arena_loc_srl,hndpnt_trmnl_typ,hndpnt_key,mod_by_usr_cd,mod_dttm ,stop_rfrsh)VALUES(@ssm_id,@pos_grp_id,@ssm_nam,@Outlt_cd,
                               @Cust_cd,@bkng_fee,@bkng_fee_typ,@rfrsh_crtd,@rfrsh_schdld,@rfrsh_compl,@last_rfrsh,
                               @dflt_loc_desc,@dflt_loc_lat,@dflt_loc_lon,@dflt_loc_post_cd,@dflt_loc_shrt_nam,@dflt_ubr_subzn_nam,@dflt_ubr_acspnt_nam,
                               @ssm_status,@ssm_pwd,@pos_pymnt_typ,@frdm_str_id,@frdm_trmnl_id,@frdm_dcc_req,@hndpnt_srl_num,@ubr_org_uuid,@arena_loc_srl,@hndpnt_trmnl_typ,@hndpnt_key,@mod_by_usr_cd,
                               getdate(),@stop_rfrsh);";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM011SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM011SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            output.Message = "Something went wrong";
                        }
                    }
                }

                if (input.Mode.ToUpper() == "SAVE" && output.IsSuccess)
                {
                    var Endpntdata = new List<SSM010EndpointObject>();
                    var EndpointdbParams = new DBParameters();
                    EndpointdbParams.Add("@pos_grp_id", $"{input.pos_grp_id}");
                    //SSM011 retrives end_pnt_nam,end_pnt_url,end_pnt_key from wkg_pos_grp_mast to invoke the service,
                    //while insert in wkg_pos_ssm_config.

                    //string endpointquery = @"select end_pnt_nam,end_pnt_url,end_pnt_key from wkg_pos_end_pnts where 
                    //                          end_pnt_nam=(select end_pnt_nam from wkg_pos_grp_mast 
                    //                          where pos_grp_id =@pos_grp_id);"; 

                    string endpointquery = @"SELECT end_pnt_nam,end_pnt_url,end_pnt_key FROM wkg_pos_end_pnts;";

                    Endpntdata = await this.DBUtils(true).GetEntityDataListAsync<SSM010EndpointObject>(endpointquery, EndpointdbParams, r =>
                    {
                        return new SSM010EndpointObject
                        {
                            end_pnt_nam = r.GetValue<string>("end_pnt_nam"),
                            end_pnt_url = r.GetValue<string>("end_pnt_url"),
                            end_pnt_key = r.GetValue<string>("end_pnt_key")
                        };
                    });

                    if (Endpntdata != null && Endpntdata.Count > 0)
                    {
                        var EndpntTaskList = Endpntdata
                            .Select(r => CallGetWs(r.end_pnt_url, r.end_pnt_key))
                            .ToList();

                        var results = await Task.WhenAll(EndpntTaskList);

                        if (results.Any(res => res.Contains("×") || res.ToString() != "Configuration updated successfully."))
                        {
                            output.Message = "SSM was successfully created. SSM service update failed. Please update the service manually.";
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

        public async Task<SSM011GridSSMObject> SSM011GridAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM011GridSSMObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@ssm_status", input.act_inact_ind);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                string query = "";
                int totalrecords = 0;
                //SSM011 grid pagination
                query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY ssm.ssm_nam" : "ORDER BY ssm.ssm_nam DESC")} ) AS cnt ,
                           ssm.ssm_nam ,ssm.ssm_id, ssm.ssm_status, COUNT(*) OVER () AS total_count 
                           FROM wkg_pos_ssm_config ssm Where ssm.pos_grp_id = @pos_grp_id AND ssm_status=@ssm_status ) AS temp WHERE temp.cnt 
                           BETWEEN @startrow AND @endrow;";

                output.SSMItems = await this.DBUtils(true).GetEntityDataListAsync<SSM010SSMObject>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM010SSMObject
                    {
                        ssm_nam_mast = r.GetValue<string>("ssm_nam"),
                        ssm_id_mast = r.GetValue<string>("ssm_id"),
                        ssm_status_mast = r.GetValue<string>("ssm_status")


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
        #endregion

        #region Public Methods SSM015-Generate Config
        public async Task<SSM010loadObject> SSM015ManageSSMAsync(SessionInfo sessionInfo, SSM011Object input)
        {
            var output = new SSM010loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = "";
                //SSM015 retrives records from wkg_pos_end_pnts, wkg_cntrl_param_mast, wkg_supp_config and wkg_pos_grp_mast for generate config
                query = @"SELECT end_pnt_nam,end_pnt_key,end_pnt_url,end_pnt_typ FROM wkg_pos_end_pnts;

                          SELECT img_dmn_path from wkg_cntrl_param_mast;

                          SELECT ssm_pwd from wkg_pos_ssm_config where ssm_id = @ssm_id;";
                List<SSM010ObjectEndpnts> tbl1 = null;
                List<SSM010Objectcntrl> tbl2 = null;
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM010ObjectEndpnts>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM010ObjectEndpnts obj1 = new SSM010ObjectEndpnts();
                        obj1.end_pnt_nam = r.GetValue<string>("end_pnt_nam");
                        obj1.end_pnt_key = r.GetValue<string>("end_pnt_key");
                        obj1.end_pnt_url = r.GetValue<string>("end_pnt_url");
                        obj1.end_pnt_typ = r.GetValue<string>("end_pnt_typ");
                        tbl1.Add(obj1);
                    }
                    tbl2 = new List<SSM010Objectcntrl>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM010Objectcntrl obj2 = new SSM010Objectcntrl();
                        obj2.img_dmn_path = r.GetValue<string>("img_dmn_path");
                        tbl2.Add(obj2);
                    }
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        output.ssm_pwd = r.GetValue<string>("ssm_pwd");

                    }
                    output.Endpoint = tbl1;
                    output.Cntrlmst = tbl2;
                }

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        #endregion

        #region Public Methods SSM016-Copy
        public async Task<OperationStatus> SSM016SaveCopyAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_nam", $"{input.pos_grp_nam}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                string query = "";

                //SSM016 Copy query
                //Insert into wkg_pos_grp_mast table
                query += @"INSERT INTO wkg_pos_grp_mast (pos_cd,pos_grp_nam,lang_cds,dflt_lang_cd,end_pnt_nam,auto_rfrsh_tm,
                            hmpg_todo,hmpg_slide,hmpg_hlp,hmpg_flght,hmpg_cncl,appl_arpt_srls,dflt_arpt_srl,dstrbsn_cnctd_stn,dstrbsn_cntry_cds,
                            dflt_arpt_jrny_typ,dflt_car_typ,ubr_all_cars,tui_city_cds,ubr_supp,ubr_bkngfee_dsply,act_inact_ind,mod_by_usr_cd,
                            mod_dttm,auto_rfrshd_dttm,hmpg_typ,apis_enbld,pos_cntry_cd,pos_pymnt_typ) SELECT pos_cd,@pos_grp_nam,lang_cds,dflt_lang_cd,
                            end_pnt_nam,auto_rfrsh_tm,hmpg_todo,hmpg_slide,hmpg_hlp,hmpg_flght,hmpg_cncl,appl_arpt_srls,
                            dflt_arpt_srl,dstrbsn_cnctd_stn,dstrbsn_cntry_cds,dflt_arpt_jrny_typ,dflt_car_typ,ubr_all_cars,tui_city_cds,ubr_supp,ubr_bkngfee_dsply,act_inact_ind,
                            @mod_by_usr_cd,GETDATE(),auto_rfrshd_dttm,hmpg_typ,apis_enbld,ISNULL(pos_cntry_cd,'GB'),
                            ISNULL(pos_pymnt_typ,'S') FROM wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id;";
                if (input.Popular_Dest)
                {    //Insert into wkg_pos_grp_poplr_destn
                    query += @"INSERT INTO wkg_pos_grp_poplr_destn (pos_grp_id, loc_desc, loc_lat,loc_lon,loc_post_cd,
                                loc_shrt_nam,sort_ordr,mod_by_usr_cd,mod_dttm) SELECT (select MAX(pos_grp_id) from 
                                wkg_pos_grp_mast) ,loc_desc,loc_lat,loc_lon,loc_post_cd,loc_shrt_nam,sort_ordr,
                                @mod_by_usr_cd,GETDATE() from wkg_pos_grp_poplr_destn where pos_grp_id=@pos_grp_id;";
                }
                if (input.Homepg_Config)
                {   //Insert into wkg_pos_grp_hmpg_dtls
                    query += @"INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, img_srl, 
                                form_id, cptn_bg_clr, pos_grp_id, mod_by_usr_cd, mod_dttm,head_img_srl,act_inact_ind,
                                sort_ordr,prod_id,supp_map_id,wkg_ctgry_id) SELECT hmpg_sctn_cd, head_data_srl, cptn_data_srl, img_srl, form_id, 
                                cptn_bg_clr,(select MAX(pos_grp_id) from wkg_pos_grp_mast),@mod_by_usr_cd , GETDATE(),
                                head_img_srl,act_inact_ind,sort_ordr,prod_id,supp_map_id,wkg_ctgry_id from wkg_pos_grp_hmpg_dtls 
                                where pos_grp_id = @pos_grp_id;";
                    //Insert into wkg_pos_grp_todo_dtls
                    query += @"INSERT INTO wkg_pos_grp_todo_dtls (pos_grp_id, data_srl, todo_bg_clr, todo_grdnt_clr,
                                img_srl,sort_ordr,form_id,prod_id,supp_map_id,tui_ctgry_id,act_inact_ind,mod_by_usr_cd,
                                mod_dttm,tot_aval_txt,aval_typ_data_srl,sec_typ) SELECT (select MAX(pos_grp_id) from wkg_pos_grp_mast),data_srl,todo_bg_clr,
                                todo_grdnt_clr,img_srl,sort_ordr,form_id,prod_id,supp_map_id,tui_ctgry_id,act_inact_ind,
                                @mod_by_usr_cd,GETDATE(),tot_aval_txt,aval_typ_data_srl,sec_typ from wkg_pos_grp_todo_dtls where pos_grp_id = @pos_grp_id;";
                    //Insert into wkg_pos_grp_slide_dtls
                    query += @"INSERT INTO wkg_pos_grp_slide_dtls (pos_grp_id, img_srl, sort_ordr,form_id,supp_map_id,
                                prod_id,act_inact_ind,mod_by_usr_cd,mod_dttm,wkg_ctgry_id) SELECT (select MAX(pos_grp_id) from 
                                wkg_pos_grp_mast), img_srl, sort_ordr,form_id,supp_map_id,prod_id,act_inact_ind,
                                @mod_by_usr_cd,GETDATE(),wkg_ctgry_id from wkg_pos_grp_slide_dtls where pos_grp_id = @pos_grp_id;";
                }
                if (input.Trans_Config)
                {   //Insert into wkg_pos_grp_trnsfr_post_fltr
                    query += @"INSERT INTO wkg_pos_grp_trnsfr_post_fltr (pos_grp_id,post_cd, car_typ, dflt_arpt, dflt_htl, 
                                eshuttle, act_inact_ind, mod_by_usr_cd, mod_dttm) SELECT (select MAX(pos_grp_id) from   
                                wkg_pos_grp_mast), post_cd, car_typ, dflt_arpt, dflt_htl, eshuttle, act_inact_ind, 
                                @mod_by_usr_cd, GETDATE() from wkg_pos_grp_trnsfr_post_fltr where pos_grp_id = @pos_grp_id;";
                }
                if (input.Banner_Config)
                {//Insert into wkg_pos_grp_bnr_dtls
                    query += @"INSERT INTO wkg_pos_grp_bnr_dtls (pos_grp_id,img_play_second,img_srl,sort_ordr,
                               act_inact_ind,mod_by_usr_cd,mod_dttm) SELECT (SELECT MAX(pos_grp_id) FROM   
                               wkg_pos_grp_mast), img_play_second, img_srl, sort_ordr, act_inact_ind, 
                               @mod_by_usr_cd, GETDATE() FROM wkg_pos_grp_bnr_dtls WHERE pos_grp_id = @pos_grp_id;";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM016SaveCopyAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM016SaveCopyAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region public Methods SSM017-Transfer Config

        public async Task<PageInfo<SSM010Object>> SSM017GetOnloadAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new PageInfo<SSM010Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@post_cd", $"%{input.post_cd?.Trim()}%");
                dbParamters.Add("@car_typ", $"{input.car_typ}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                //dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM017 transfer config onload
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY grp.post_cd ) AS cnt,grp.post_cd, 
                                  grp.car_typ, grp.dflt_arpt, grp.dflt_htl, grp.eshuttle, grp.act_inact_ind,
                                  COUNT(*) OVER () AS total_count FROM wkg_pos_grp_trnsfr_post_fltr grp 
                                  WHERE post_cd LIKE @post_cd AND car_typ = @car_typ AND pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM010Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM010Object
                    {
                        post_cd = r.GetValue<string>("post_cd"),
                        car_typ = r.GetValue<string>("car_typ"),
                        dflt_arpt = r.GetValue<string>("dflt_arpt"),
                        dflt_htl = r.GetValue<string>("dflt_htl"),
                        eshuttle = r.GetValue<string>("eshuttle"),
                        act_inact_ind = r.GetValue<string>("act_inact_ind"),
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
        public async Task<SSM010Object> SSM017BlurSrchAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM010Object();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@post_cd", $"{input.post_cd}");
                dbParamters.Add("@car_typ", $"{input.car_typ}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = "";
                //SSM017 Check if record exists in the wkg_pos_grp_trnsfr_post_fltr specified by car_typ and pos_grp_id
                query = @"SELECT post_cd,car_typ,pos_grp_id FROM wkg_pos_grp_trnsfr_post_fltr WHERE post_cd = @post_cd AND 
                           car_typ = @car_typ AND pos_grp_id = @pos_grp_id;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM010Object>(query, dbParamters, r =>
                {
                    return new SSM010Object
                    {
                        post_cd = r.GetValue<string>("post_cd"),
                        car_typ = r.GetValue<string>("car_typ"),
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
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
        public async Task<PageInfo<SSM010Object>> SSM017GetSelectDataAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new PageInfo<SSM010Object>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@post_cd", $"{input.post_cd}");
                dbParamters.Add("@car_typ", $"{input.car_typ}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = "";
                //SSM017 transfer config load selected data to edit
                query = @"SELECT post_cd,car_typ,pos_grp_id,dflt_arpt,dflt_htl,eshuttle,act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                           REPLACE(CONVERT(VARCHAR,trnsf.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),trnsf.mod_dttm,108) AS mod_dttm 
                           FROM wkg_pos_grp_trnsfr_post_fltr trnsf INNER JOIN rps_usr_mast usr ON 
                           usr.Usr_id = trnsf.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd where 
                           post_cd = @post_cd AND car_typ = @car_typ AND pos_grp_id = @pos_grp_id;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM010Object>(query, dbParamters, r =>
                {
                    return new SSM010Object
                    {

                        post_cd = r.GetValue<string>("post_cd"),
                        car_typ = r.GetValue<string>("car_typ"),
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        dflt_arpt = r.GetValue<string>("dflt_arpt"),
                        dflt_htl = r.GetValue<string>("dflt_htl"),
                        eshuttle = r.GetValue<string>("eshuttle"),
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
        public async Task<OperationStatus> SSM017SaveDeleteDataAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@post_cd", $"{input.post_cd}");
                dbParamters.Add("@car_typ", $"{input.car_typ}");
                dbParamters.Add("@dflt_arpt", $"{input.dflt_arpt}");
                dbParamters.Add("@dflt_htl", $"{input.dflt_htl}");
                dbParamters.Add("@eshuttle", $"{input.eshuttle}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@mod_by_usr_cd", $"{input.mod_by_usr_cd}");
                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {   //SSM017 transfer config Update
                    query = @"UPDATE wkg_pos_grp_trnsfr_post_fltr SET dflt_arpt = @dflt_arpt,dflt_htl = @dflt_htl,
                               eshuttle = @eshuttle,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,
                               mod_dttm = GETDATE() WHERE post_cd = @post_cd AND car_typ = @car_typ AND 
                               pos_grp_id = @pos_grp_id;";
                }
                if (input.Mode.ToUpper() == "SAVE")
                {   //SSM017 transfer config Insert
                    query = @"INSERT INTO wkg_pos_grp_trnsfr_post_fltr (post_cd, car_typ, pos_grp_id, dflt_arpt, dflt_htl, 
                               eshuttle, act_inact_ind, mod_by_usr_cd, mod_dttm)VALUES (@post_cd, @car_typ, @pos_grp_id, 
                               @dflt_arpt, @dflt_htl, @eshuttle, @act_inact_ind, @mod_by_usr_cd, GETDATE());";

                }
                if (input.Mode.ToUpper() == "DELETE")
                {    //SSM017 transfer config delete
                    query = "DELETE FROM wkg_pos_grp_trnsfr_post_fltr WHERE post_cd = @post_cd And car_typ=@car_typ And pos_grp_id = @pos_grp_id;";

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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM017SaveDeleteDataAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM017SaveDeleteDataAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM018-Banner Config

        public async Task<SSM018loadObject> SSM018GetOnloadAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM018loadObject();
            try
            {
                List<SSM018Object> BannerItems = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@img_nam", $"{input.img_nam}");
                dbParamters.Add("@img_dir", $"{input.img_dir}");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM018 Banner config onload
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY bnr.sort_ordr ) AS cnt, bnr.bnr_srl,
                                bnr.pos_grp_id,bnr.img_play_second, bnr.sort_ordr, bnr.act_inact_ind,img.img_nam,
                                COUNT(*) OVER () AS total_count FROM wkg_pos_grp_bnr_dtls bnr INNER JOIN wkg_img_dtls img ON img.img_srl = bnr.img_srl
                                WHERE bnr.pos_grp_id = @pos_grp_id AND bnr.act_inact_ind = @act_inact_ind) AS temp 
                                WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                SELECT bnr_img_dir FROM wkg_cntrl_param_mast;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    BannerItems = new List<SSM018Object>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalrecords = r.GetValue<int>("total_count");
                        SSM018Object temp = new SSM018Object();
                        temp.bnr_srl = r.GetValue<string>("bnr_srl");
                        temp.pos_grp_id = r.GetValue<string>("pos_grp_id");
                        temp.img_srl = r.GetValue<string>("img_srl");
                        temp.img_nam = r.GetValue<string>("img_nam");
                        temp.img_play_second = r.GetValue<string>("img_play_second");
                        temp.sort_ordr = r.GetValue<string>("sort_ordr");
                        temp.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                        BannerItems.Add(temp);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.img_dir = r.GetValue<string>("bnr_img_dir");

                    }
                }
                output.Items = BannerItems;
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
        public async Task<SSM018loadObject> SSM018GetSearchAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM018loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@img_nam", $"%{input.img_nam?.Trim()}%");
                dbParamters.Add("@act_inact_ind", $"{input.act_inact_ind}");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                int totalrecords = 0;
                //SSM018 Banner config onload
                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER ({(input.SortTyp ? "ORDER BY img.img_nam" : "ORDER BY img.img_nam DESC")}) AS cnt, bnr.bnr_srl,
                                bnr.pos_grp_id,bnr.img_play_second, bnr.sort_ordr, bnr.act_inact_ind,img.img_nam,img.img_srl,
                                COUNT(*) OVER () AS total_count FROM wkg_pos_grp_bnr_dtls bnr INNER JOIN wkg_img_dtls img ON img.img_srl = bnr.img_srl
                                WHERE bnr.pos_grp_id = @pos_grp_id AND img.img_nam LIKE @img_nam AND bnr.act_inact_ind = @act_inact_ind) AS temp 
                                WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM018Object>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM018Object
                    {
                        bnr_srl = r.GetValue<string>("bnr_srl"),
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        img_srl = r.GetValue<string>("img_srl"),
                        img_nam = r.GetValue<string>("img_nam"),
                        img_play_second = r.GetValue<string>("img_play_second"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
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

        public async Task<SSM018loadObject> SSM018BlurAsync(SessionInfo sessionInfo, SSM010Object input)
        {
            var output = new SSM018loadObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", $"{input.img_dir}");
                //SSM018 Checks if image name exists in the directory
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

        public async Task<SSM018Object> SSM018GetSelectDataAsync(SessionInfo sessionInfo, SSM018Object input)
        {
            var output = new SSM018Object();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@bnr_srl", $"{input.bnr_srl}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = "";
                //SSM018 Banner config load selected data to edit
                query = @"SELECT bnr.bnr_srl,bnr.pos_grp_id,bnr.img_play_second,bnr.sort_ordr,bnr.act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname 
                          AS mod_by_usr_cd,REPLACE(CONVERT(VARCHAR,bnr.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),bnr.mod_dttm,108) AS mod_dttm,
                          (SELECT img_dmn_path FROM wkg_cntrl_param_mast) + LOWER(img.img_dir) + '/' + img.img_nam AS 'img_url',
                          img.img_nam, img.img_srl, img.is_video, img.mnl_upld
                          FROM wkg_pos_grp_bnr_dtls bnr INNER JOIN wkg_img_dtls img ON bnr.img_srl = img.img_srl
                          INNER JOIN rps_usr_mast usr ON usr.Usr_id = bnr.mod_by_usr_cd 
                          INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd WHERE bnr.pos_grp_id = @pos_grp_id AND bnr.bnr_srl = @bnr_srl;";

                output = await this.DBUtils(true).GetEntityDataAsync<SSM018Object>(query, dbParamters, r =>
                {
                    return new SSM018Object
                    {
                        bnr_srl = r.GetValue<string>("bnr_srl"),
                        pos_grp_id = r.GetValue<string>("pos_grp_id"),
                        img_srl = r.GetValue<string>("img_srl"),
                        img_nam = r.GetValue<string>("img_nam"),
                        img_play_second = r.GetValue<string>("img_play_second"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        img_url = r.GetValue<string>("img_url"),
                        is_video = r.GetValue<bool>("is_video"),
                        mnl_upld = r.GetValue<bool>("mnl_upld"),
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
        public async Task<OperationStatus> SSM018SaveData(SessionInfo sessionInfo, SSM018Object input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@img_play_second", input.img_play_second);
                dbParamters.Add("@img_srl", input.img_srl);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@is_video", input.is_video);
                dbParamters.Add("@mnl_upld", input.mnl_upld);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                dbParamters.Add("@bnr_srl", input.bnr_srl);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                if (input.ImageChanged == "YES" && input.OldImg == "NO")
                {
                    if (!input.is_video || (input.is_video && !input.mnl_upld))
                    {
                        if (files != null)
                        {
                            var tourser = this.GetService<IFileManagerService>();
                            var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });

                        }
                    }
                }
                string query = "";
                if (input.Mode.ToUpper() == "UPDATE")
                {   //SSM018 Banner config Update
                    if (input.OldImg == "YES")
                    {
                        query = @"UPDATE wkg_pos_grp_bnr_dtls SET img_play_second=@img_play_second,sort_ordr=@sort_ordr,img_srl=@img_srl,
                                  act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,
                                  mod_dttm = GETDATE() WHERE pos_grp_id = @pos_grp_id AND bnr_srl = @bnr_srl;";
                    }
                    else
                    {
                        query = @"INSERT INTO wkg_img_dtls(img_nam,img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm,is_video,mnl_upld)
                                  VALUES(@img_nam,@img_dir,@act_inact_ind,@mod_by_usr_cd,GETDATE(),@is_video,@mnl_upld);

                                  UPDATE wkg_pos_grp_bnr_dtls SET img_play_second=@img_play_second,sort_ordr=@sort_ordr,
                                  img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),act_inact_ind = @act_inact_ind,
                                  mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE() WHERE pos_grp_id = @pos_grp_id
                                  AND bnr_srl = @bnr_srl;";
                    }
                }
                if (input.Mode.ToUpper() == "INSERT")
                {   //SSM018 Banner config Insert
                    if (input.OldImg == "YES")
                    {
                        query = @"INSERT INTO wkg_pos_grp_bnr_dtls(pos_grp_id,img_play_second,img_srl,sort_ordr,
                                  act_inact_ind,mod_by_usr_cd,mod_dttm)VALUES (@pos_grp_id, @img_play_second,
                                  @img_srl,@sort_ordr,@act_inact_ind,@mod_by_usr_cd, GETDATE());";
                    }
                    else
                    {
                        query = @"INSERT INTO wkg_img_dtls(img_nam,img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm,is_video,mnl_upld)
                                  VALUES(@img_nam,@img_dir,@act_inact_ind, @mod_by_usr_cd, GETDATE(), @is_video, @mnl_upld);

                                  INSERT INTO wkg_pos_grp_bnr_dtls(pos_grp_id,img_play_second,img_srl,sort_ordr,
                                  act_inact_ind,mod_by_usr_cd,mod_dttm)VALUES ( @pos_grp_id, @img_play_second,
                                  (SELECT MAX(img_srl)FROM wkg_img_dtls),@sort_ordr,@act_inact_ind,
                                  @mod_by_usr_cd, GETDATE());";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM018SaveData)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM018SaveData)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        #region Public Methods SSM019-Additional Config
        public async Task<SSM010loadObject> SSM019OnloadSSMAsync(SessionInfo sessionInfo, SSM011Object input)
        {
            var output = new SSM010loadObject();
            SSM019Object tbl1 = new SSM019Object();
            List<SSM010ApiEnableObject> tbl2 = null;
            List<SelectBox> tbl3 = null;
            List<SSM010LangObject> tbl4 = null;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                string query = "";

                //SSM019 Onload Retrieve record from wkg_pos_ssm_app_config
                query = @"SELECT ssm_id, ssn_tmout_scnd, auto_cls_tmout_scnd, onln_tmout_mscnd, onln_chck_intrvl_mscnd, pay_wt_mnts, pay_dvc_loc,
                          barcd_rtry,gmap_key, gmap_styl_id, theme_nam, ftp_url, ftp_uid, ftp_pwd,
                          emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd, 
                          REPLACE(CONVERT(VARCHAR,ssm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),ssm.mod_dttm,108)
                          AS mod_dttm FROM wkg_pos_ssm_app_config ssm INNER JOIN rps_usr_mast usr
                          ON usr.Usr_id = ssm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                          WHERE ssm_id = @ssm_id;";

                tbl1 = await this.DBUtils(true).GetEntityDataAsync<SSM019Object>(query, dbParamters, r =>
                {
                    return new SSM019Object
                    {
                        ssm_id = r.GetValue<string>("ssm_id"),
                        ssn_tmout_scnd = (int)r.GetValue<Int16>("ssn_tmout_scnd"),
                        auto_cls_tmout_scnd = (int)r.GetValue<Int16>("auto_cls_tmout_scnd"),
                        onln_tmout_mscnd = (int)r.GetValue<Int16>("onln_tmout_mscnd"),
                        onln_chck_intrvl_mscnd = (int)r.GetValue<Int16>("onln_chck_intrvl_mscnd"),
                        pay_wt_mnts = (int)r.GetValue<Byte>("pay_wt_mnts"),
                        barcd_rtry = (int)r.GetValue<Byte>("barcd_rtry"),
                        pay_dvc_loc = r.GetValue<string>("pay_dvc_loc"),
                        gmap_key = r.GetValue<string>("gmap_key"),
                        gmap_styl_id = r.GetValue<string>("gmap_styl_id"),
                        theme_nam = r.GetValue<string>("theme_nam"),
                        ftp_url = r.GetValue<string>("ftp_url"),
                        ftp_uid = r.GetValue<string>("ftp_uid"),
                        ftp_pwd = r.GetValue<string>("ftp_pwd"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });

                if (tbl1 != null && tbl1?.ssm_id != null)
                {
                    query = "";

                    //SSM019 Onload retrives record for Select Box
                    query = @"SELECT 'FLT' supp_map_id,'Flight Api' supp_nam,act_inact_ind from wkg_supp_config WHERE 
                              supp_map_id='FLT' UNION SELECT cng.supp_map_id,supp.supp_nam,cng.act_inact_ind from 
                              wkg_supp_config cng INNER join rps_supp_mast supp ON supp.supp_map_id=cng.supp_map_id;

                              SELECT Cntry_cd,Cntry_desc FROM rps_cntry_mast WHERE Cntry_cd in('gb','de','fr','US','ES','AU') and Act_inact_ind='A'
                              ORDER BY ISNULL(Sort_ordr,9999);

                              SELECT lang_cd,lang_nam FROM wkg_pos_accptd_lang;

                              SELECT apis_enbld,ISNULL(pos_cntry_cd,'GB') AS pos_cntry_cd,lang_cds FROM 
                              wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id;";

                    DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                    if (DS != null && DS.Tables.Count > 0)
                    {
                        tbl2 = new List<SSM010ApiEnableObject>();
                        foreach (DataRow r in DS.Tables[0].Rows)
                        {
                            SSM010ApiEnableObject obj2 = new SSM010ApiEnableObject();
                            obj2.supp_nam = r.GetValue<string>("supp_nam");
                            obj2.supp_map_id = r.GetValue<string>("supp_map_id");
                            obj2.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                            tbl2.Add(obj2);
                        }
                        tbl3 = new List<SelectBox>();
                        foreach (DataRow r in DS.Tables[1].Rows)
                        {
                            SelectBox obj3 = new SelectBox();
                            obj3.ID = r.GetValue<string>("Cntry_cd");
                            obj3.Text = r.GetValue<string>("Cntry_desc");

                            tbl3.Add(obj3);
                        }
                        tbl4 = new List<SSM010LangObject>();
                        foreach (DataRow r in DS.Tables[2].Rows)
                        {
                            SSM010LangObject obj4 = new SSM010LangObject();
                            obj4.lang_cd_mast = r.GetValue<string>("lang_cd");
                            obj4.lang_nam_mast = r.GetValue<string>("lang_nam");
                            tbl4.Add(obj4);
                        }
                        foreach (DataRow r in DS.Tables[3].Rows)
                        {
                            output.apis_enbld = r.GetValue<string>("apis_enbld");
                            output.pos_cntry_cd = r.GetValue<string>("pos_cntry_cd");
                            output.lang_cd = r.GetValue<string>("lang_cds");
                        }
                        tbl1.recordExists = true;
                        output.SSMAppConfig = tbl1;
                        output.ApiEnableItem = tbl2;
                        output.GmapCountryCodeList = tbl3;
                        output.LangItems = tbl4;
                        output.ThemeList = StaticData.SSM015SC.ThemeList;
                        output.PaymentDeviceLocation = StaticData.SSM015SC.PaymentDeviceLocation;
                    }
                }
                else
                {
                    query = "";
                    //SSM019 Onload retrives default data for new SSM
                    query = @"SELECT gmap_key, gmap_stylid, ftp_supp_img_url, ftp_uid, ftp_pwd from wkg_cntrl_param_mast;

                              SELECT 'FLT' supp_map_id,'Flight Api' supp_nam,act_inact_ind from wkg_supp_config WHERE 
                              supp_map_id='FLT' UNION SELECT cng.supp_map_id,supp.supp_nam,cng.act_inact_ind from 
                              wkg_supp_config cng INNER join rps_supp_mast supp ON supp.supp_map_id=cng.supp_map_id;

                              SELECT apis_enbld,ISNULL(pos_cntry_cd,'GB') AS pos_cntry_cd,lang_cds FROM wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id;

                              SELECT Cntry_cd,Cntry_desc FROM rps_cntry_mast WHERE Cntry_cd in('gb','de','fr','US','ES','AU') and Act_inact_ind='A'
                              ORDER BY ISNULL(Sort_ordr,9999);

                              SELECT lang_cd,lang_nam FROM wkg_pos_accptd_lang;";

                    SSM019Object obj1 = new SSM019Object();
                    DataSet DS1 = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                    if (DS1 != null && DS1.Tables.Count > 0)
                    {
                        foreach (DataRow r in DS1.Tables[0].Rows)
                        {
                            obj1.gmap_key = r.GetValue<string>("gmap_key");
                            obj1.gmap_styl_id = r.GetValue<string>("gmap_stylid");
                            obj1.ftp_url = r.GetValue<string>("ftp_supp_img_url");
                            obj1.ftp_uid = r.GetValue<string>("ftp_uid");
                            obj1.ftp_pwd = r.GetValue<string>("ftp_pwd");
                        }
                        tbl2 = new List<SSM010ApiEnableObject>();
                        foreach (DataRow r in DS1.Tables[1].Rows)
                        {
                            SSM010ApiEnableObject obj2 = new SSM010ApiEnableObject();
                            obj2.supp_nam = r.GetValue<string>("supp_nam");
                            obj2.supp_map_id = r.GetValue<string>("supp_map_id");
                            obj2.act_inact_ind = r.GetValue<bool>("act_inact_ind");

                            tbl2.Add(obj2);
                        }
                        foreach (DataRow r in DS1.Tables[2].Rows)
                        {
                            output.apis_enbld = r.GetValue<string>("apis_enbld");
                            output.pos_cntry_cd = r.GetValue<string>("pos_cntry_cd");
                            output.lang_cd = r.GetValue<string>("lang_cds");
                        }
                        tbl3 = new List<SelectBox>();
                        foreach (DataRow r in DS1.Tables[3].Rows)
                        {
                            SelectBox obj3 = new SelectBox();
                            obj3.ID = r.GetValue<string>("Cntry_cd");
                            obj3.Text = r.GetValue<string>("Cntry_desc");

                            tbl3.Add(obj3);
                        }
                        tbl4 = new List<SSM010LangObject>();
                        foreach (DataRow r in DS1.Tables[4].Rows)
                        {
                            SSM010LangObject obj4 = new SSM010LangObject();
                            obj4.lang_cd_mast = r.GetValue<string>("lang_cd");
                            obj4.lang_nam_mast = r.GetValue<string>("lang_nam");
                            tbl4.Add(obj4);
                        }
                        obj1.recordExists = false;
                        obj1.ssn_tmout_scnd = StaticData.SSM015SC.SessionTimeoutSec;
                        obj1.auto_cls_tmout_scnd = StaticData.SSM015SC.AutoCloseTimeoutSec;
                        obj1.onln_tmout_mscnd = StaticData.SSM015SC.OnlineTimeoutMilliSec;
                        obj1.onln_chck_intrvl_mscnd = StaticData.SSM015SC.OnlineCheckMilliSec;
                        obj1.pay_wt_mnts = StaticData.SSM015SC.PaymentWaitMin;
                        output.SSMAppConfig = obj1;
                        output.ApiEnableItem = tbl2;
                        output.GmapCountryCodeList = tbl3;
                        output.LangItems = tbl4;
                        output.ThemeList = StaticData.SSM015SC.ThemeList;
                        output.PaymentDeviceLocation = StaticData.SSM015SC.PaymentDeviceLocation;
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }
        public async Task<OperationStatus> SSM019SSMSaveAsync(SessionInfo sessionInfo, SSM019Object input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", input.ssm_id);
                dbParamters.Add("@ssn_tmout_scnd", input.ssn_tmout_scnd);
                dbParamters.Add("@auto_cls_tmout_scnd", input.auto_cls_tmout_scnd);
                dbParamters.Add("@onln_tmout_mscnd", input.onln_tmout_mscnd);
                dbParamters.Add("@onln_chck_intrvl_mscnd", input.onln_chck_intrvl_mscnd);
                dbParamters.Add("@pay_wt_mnts", input.pay_wt_mnts);
                dbParamters.Add("@barcd_rtry", input.barcd_rtry);
                dbParamters.Add("@pay_dvc_loc", input.pay_dvc_loc);
                dbParamters.Add("@gmap_key", input.gmap_key);
                dbParamters.Add("@gmap_styl_id", input.gmap_styl_id);
                dbParamters.Add("@theme_nam", input.theme_nam);
                dbParamters.Add("@ftp_url", input.ftp_url);
                dbParamters.Add("@ftp_uid", input.ftp_uid);
                dbParamters.Add("@ftp_pwd", input.ftp_pwd);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                string query = "";
                if (input.recordExists)
                {   //SSM019 Update
                    query = @"UPDATE wkg_pos_ssm_app_config SET ssn_tmout_scnd=@ssn_tmout_scnd,auto_cls_tmout_scnd=@auto_cls_tmout_scnd,
                              onln_tmout_mscnd=@onln_tmout_mscnd,onln_chck_intrvl_mscnd=@onln_chck_intrvl_mscnd,pay_wt_mnts=@pay_wt_mnts,
                              pay_dvc_loc=@pay_dvc_loc,gmap_key=@gmap_key,gmap_styl_id=@gmap_styl_id,theme_nam=@theme_nam,ftp_url=@ftp_url,
                              ftp_uid=@ftp_uid,ftp_pwd=@ftp_pwd,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(),barcd_rtry=@barcd_rtry 
                              WHERE ssm_id = @ssm_id;";
                }
                else
                {   //SSM019 Insert
                    query = @"INSERT INTO wkg_pos_ssm_app_config(ssm_id,ssn_tmout_scnd,auto_cls_tmout_scnd,onln_tmout_mscnd,onln_chck_intrvl_mscnd,
                              pay_wt_mnts,pay_dvc_loc,gmap_key,gmap_styl_id,theme_nam,ftp_url,ftp_uid,ftp_pwd,mod_by_usr_cd,mod_dttm,barcd_rtry)VALUES(@ssm_id,
                              @ssn_tmout_scnd,@auto_cls_tmout_scnd,@onln_tmout_mscnd,@onln_chck_intrvl_mscnd,@pay_wt_mnts,@pay_dvc_loc,@gmap_key,
                              @gmap_styl_id,@theme_nam,@ftp_url,@ftp_uid,@ftp_pwd,@mod_by_usr_cd,getdate(),@barcd_rtry);";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM019SSMSaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM019SSMSaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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



        #region Public Methods SSM140-Distribusion Default For SSM

        public async Task<SSM140loadObject> SSM140OnloadSrchAsync(SessionInfo sessionInfo, SSM140DstrbnObject input)
        {
            var output = new SSM140loadObject();
            try
            {
                List<SSM140DstrbnObject> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", $"{input.pos_grp_id}");
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@stn_nam", $"%{input.stn_nam.Trim()}%");
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                dbParamters.Add("@supp_map_id", StaticData.SupplierMapId.Distribusion);
                dbParamters.Add("@Station", StaticData.Distibusion.DstrbnLocType["Station"]);
                dbParamters.Add("@Area", StaticData.Distibusion.DstrbnLocType["Area"]);
                dbParamters.Add("@City", StaticData.Distibusion.DstrbnLocType["City"]);
                int totalrecords = 0;

                string query = @$"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY 
                                CASE ssm.loc_typ
                                WHEN @City THEN city.en_GB
                                WHEN @Area THEN area.en_GB
                                WHEN @Station THEN stndtls.stn_nam
                                END {(input.sortType ? "ASC" : "DESC")}
                                ) AS cnt,ssm.loc_srl, ssm.ssm_id, img.img_nam, ssm.tm_to_stop_mnts,
                                ssm.ssm_dflt_stn,ssm.stn_cd, stndtls.stn_typ,
                                CASE ssm.loc_typ
                                WHEN @City THEN city.en_GB
                                WHEN @Area THEN area.en_GB
                                WHEN @Station THEN stndtls.stn_nam
                                END AS stn_nam,ssm.sort_ordr, ssm.loc_typ,
                                COUNT(*) OVER () AS total_count
                                FROM wkg_pos_ssm_dstrbsn_loc_dtls ssm
                                LEFT OUTER JOIN wkg_dstrbsn_loc_stn_dtls stndtls ON stndtls.stn_cd = ssm.stn_cd AND stndtls.lang_cd = @lang_cd
                                LEFT OUTER JOIN wkg_dstrbsn_loc_cty_dtls city ON city.cty_cd = ssm.stn_cd
                                LEFT OUTER JOIN wkg_dstrbsn_loc_area_dtls area ON area.area_cd = ssm.stn_cd
                                LEFT OUTER JOIN wkg_img_dtls img ON img.img_srl = ssm.stn_img_srl
                                WHERE ssm_id = @ssm_id AND (stndtls.stn_nam LIKE @stn_nam 
                                OR city.en_GB LIKE @stn_nam OR area.en_GB LIKE @stn_nam)) AS temp
                                WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                SELECT supp_map_id,supp_ftp_img_dir FROM wkg_supp_config WHERE supp_map_id =  @supp_map_id;

                                SELECT dstrbsn_cnctd_stn FROM wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM140DstrbnObject>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        string text = r.GetValue<string>("stn_nam");
                        totalrecords = r.GetValue<int>("total_count");
                        SSM140DstrbnObject obj1 = new SSM140DstrbnObject();
                        obj1.loc_srl = r.GetValue<int>("loc_srl");
                        obj1.ssm_id = r.GetValue<string>("ssm_id");
                        obj1.stn_cd = r.GetValue<string>("stn_cd");
                        obj1.loc_typ = r.GetValue<string>("loc_typ");
                        if (obj1.loc_typ == StaticData.Distibusion.DstrbnLocType["City"])
                        {
                            obj1.stn_nam = $"{text} (City)";
                        }
                        else if (obj1.loc_typ == StaticData.Distibusion.DstrbnLocType["Area"])
                        {
                            obj1.stn_nam = $"{text} (Area)";
                        }
                        else
                        {
                            obj1.stn_nam = $"{text} (Station)";
                        }
                        obj1.stn_typ = r.GetValue<string>("stn_typ");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        //obj1.city = r.GetValue<string>("city");
                        //obj1.area = r.GetValue<string>("area");
                        obj1.tm_to_stop_mnts = r.GetValue<string>("tm_to_stop_mnts");
                        obj1.img_nam = r.GetValue<string>("img_nam");
                        obj1.ssm_dflt_stn = r.GetValue<bool>("ssm_dflt_stn"); ;
                        tbl1.Add(obj1);

                    }
                    foreach (DataRow DR5 in DS.Tables[1].Rows)
                    {
                        output.ImageDirectory = DR5.GetValue<string>("supp_ftp_img_dir");
                        output.Supp_map_Id = DR5.GetValue<string>("supp_map_id");
                    }
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        output.connectedStn = r.GetValue<bool>("dstrbsn_cnctd_stn");
                    }
                }
                output.Items = tbl1;
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
                output.DstrbnLocType = StaticData.Distibusion.DstrbnLocType;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<SSM011BlurObject> SSM140StationBlurAsync(SessionInfo sessionInfo, SSM140DstrbnObject input)
        {
            var output = new SSM011BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@ssm_id", $"{input.ssm_id}");
                dbParamters.Add("@stn_cd", $"{input.stn_cd}");
                string query = @"SELECT loc_srl,loc_typ,stn_cd FROM wkg_pos_ssm_dstrbsn_loc_dtls WHERE ssm_id=@ssm_id AND stn_cd= @stn_cd;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        output.ImageName = r.GetValue<string>("loc_srl");
                        output.loc_typ = r.GetValue<string>("loc_typ");
                    }
                }
                if (string.IsNullOrEmpty(output.ImageName))
                {
                    output.Isavailable = false;
                }
                else
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
        public async Task<SSM011BlurObject> SSM140ImageBlurSrch(SessionInfo sessionInfo, SSM140DstrbnObject input)
        {
            var output = new SSM011BlurObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@img_dir", $"{input.img_dir}");
                //SSM011 Checks if image name exists in the directory
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

        public async Task<SSM140DstrbnObject> SSM140GetSelectAsync(SessionInfo sessionInfo, SSM140DstrbnObject input)
        {
            var output = new SSM140DstrbnObject();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@loc_srl", $"{input.loc_srl}");
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                //SSM0140 Onload
                StringBuilder query = new StringBuilder();
                if (input.loc_typ == StaticData.Distibusion.DstrbnLocType["Station"])
                {
                    query.Append(@"SELECT ssm.loc_srl,ssm.ssm_id,img.img_nam,ssm.stn_img_srl,ssm.tm_to_stop_mnts,ssm.ssm_dflt_stn,ssm.stn_cd,
                                stn_typ as stationtype,stn_nam AS name,stn_desc AS stnDesc,stn_addr as address,stn_post as post,stn_lat AS latitude,
                                null as iata,stn_long AS longitude,ctydtls.en_GB AS city,areadtls.en_GB AS area,ctydtls.cty_cntry AS country,loc_typ,ssm.sort_ordr,
                                emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                REPLACE(CONVERT(VARCHAR,ssm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),ssm.mod_dttm,108)
                                AS mod_dttm FROM wkg_pos_ssm_dstrbsn_loc_dtls ssm INNER JOIN rps_usr_mast usr
                                ON usr.Usr_id = ssm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                LEFT OUTER JOIN wkg_dstrbsn_loc_stn_dtls stndtls ON  stndtls.stn_cd = ssm.stn_cd AND stndtls.lang_cd=@lang_cd
                                LEFT OUTER JOIN wkg_dstrbsn_loc_cty_dtls ctydtls ON ctydtls.cty_cd = stndtls.cty_cd 
                                LEFT OUTER JOIN wkg_dstrbsn_loc_area_dtls areadtls ON areadtls.area_cd = stndtls.area_cd
                                LEFT OUTER JOIN wkg_img_dtls img ON img.img_srl = ssm.stn_img_srl WHERE loc_srl = @loc_srl;");
                }
                else if (input.loc_typ == StaticData.Distibusion.DstrbnLocType["City"])
                {
                    query.Append(@"SELECT ssm.loc_srl,ssm.ssm_id,img.img_nam,ssm.stn_img_srl,ssm.tm_to_stop_mnts,ssm.ssm_dflt_stn,ssm.stn_cd,
                                    en_GB AS name, null as stationtype, null as address, NULL AS stnDesc, null as post, cty_lat AS latitude, 
                                    null as iata,cty_long AS longitude, ctydtls.cty_cntry AS country, en_GB AS city, NULL AS area,loc_typ,ssm.sort_ordr,
                                    emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                    REPLACE(CONVERT(VARCHAR,ssm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),ssm.mod_dttm,108)
                                    AS mod_dttm FROM wkg_pos_ssm_dstrbsn_loc_dtls ssm INNER JOIN rps_usr_mast usr
                                    ON usr.Usr_id = ssm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                    LEFT OUTER JOIN wkg_dstrbsn_loc_cty_dtls ctydtls ON ctydtls.cty_cd = ssm.stn_cd 
                                    LEFT OUTER JOIN wkg_img_dtls img ON img.img_srl = ssm.stn_img_srl WHERE loc_srl = @loc_srl;");
                }
                else if (input.loc_typ == StaticData.Distibusion.DstrbnLocType["Area"])
                {
                    query.Append(@"SELECT ssm.loc_srl,ssm.ssm_id,img.img_nam,ssm.stn_img_srl,ssm.tm_to_stop_mnts,ssm.ssm_dflt_stn,ssm.stn_cd,
                                   area.en_GB AS name, null as stationtype, null as address, NULL AS stnDesc, null as post, area_lat AS latitude,
                                   area_iata as iata, area_long AS longitude, null AS country, cty.en_GB AS city, NULL AS area,loc_typ,ssm.sort_ordr,
                                   emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                   REPLACE(CONVERT(VARCHAR,ssm.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),ssm.mod_dttm,108)
                                   AS mod_dttm FROM wkg_pos_ssm_dstrbsn_loc_dtls ssm INNER JOIN rps_usr_mast usr
                                   ON usr.Usr_id = ssm.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd 
                                   LEFT OUTER JOIN wkg_dstrbsn_loc_area_dtls area ON area.area_cd = ssm.stn_cd 
                                   LEFT OUTER JOIN wkg_dstrbsn_loc_cty_dtls cty ON cty.cty_cd = area.area_cty
                                   LEFT OUTER JOIN wkg_img_dtls img ON img.img_srl = ssm.stn_img_srl WHERE loc_srl = @loc_srl;");
                }

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query.ToString(), dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {


                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM140DstrbnObject obj1 = new SSM140DstrbnObject();
                        obj1.loc_srl = r.GetValue<int>("loc_srl");
                        obj1.ssm_id = r.GetValue<string>("ssm_id");
                        obj1.stn_cd = r.GetValue<string>("stn_cd");
                        obj1.tm_to_stop_mnts = r.GetValue<string>("tm_to_stop_mnts");
                        obj1.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj1.img_nam = r.GetValue<string>("img_nam");
                        obj1.stn_img_srl = r.GetValue<string>("stn_img_srl");
                        obj1.ssm_dflt_stn = r.GetValue<bool>("ssm_dflt_stn");
                        obj1.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj1.mod_dttm = r.GetValue<string>("mod_dttm");
                        if (!string.IsNullOrEmpty(obj1.stn_cd))
                        {
                            var name = r.GetValue<string>("name");
                            var city = r.GetValue<string>("city");
                            var country = r.GetValue<string>("country");

                            TypeAndSrchObject obj2 = new TypeAndSrchObject();
                            obj2.ID = r.GetValue<string>("stn_cd");
                            obj2.type = r.GetValue<string>("loc_typ");
                            if (obj2.type == StaticData.Distibusion.DstrbnLocType["City"])
                            {
                                obj2.Text = $"{name}, {country} (City)";
                            }
                            else if (obj2.type == StaticData.Distibusion.DstrbnLocType["Area"])
                            {
                                obj2.Text = $"{name} - {city}, {country} (Area)";
                            }
                            else
                            {
                                obj2.Text = $"{name} - {city}, {country} (Station)";
                            }

                            obj2.name = name;
                            obj2.stationtype = r.GetValue<string>("stationtype");
                            obj2.stnDesc = r.GetValue<string>("stnDesc");
                            obj2.address = r.GetValue<string>("address");
                            obj2.post = r.GetValue<string>("post");
                            obj2.latitude = r.GetValue<string>("latitude");
                            obj2.longitude = r.GetValue<string>("longitude");
                            obj2.city = city;
                            obj2.area = r.GetValue<string>("area");
                            obj2.iata = r.GetValue<string>("iata");
                            obj1.Dstrbsn_Dtls = obj2;
                        }
                        else
                        {
                            obj1.Dstrbsn_Dtls = null;
                        }
                        output = obj1;

                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;
        }

        public async Task<OperationStatus> SSM140DistrbtnSaveAsync(SessionInfo sessionInfo, SSM140DstrbnObject input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@loc_srl", input.loc_srl);
                dbParamters.Add("@ssm_id", input.ssm_id);
                dbParamters.Add("@ssm_dflt_stn", input.ssm_dflt_stn);
                dbParamters.Add("@tm_to_stop_mnts", input.tm_to_stop_mnts);
                dbParamters.Add("@stn_cd", input.stn_cd);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@loc_typ", input.loc_typ);
                dbParamters.Add("@stn_img_srl", input.stn_img_srl);
                dbParamters.Add("@img_nam", input.img_nam);
                dbParamters.Add("@img_dir", input.img_dir);
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);

                if (input.ImageChanged == "YES" && input.OldImg == "NO" && input.img_nam != null)
                {
                    if (files != null)
                    {
                        var tourser = this.GetService<IFileManagerService>();
                        _ = await tourser.SaveFileAsync(files[0], new List<string> { input.img_dir });
                    }
                }

                StringBuilder query = new StringBuilder();
                if (input.ssm_dflt_stn)
                {
                    query.Append("UPDATE wkg_pos_ssm_dstrbsn_loc_dtls SET ssm_dflt_stn=0 WHERE ssm_id = @ssm_id;");
                }
                if (input.Mode == "UPDATE")
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {
                            query.Append(@"UPDATE wkg_pos_ssm_dstrbsn_loc_dtls SET stn_cd=@stn_cd,ssm_dflt_stn=@ssm_dflt_stn,tm_to_stop_mnts=@tm_to_stop_mnts,
                                      stn_img_srl=@stn_img_srl,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(),sort_ordr=@sort_ordr,loc_typ=@loc_typ WHERE loc_srl=@loc_srl;");
                        }
                        else
                        {
                            if (input.img_nam == null)
                            {
                                query.Append(@"UPDATE wkg_pos_ssm_dstrbsn_loc_dtls SET stn_cd=@stn_cd,ssm_dflt_stn=@ssm_dflt_stn,tm_to_stop_mnts=@tm_to_stop_mnts,
                                          stn_img_srl=null,mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(),sort_ordr=@sort_ordr,loc_typ=@loc_typ WHERE loc_srl=@loc_srl;");
                            }
                            else
                            {
                                query.Append(@"INSERT INTO wkg_img_dtls (img_nam,img_dir,supp_map_id,act_inact_ind,
                                mod_by_usr_cd,mod_dttm)VALUES (@img_nam,@img_dir,@supp_map_id,1 ,
                                @mod_by_usr_cd,getdate());

                                UPDATE wkg_pos_ssm_dstrbsn_loc_dtls SET stn_cd=@stn_cd,ssm_dflt_stn=@ssm_dflt_stn,tm_to_stop_mnts=@tm_to_stop_mnts,
                                stn_img_srl=(SELECT MAX(img_srl) FROM wkg_img_dtls),mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(),
                                sort_ordr=@sort_ordr,loc_typ=@loc_typ WHERE loc_srl=@loc_srl;");
                            }
                        }
                    }
                    else
                    {
                        query.Append(@"UPDATE wkg_pos_ssm_dstrbsn_loc_dtls SET stn_cd=@stn_cd,ssm_dflt_stn=@ssm_dflt_stn,tm_to_stop_mnts=@tm_to_stop_mnts,
                                   mod_by_usr_cd=@mod_by_usr_cd,mod_dttm = getdate(),sort_ordr=@sort_ordr,loc_typ=@loc_typ WHERE loc_srl=@loc_srl;");
                    }
                }
                else
                {
                    if (input.ImageChanged == "YES")
                    {
                        if (input.OldImg == "YES")
                        {
                            query.Append(@"INSERT INTO wkg_pos_ssm_dstrbsn_loc_dtls(ssm_id,ssm_dflt_stn,stn_cd,tm_to_stop_mnts,stn_img_srl,mod_by_usr_cd,mod_dttm,sort_ordr,loc_typ)
                              VALUES(@ssm_id,@ssm_dflt_stn,@stn_cd,@tm_to_stop_mnts,@stn_img_srl,@mod_by_usr_cd,getdate(),@sort_ordr,@loc_typ);");
                        }
                        else
                        {
                            query.Append(@"INSERT INTO wkg_img_dtls (img_nam,img_dir,supp_map_id,act_inact_ind,mod_by_usr_cd,mod_dttm) 
                             VALUES (@img_nam,@img_dir,@supp_map_id,1 ,@mod_by_usr_cd,getdate());
                                
                             INSERT INTO wkg_pos_ssm_dstrbsn_loc_dtls(ssm_id,ssm_dflt_stn,stn_cd,tm_to_stop_mnts,stn_img_srl,mod_by_usr_cd,mod_dttm,sort_ordr,loc_typ)
                             VALUES(@ssm_id,@ssm_dflt_stn,@stn_cd,@tm_to_stop_mnts,(SELECT MAX(img_srl) FROM wkg_img_dtls),@mod_by_usr_cd,getdate(),@sort_ordr,@loc_typ);");
                        }
                    }
                    else
                    {
                        query.Append(@"INSERT INTO wkg_pos_ssm_dstrbsn_loc_dtls(ssm_id,ssm_dflt_stn,stn_cd,tm_to_stop_mnts,stn_img_srl,mod_by_usr_cd,mod_dttm,sort_ordr,loc_typ)
                              VALUES(@ssm_id,@ssm_dflt_stn,@stn_cd,@tm_to_stop_mnts,null,@mod_by_usr_cd,getdate(),@sort_ordr,@loc_typ);");
                    }
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SSM019SSMSaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SSM019SSMSaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

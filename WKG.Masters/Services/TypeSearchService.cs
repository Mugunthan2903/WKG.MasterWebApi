using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using static System.Net.Mime.MediaTypeNames;

namespace WKG.Masters.Services
{
    internal class TypeSearchService : WKLServiceManger, ITypeSearchService
    {
        #region Constructor
        public TypeSearchService(IServiceProvider serviceProvider, ILogger<TypeSearchService> logger)
            : base(serviceProvider, logger)
        {
        }
        #endregion
        #region Public Methods RPSCityTypeAndSearch

        public async Task<List<SSM101WKGCityList>> RPSCityTypeAndSearch(SessionInfo sessionInfo, SSM101WKGCityList input)
        {
            var output = new List<SSM101WKGCityList>();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@City_desc", $"%{input.Text}%");
                string query = @"select City_cd,City_desc,cntry.Cntry_desc FROM rps_city_mast cty
                                 INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd=cty.Cntry_cd
                                 WHERE cty.Act_inact_ind='A' AND cty.City_desc LIKE @City_desc  ORDER BY ISNULL(cty.Sort_ordr,9999)";

                output = await this.DBUtils(true).GetEntityDataListAsync<SSM101WKGCityList>(query, dbParamters, r =>
                {
                    return new SSM101WKGCityList
                    {
                        ID = r.GetValue<string>("City_cd"),
                        Text = r.GetValue<string>("City_desc") + " - " + r.GetValue<string>("Cntry_desc"),
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

        #region Public Methods DistribusionStationTypeAndSrch

        public async Task<List<TypeAndSrchObject>> DistribusionStationTypeAndSrch(SessionInfo sessionInfo, TypeAndSrchObject input)
        {
            var output = new List<TypeAndSrchObject>();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@name", $"%{input.Text.Trim()}%");
                dbParamters.Add("@pos_grp_id", input.GrpID);
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                dbParamters.Add("@Station", StaticData.Distibusion.DstrbnLocType["Station"]);
                dbParamters.Add("@Area", StaticData.Distibusion.DstrbnLocType["Area"]);
                dbParamters.Add("@City", StaticData.Distibusion.DstrbnLocType["City"]);
                StringBuilder query = new StringBuilder();
                query.Append(@"WITH MatchedItems AS 
                                    (
                                SELECT stn_cd AS id, stn_nam AS name, stn_typ as stationtype, stn_addr as address,stn_desc AS stnDesc,
                                stn_post as post, stn_lat AS latitude, stn_long AS longitude, cty.cty_cntry AS country, 
                                cty.en_GB AS city, ardtls.en_GB AS area,@Station AS loc_typ,null AS iata
                                FROM wkg_dstrbsn_loc_stn_dtls stn
                                INNER JOIN wkg_dstrbsn_loc_cty_dtls cty ON stn.cty_cd = cty.cty_cd 
                                AND EXISTS (SELECT custpricetype FROM dbo.rms_fn_commasplit(
                                ISNULL((SELECT dstrbsn_cntry_cds FROM wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id),
                                (SELECT STRING_AGG(Cntry_cd, ',') FROM rps_cntry_mast WHERE ssm_actv = 1)), ',') fn 
                                WHERE cty.cty_cntry = fn.custpricetype )
                                LEFT OUTER JOIN wkg_dstrbsn_loc_area_dtls ardtls ON ardtls.area_cd = stn.area_cd
                                WHERE stn.stn_nam LIKE @name AND stn.lang_cd =@lang_cd AND stn.act_inact_ind = 1 AND stn.stn_aval = 1

                                UNION
                                SELECT area_cd AS id, area.en_GB AS name, null as stationtype, null as address,null AS stnDesc,
                                null as post, area_lat AS latitude, area_long AS longitude, cty.cty_cntry AS country, 
                                cty.en_GB AS city, area.en_GB AS area,@Area AS loc_typ,area_iata AS iata
                                FROM wkg_dstrbsn_loc_area_dtls area
                                INNER JOIN wkg_dstrbsn_loc_cty_dtls cty ON area.area_cty = cty.cty_cd 
                                AND EXISTS (SELECT custpricetype FROM dbo.rms_fn_commasplit(
                                ISNULL((SELECT dstrbsn_cntry_cds FROM wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id),
                                (SELECT STRING_AGG(Cntry_cd, ',') FROM rps_cntry_mast WHERE ssm_actv = 1)), ',') fn 
                                WHERE cty.cty_cntry = fn.custpricetype )
                                WHERE area.en_GB LIKE @name AND area.act_inact_ind = 1 AND area.area_aval = 1
              
                                UNION  
                                SELECT cty_cd AS id, en_GB AS name, null as stationtype, null as address, NULL AS stnDesc,
                                null as post,cty_lat AS latitude,cty_long AS longitude, cty.cty_cntry AS country, en_GB AS city,
                                NULL AS area,@City AS loc_typ,null AS iata
                                FROM wkg_dstrbsn_loc_cty_dtls cty WHERE cty.act_inact_ind = 1 AND cty.cty_aval = 1 AND EXISTS (
                                SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL((SELECT dstrbsn_cntry_cds FROM wkg_pos_grp_mast WHERE pos_grp_id = @pos_grp_id),
                                (SELECT STRING_AGG(Cntry_cd, ',') FROM rps_cntry_mast WHERE ssm_actv = 1)), ',') fn 
                                WHERE cty.cty_cntry = fn.custpricetype ) AND en_GB LIKE @name
                                ) 
                                SELECT * FROM MatchedItems ORDER BY 
                                CASE loc_typ
                                WHEN @City then 1
                                WHEN @Area then 2
                                WHEN @Station then 3
                                ELSE 4
                                END,city,name;");

                output = await this.DBUtils(true).GetEntityDataListAsync<TypeAndSrchObject>(query.ToString(), dbParamters, r =>
                {
                    var id = r.GetValue<string>("id");
                    var locType = r.GetValue<string>("loc_typ");
                    var name = r.GetValue<string>("name");
                    var city = r.GetValue<string>("city");
                    var country = r.GetValue<string>("country");

                    string text;
                    if (locType == StaticData.Distibusion.DstrbnLocType["City"])
                    {
                        text = $"{name}, {country} (City)";
                    }
                    else if (locType == StaticData.Distibusion.DstrbnLocType["Station"])
                    {
                        text = $"{name} - {city}, {country} (Station)";
                    }
                    else
                    {
                        text = $"{name} - {city}, {country} (Area)";
                    }

                    return new TypeAndSrchObject
                    {
                        ID = id,
                        type = locType,
                        Text = text,
                        name = name,
                        stationtype = r.GetValue<string>("stationtype"),
                        stnDesc = r.GetValue<string>("stnDesc"),
                        address = r.GetValue<string>("address"),
                        post = r.GetValue<string>("post"),
                        latitude = r.GetValue<string>("latitude"),
                        longitude = r.GetValue<string>("longitude"),
                        city = city,
                        area = r.GetValue<string>("area"),
                        iata = r.GetValue<string>("iata")
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

        #region Public Methods CombinationStationTypeAndSrch
        public async Task<List<CombSrchObject>> CombinationStationTypeAndSrch(SessionInfo sessionInfo, CombSrchObject input)
        {
            var output = new List<CombSrchObject>();
            try
            {
                var dbParamters = new DBParameters();

                dbParamters.Add("@name", $"%{input.Text.Trim()}%");
           
                StringBuilder query = new StringBuilder();
                query.Append(@"
                        SELECT  stn.stn_cd, stn.stn_nam + ' - ' + cty.en_GB + ' ' + cty.cty_cntry AS StationDisplayText 
                        FROM wkg_dstrbsn_loc_stn_dtls stn   
                        INNER JOIN wkg_dstrbsn_loc_cty_dtls cty ON cty.cty_cd = stn.cty_cd 
                        WHERE stn.stn_nam LIKE @name AND stn.act_inact_ind = 1 AND stn.stn_aval = 1;");
               


                output = await this.DBUtils(true).GetEntityDataListAsync<CombSrchObject>(query.ToString(), dbParamters, r =>
                {
                   
                    return new CombSrchObject
                    {
                        ID = r.GetValue<string>("stn_cd"),
                        Text = r.GetValue<string>("StationDisplayText"),
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

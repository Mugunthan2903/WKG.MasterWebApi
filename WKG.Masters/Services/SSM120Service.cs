using Microsoft.Extensions.Logging;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;
using static WKG.Masters.Model.User;

namespace WKG.Masters.Services
{
    internal class SSM120Service : WKLServiceManger, ISSM120Service
    {
        #region Constructor
        public SSM120Service(IServiceProvider serviceProvider, ILogger<SSM120Service> logger)
        : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM120
        public async Task<SSM120Object> SSM120GetOnload(SessionInfo sessionInfo, SSM120Object input)
        {
            var output = new SSM120Object();
            try
            {
                List<SSM120SupplierData> tbl1 = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);

                string query = @$"SELECT cng.supp_map_id,supp.supp_nam FROM  wkg_supp_config cng 
							INNER join rps_supp_mast supp ON supp.supp_map_id=cng.supp_map_id
							WHERE cng.supp_map_id in('BG','TB','GT2','TUI');";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new List<SSM120SupplierData>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM120SupplierData obj1 = new SSM120SupplierData();
                        obj1.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj1.supp_nam = r.GetValue<string>("supp_nam");
                        tbl1.Add(obj1);
                    }
                }
                output.Supplier_List = tbl1;
            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        //public async Task<SSM120Object> SSM120GetsearchOnload(SessionInfo sessionInfo, SSM120Object input)
        //{
        //    var output = new SSM120Object();
        //    try
        //    {
        //        List<SSM120GriDdata> tbl = new List<SSM120GriDdata>();
        //        var dbParamters = new DBParameters();

        //        dbParamters.Add("@supp_map_id", string.IsNullOrEmpty(input.supp_map_id) ? DBNull.Value : input.supp_map_id);
        //        dbParamters.Add("@prod_nam", "%" + input.prod_nam + "%");
        //        dbParamters.Add("@wkg_city_cd", string.IsNullOrEmpty(input.wkg_city_cd) ? DBNull.Value : input.wkg_city_cd);
        //        dbParamters.Add("@act_inact_ind", input.act_inact_ind);
        //        string sortstring = "";
        //        //sortstring = input.SortTyp != null;
        //        //? $"CombinedResults.prod_nam {(input.SortTyp.Value ? "ASC" : "DESC")}"
        //        //: input.SortTypCity != null
        //        //? $"CombinedResults.City_desc {(input.SortTypCity.Value ? "ASC" : "DESC")}"
        //        //: "CombinedResults.prod_nam ASC";

        //        if (string.IsNullOrEmpty(input.supp_map_id) && string.IsNullOrEmpty(input.prod_nam) && !string.IsNullOrEmpty(input.wkg_city_cd))
        //        {
        //            if (input.SortTyp == null && input.SortTypCity == null)
        //            {
        //                sortstring = "CombinedResults.prod_featrd DESC, ISNULL(CombinedResults.sort_ordr, 9999) ASC ,CombinedResults.prod_nam ASC";
        //            }
        //            else
        //            {
        //                if (input.SortTyp != null)
        //                {
        //                    sortstring += $"CombinedResults.prod_nam {(input.SortTyp.Value ? "ASC" : "DESC")}";
        //                }
        //                if (input.SortTypCity != null)
        //                {
        //                    sortstring += $"{(input.SortTyp != null ? "," : "")}CombinedResults.City_desc {(input.SortTypCity.Value ? "ASC" : "DESC")}";
        //                }
        //            }
        //        }
        //        else if (input.SortTyp == null && input.SortTypCity == null)
        //        {
        //            sortstring = $"CombinedResults.prod_nam ASC";
        //        }
        //        else
        //        {
        //            if (input.SortTyp != null)
        //            {
        //                sortstring += $"CombinedResults.prod_nam {(input.SortTyp.Value ? "ASC" : "DESC")}";
        //            }
        //            if (input.SortTypCity != null)
        //            {
        //                sortstring += $"{(input.SortTyp != null ? "," : "")}CombinedResults.City_desc {(input.SortTypCity.Value ? "ASC" : "DESC")}";
        //            }
        //        }


        //        //dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
        //        //dbParamters.Add("@endrow", input.PageNo * input.PageSize);
        //        string query = @$"WITH CombinedResults AS (

        //        SELECT ISNULL(CONVERT(VARCHAR, dtl_srl), '') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd, tcty.wkg_city_cd) wkg_city_cd,
        //        rcty.City_desc,'TUI' supp_map_id,supp.supp_nam,ISNULL(cty.prod_id, tui.tui_prod_id) prod_id,tui.tui_prod_nam prod_nam,
        //        ISNULL(cty.act_inact_ind, 1) act_inact_ind,
        //        ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,cty.wkg_city_cds as wkg_city_cds,cty.wkg_city_cds as wkg_city_nams
        //        FROM wkg_tui_prod_dtl tui LEFT OUTER JOIN wkg_tui_city tcty ON ((tcty.tui_city_cd = tui.tui_city_cd) OR (tui.appl_city_cds IS NULL OR 
        //        tcty.tui_city_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(tui.appl_city_cds, ''), ','))))
        //        LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd = tcty.wkg_city_cd 
        //        LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.tui_prod_id  AND ovrd.supp_map_id='TUI'
        //        LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id = tui.tui_prod_id 
        //        AND cty.wkg_city_cd = rcty.City_cd AND cty.supp_map_id = 'TUI' INNER JOIN rps_supp_mast supp ON supp.supp_map_id = 'TUI'
        //        WHERE lang_cd = 'en-GB' AND tui_prod_aval = 1 AND tui.act_inact_ind = 1
        //        AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IS NULL))

        //        UNION ALL
        //        SELECT ISNULL(CONVERT(VARCHAR,dtl_srl),'') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) wkg_city_cd,rcty.City_desc,'GT2' 'supp_map_id',supp.supp_nam
        //        ,ISNULL(cty.prod_id,tui.vntrt_prod_id) prod_id,tui.vntrt_prod_nam [prod_nam],
        //        ISNULL(cty.act_inact_ind,1) act_inact_ind,
        //        ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,
        //        (SELECT STUFF(
        //        (SELECT N',' + LTRIM(RTRIM(rcty.City_cd))
        //        FROM wkg_tour_prod_cty_dtls wkg
        //        INNER JOIN rps_city_mast rcty ON rcty.City_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(wkg.wkg_city_cds,''), ','))
        //        WHERE ISNULL(wkg.wkg_city_cds,'') <> '' AND wkg.dtl_srl=cty.dtl_srl
        //        FOR XML PATH(''),TYPE)
        //        .value('text()[1]','nvarchar(max)'),1,1,'')) wkg_city_cds,
        //        (SELECT STUFF(
        //        (SELECT N',' + LTRIM(RTRIM(CAST(rcty.City_cd AS VARCHAR) +'/'+rcty.City_desc +'-'+ cntry.Cntry_desc))
        //        FROM wkg_tour_prod_cty_dtls wkg
        //        INNER JOIN rps_city_mast rcty ON rcty.City_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(wkg.wkg_city_cds,''), ','))
        //        INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd=rcty.Cntry_cd
        //        WHERE ISNULL(wkg.wkg_city_cds,'') <> '' AND wkg.dtl_srl=cty.dtl_srl
        //        FOR XML PATH(''),TYPE)
        //        .value('text()[1]','nvarchar(max)'),1,1,'')) wkg_city_nams
        //        FROM wkg_vntrt_prod_dtl tui
        //        LEFT OUTER JOIN wkg_vntrt_city tcty ON tcty.vntrt_city_cd=tui.vntrt_prod_cty_cd  AND tcty.supp_map_id='GT2'
        //        LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd=tcty.wkg_city_cd
        //        LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.vntrt_prod_id  AND ovrd.supp_map_id='GT2'
        //        LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id=tui.vntrt_prod_id AND (rcty.City_cd IS NULL OR cty.wkg_city_cd=rcty.City_cd) AND cty.supp_map_id='GT2'
        //        INNER JOIN rps_supp_mast supp ON supp.supp_map_id='GT2'
        //        WHERE tui.supp_map_id='GT2' AND vntrt_prod_aval=1 AND tui.act_inact_ind=1
        //        AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IS NULL))

        //        UNION ALL
        //        SELECT ISNULL(CONVERT(VARCHAR,dtl_srl),'') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) wkg_city_cd,rcty.City_desc,'TB' 'supp_map_id',supp.supp_nam
        //        ,ISNULL(cty.prod_id,tui.vntrt_prod_id) prod_id,tui.vntrt_prod_nam [prod_nam],ISNULL(cty.act_inact_ind,1) act_inact_ind,
        //        ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,cty.wkg_city_cds as wkg_city_cds,cty.wkg_city_cds as wkg_city_nams              
        //        FROM wkg_vntrt_prod_dtl tui
        //        LEFT OUTER JOIN wkg_vntrt_city tcty ON tcty.vntrt_city_cd=tui.vntrt_prod_cty_cd  AND tcty.supp_map_id='TB'
        //        LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd=tcty.wkg_city_cd
        //        LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.vntrt_prod_id  AND ovrd.supp_map_id='TB'
        //        LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id=tui.vntrt_prod_id AND cty.wkg_city_cd=rcty.City_cd AND cty.supp_map_id='TB'
        //        INNER JOIN rps_supp_mast supp ON supp.supp_map_id='TB'
        //        WHERE tui.supp_map_id='TB' AND vntrt_prod_aval=1 AND tui.act_inact_ind=1
        //        AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IS NULL))

        //        UNION ALL
        //        SELECT ISNULL(CONVERT(VARCHAR,dtl_srl),'') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) wkg_city_cd,rcty.City_desc,'BG' 'supp_map_id',supp.supp_nam
        //        ,ISNULL(cty.prod_id,tui.vntrt_prod_id) prod_id,tui.vntrt_prod_nam [prod_nam],ISNULL(cty.act_inact_ind,1) act_inact_ind,
        //        ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,cty.wkg_city_cds as wkg_city_cds,cty.wkg_city_cds as wkg_city_nams           
        //        FROM wkg_vntrt_prod_dtl tui
        //        LEFT OUTER JOIN wkg_vntrt_city tcty ON tcty.vntrt_city_cd=tui.vntrt_prod_cty_cd  AND tcty.supp_map_id='BG'
        //        LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd=tcty.wkg_city_cd
        //        LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.vntrt_prod_id  AND ovrd.supp_map_id='BG'
        //        LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id=tui.vntrt_prod_id AND cty.wkg_city_cd=rcty.City_cd AND cty.supp_map_id='BG'
        //        INNER JOIN rps_supp_mast supp ON supp.supp_map_id='BG'
        //        WHERE tui.supp_map_id='BG' AND vntrt_prod_aval=1 AND tui.act_inact_ind=1
        //        AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IS NULL)))

        //        SELECT * FROM (SELECT *,ROW_NUMBER() OVER (ORDER BY {sortstring}) AS cnt,
        //        COUNT(*) OVER () AS total_count FROM CombinedResults
        //        WHERE (@supp_map_id IS NULL OR supp_map_id = @supp_map_id) AND prod_nam LIKE @prod_nam AND 
        //        act_inact_ind = @act_inact_ind) 
        //        AS temp 
        //        --WHERE temp.cnt BETWEEN @startrow AND @endrow;
        //        ";
        //        DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
        //        int totalCount = 0;
        //        if (DS != null && DS.Tables.Count > 0)
        //        {
        //            foreach (DataRow r in DS.Tables[0].Rows)
        //            {
        //                totalCount = r.GetValue<int>("total_count");
        //                SSM120GriDdata obj = new SSM120GriDdata
        //                {
        //                    dtl_srl = r.GetValue<string>("dtl_srl"),
        //                    ovrd_srl = r.GetValue<string>("ovrd_srl"),
        //                    wkg_city_cd = r.GetValue<string>("wkg_city_cd"),
        //                    wkg_city_cds = r.GetValue<string>("wkg_city_cds"),
        //                    wkg_city_nams = r.GetValue<string>("wkg_city_nams"),
        //                    city_desc = r.GetValue<string>("city_desc"),
        //                    supp_map_id = r.GetValue<string>("supp_map_id"),
        //                    supp_nam = r.GetValue<string>("supp_nam"),
        //                    prod_id = r.GetValue<string>("prod_id"),
        //                    prod_nam = r.GetValue<string>("prod_nam"),
        //                    sort_ordr = r.GetValue<string>("sort_ordr"),
        //                    prod_featrd = r.GetValue<bool>("prod_featrd"),
        //                    act_inact_ind = r.GetValue<bool>("act_inact_ind")
        //                };
        //                tbl.Add(obj);
        //            }
        //        }
        //        output.Grid_List = tbl;
        //        //output.TotalRecords = totalCount;
        //        //output.CurrentPage = input.PageNo;
        //        //output.SetPages(output.TotalRecords, input.PageSize);
        //    }
        //    catch (Exception ex)
        //    {
        //        this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input: {input.ToJsonText()}");
        //    }
        //    return output;
        //}
        public async Task<SSM120Object> SSM120GetsearchOnload(SessionInfo sessionInfo, SSM120Object input)
        {
            var output = new SSM120Object();
            try
            {
                List<SSM120GriDdata> tbl = new List<SSM120GriDdata>();
                var dbParamters = new DBParameters();

                dbParamters.Add("@supp_map_id", string.IsNullOrEmpty(input.supp_map_id) ? DBNull.Value : input.supp_map_id);
                dbParamters.Add("@prod_nam", "%" + input.prod_nam?.Trim() + "%");
                dbParamters.Add("@wkg_city_cd", string.IsNullOrEmpty(input.wkg_city_cd) ? DBNull.Value : input.wkg_city_cd);
                dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                string sortstring = "";

                if (string.IsNullOrEmpty(input.supp_map_id) && string.IsNullOrEmpty(input.prod_nam) && !string.IsNullOrEmpty(input.wkg_city_cd))
                {
                    if (input.SortTyp == null && input.SortTypCity == null)
                    {
                        sortstring = "CombinedResults.prod_featrd DESC, ISNULL(CombinedResults.sort_ordr, 9999) ASC ,CombinedResults.prod_nam ASC";
                    }
                    else
                    {
                        if (input.SortTyp != null)
                        {
                            sortstring += $"CombinedResults.prod_nam {(input.SortTyp.Value ? "ASC" : "DESC")}";
                        }
                        if (input.SortTypCity != null)
                        {
                            sortstring += $"{(input.SortTyp != null ? "," : "")}CombinedResults.City_desc {(input.SortTypCity.Value ? "ASC" : "DESC")}";
                        }
                    }
                }
                else if (input.SortTyp == null && input.SortTypCity == null)
                {
                    sortstring = $"CombinedResults.prod_nam ASC";
                }
                else
                {
                    if (input.SortTyp != null)
                    {
                        sortstring += $"CombinedResults.prod_nam {(input.SortTyp.Value ? "ASC" : "DESC")}";
                    }
                    if (input.SortTypCity != null)
                    {
                        sortstring += $"{(input.SortTyp != null ? "," : "")}CombinedResults.City_desc {(input.SortTypCity.Value ? "ASC" : "DESC")}";
                    }
                }
                string query = @$"WITH CombinedResults AS (
                    SELECT ISNULL(CONVERT(VARCHAR, dtl_srl), '') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd, tcty.wkg_city_cd) wkg_city_cd,
                    rcty.City_desc,'TUI' supp_map_id,supp.supp_nam,ISNULL(cty.prod_id, tui.tui_prod_id) prod_id,tui.tui_prod_nam prod_nam,
                    ISNULL(cty.act_inact_ind, 1) act_inact_ind,
                    ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,cty.wkg_city_cds as wkg_city_cds,cty.wkg_city_cds as wkg_city_nams
                    FROM wkg_tui_prod_dtl tui LEFT OUTER JOIN wkg_tui_city tcty ON ((tcty.tui_city_cd = tui.tui_city_cd) OR (tui.appl_city_cds IS NULL OR 
                    tcty.tui_city_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(tui.appl_city_cds, ''), ','))))
                    LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd = tcty.wkg_city_cd 
                    LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.tui_prod_id  AND ovrd.supp_map_id='TUI'
                    LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id = tui.tui_prod_id 
                    AND cty.wkg_city_cd = rcty.City_cd AND cty.supp_map_id = 'TUI' INNER JOIN rps_supp_mast supp ON supp.supp_map_id = 'TUI'
                    WHERE lang_cd = 'en-GB' AND tui_prod_aval = 1 AND tui.act_inact_ind = 1
                    AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR 
                    EXISTS (
							SELECT custpricetype 
							FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd, ''), ',') AS split_cd
							WHERE split_cd.custpricetype IN 
							(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(cty.wkg_city_cds, ''), ','))
					))

                    UNION ALL
                    SELECT ISNULL(CONVERT(VARCHAR,dtl_srl),'') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) wkg_city_cd,rcty.City_desc,'GT2' 'supp_map_id',supp.supp_nam
                    ,ISNULL(cty.prod_id,tui.vntrt_prod_id) prod_id,tui.vntrt_prod_nam [prod_nam],
                    ISNULL(cty.act_inact_ind,1) act_inact_ind,
                    ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,
                    (SELECT STUFF(
                    (SELECT N',' + LTRIM(RTRIM(rcty.City_cd))
                    FROM rps_city_mast rcty
                    WHERE ISNULL(cty.wkg_city_cds,'') <> '' AND rcty.City_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(cty.wkg_city_cds,''), ','))
                    FOR XML PATH(''),TYPE)
                    .value('text()[1]','nvarchar(max)'),1,1,'')) wkg_city_cds,
                    (SELECT STUFF(
                    (SELECT N',' + LTRIM(RTRIM(CAST(rcty.City_cd AS VARCHAR) +'/'+rcty.City_desc +'-'+ cntry.Cntry_desc))
                    FROM rps_city_mast rcty
                    INNER JOIN rps_cntry_mast cntry ON cntry.Cntry_cd=rcty.Cntry_cd
                    WHERE ISNULL(cty.wkg_city_cds,'') <> '' AND rcty.City_cd IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(cty.wkg_city_cds,''), ','))
                    FOR XML PATH(''),TYPE)
                    .value('text()[1]','nvarchar(max)'),1,1,'')) wkg_city_nams
                    FROM wkg_vntrt_prod_dtl tui
                    LEFT OUTER JOIN wkg_vntrt_city tcty ON tcty.vntrt_city_cd=tui.vntrt_prod_cty_cd  AND tcty.supp_map_id='GT2'
                    LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd=tcty.wkg_city_cd
                    LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.vntrt_prod_id  AND ovrd.supp_map_id='GT2'
                    LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id=tui.vntrt_prod_id AND (rcty.City_cd IS NULL OR cty.wkg_city_cd=rcty.City_cd) AND cty.supp_map_id='GT2'
                    INNER JOIN rps_supp_mast supp ON supp.supp_map_id='GT2'
                    WHERE tui.supp_map_id='GT2' AND vntrt_prod_aval=1 AND tui.act_inact_ind=1
                    AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR 
                    EXISTS (
							SELECT custpricetype 
							FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd, ''), ',') AS split_cd
							WHERE split_cd.custpricetype IN 
							(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(cty.wkg_city_cds, ''), ','))
					))

                    UNION ALL
                    SELECT ISNULL(CONVERT(VARCHAR,dtl_srl),'') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) wkg_city_cd,rcty.City_desc,'TB' 'supp_map_id',supp.supp_nam
                    ,ISNULL(cty.prod_id,tui.vntrt_prod_id) prod_id,tui.vntrt_prod_nam [prod_nam],ISNULL(cty.act_inact_ind,1) act_inact_ind,
                    ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,cty.wkg_city_cds as wkg_city_cds,cty.wkg_city_cds as wkg_city_nams              
                    FROM wkg_vntrt_prod_dtl tui
                    LEFT OUTER JOIN wkg_vntrt_city tcty ON tcty.vntrt_city_cd=tui.vntrt_prod_cty_cd  AND tcty.supp_map_id='TB'
                    LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd=tcty.wkg_city_cd
                    LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.vntrt_prod_id  AND ovrd.supp_map_id='TB'
                    LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id=tui.vntrt_prod_id AND cty.wkg_city_cd=rcty.City_cd AND cty.supp_map_id='TB'
                    INNER JOIN rps_supp_mast supp ON supp.supp_map_id='TB'
                    WHERE tui.supp_map_id='TB' AND vntrt_prod_aval=1 AND tui.act_inact_ind=1
                    AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR 
                    EXISTS (
							SELECT custpricetype 
							FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd, ''), ',') AS split_cd
							WHERE split_cd.custpricetype IN 
							(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(cty.wkg_city_cds, ''), ','))
					))

                    UNION ALL
                    SELECT ISNULL(CONVERT(VARCHAR,dtl_srl),'') dtl_srl,ISNULL(CONVERT(VARCHAR, ovrd.ovrd_srl), '') ovrd_srl,ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) wkg_city_cd,rcty.City_desc,'BG' 'supp_map_id',supp.supp_nam
                    ,ISNULL(cty.prod_id,tui.vntrt_prod_id) prod_id,tui.vntrt_prod_nam [prod_nam],ISNULL(cty.act_inact_ind,1) act_inact_ind,
                    ISNULL(prod_featrd,0) prod_featrd,ISNULL(ovrd.sort_ordr,null) sort_ordr,cty.wkg_city_cds as wkg_city_cds,cty.wkg_city_cds as wkg_city_nams           
                    FROM wkg_vntrt_prod_dtl tui
                    LEFT OUTER JOIN wkg_vntrt_city tcty ON tcty.vntrt_city_cd=tui.vntrt_prod_cty_cd  AND tcty.supp_map_id='BG'
                    LEFT OUTER JOIN rps_city_mast rcty ON rcty.City_cd=tcty.wkg_city_cd
                    LEFT OUTER JOIN wkg_supp_prod_ovrd ovrd ON ovrd.prod_id=tui.vntrt_prod_id  AND ovrd.supp_map_id='BG'
                    LEFT OUTER JOIN wkg_tour_prod_cty_dtls cty ON cty.prod_id=tui.vntrt_prod_id AND cty.wkg_city_cd=rcty.City_cd AND cty.supp_map_id='BG'
                    INNER JOIN rps_supp_mast supp ON supp.supp_map_id='BG'
                    WHERE tui.supp_map_id='BG' AND vntrt_prod_aval=1 AND tui.act_inact_ind=1
                    AND (@wkg_city_cd IS NULL OR (ISNULL(cty.wkg_city_cd,tcty.wkg_city_cd) IN (SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd,''), ','))) OR 
                    EXISTS (
							SELECT custpricetype 
							FROM dbo.rms_fn_commasplit(ISNULL(@wkg_city_cd, ''), ',') AS split_cd
							WHERE split_cd.custpricetype IN 
							(SELECT custpricetype FROM dbo.rms_fn_commasplit(ISNULL(cty.wkg_city_cds, ''), ','))
					)))

                    SELECT * FROM (SELECT *,ROW_NUMBER() OVER (ORDER BY {sortstring}) AS cnt,
                    COUNT(*) OVER () AS total_count FROM CombinedResults
                    WHERE (@supp_map_id IS NULL OR supp_map_id = @supp_map_id) AND prod_nam LIKE @prod_nam AND 
                    act_inact_ind = @act_inact_ind) 
                    AS temp;";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters,60);
                int totalCount = 0;
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        totalCount = r.GetValue<int>("total_count");
                        SSM120GriDdata obj = new SSM120GriDdata
                        {
                            dtl_srl = r.GetValue<string>("dtl_srl"),
                            ovrd_srl = r.GetValue<string>("ovrd_srl"),
                            wkg_city_cd = r.GetValue<string>("wkg_city_cd"),
                            wkg_city_cds = r.GetValue<string>("wkg_city_cds"),
                            wkg_city_nams = r.GetValue<string>("wkg_city_nams"),
                            city_desc = r.GetValue<string>("city_desc"),
                            supp_map_id = r.GetValue<string>("supp_map_id"),
                            supp_nam = r.GetValue<string>("supp_nam"),
                            prod_id = r.GetValue<string>("prod_id"),
                            prod_nam = r.GetValue<string>("prod_nam"),
                            sort_ordr = r.GetValue<string>("sort_ordr"),
                            prod_featrd = r.GetValue<bool>("prod_featrd"),
                            act_inact_ind = r.GetValue<bool>("act_inact_ind")
                        };
                        tbl.Add(obj);
                    }
                }
                output.Grid_List = tbl;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input: {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, SSM120GriDdata input)
        {
            var output = new OperationStatus();
            try
            {
                using var dbService = this.GetDBService(true);
                using var dbTran = dbService.BeginTransaction();

                try
                {
                    var dbParameters = new DBParameters();
                    int index = 0;
                    var query = new StringBuilder();
                    dbParameters.Add($"@mod_by_usr_cd", input.mod_by_usr_cd);
                    foreach (var item in input.Selectedrow)
                    {
                        dbParameters.Add($"@wkg_city_cd{index}", item.wkg_city_cd.ToString());
                        dbParameters.Add($"@wkg_city_cds{index}", item.wkg_city_cds.ToString());
                        dbParameters.Add($"@supp_map_id{index}", item.supp_map_id.ToString());
                        dbParameters.Add($"@prod_id{index}", item.prod_id.ToString());
                        dbParameters.Add($"@prod_featrd{index}", item.prod_featrd.ToString());
                        dbParameters.Add($"@sort_ordr{index}", item.sort_ordr.ToString());
                        dbParameters.Add($"@act_inact_ind{index}", item.act_inact_ind.ToString() == "Active");
                        if (!string.IsNullOrEmpty(item.dtl_srl.ToString()))
                        {
                            if (!string.IsNullOrEmpty(item.wkg_city_cd.ToString()))
                            {
                                query.Append($@"UPDATE wkg_tour_prod_cty_dtls SET  
                                     act_inact_ind = @act_inact_ind{index}, mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE()
                                     WHERE dtl_srl = @dtl_srl{index};");
                            }
                            else
                            {
                                query.Append($@"UPDATE wkg_tour_prod_cty_dtls SET 
                                     wkg_city_cds = @wkg_city_cds{index}, act_inact_ind = @act_inact_ind{index}, mod_by_usr_cd = @mod_by_usr_cd,
                                     mod_dttm = GETDATE() WHERE dtl_srl = @dtl_srl{index};");
                            }

                            dbParameters.Add($"@dtl_srl{index}", item.dtl_srl.ToString());
                        }
                        else
                        {
                            if (!string.IsNullOrEmpty(item.wkg_city_cd.ToString()))
                            {
                                query.Append($@"INSERT INTO wkg_tour_prod_cty_dtls (wkg_city_cd, supp_map_id, prod_id,act_inact_ind, mod_by_usr_cd, mod_dttm)
                                VALUES (@wkg_city_cd{index}, @supp_map_id{index},@prod_id{index},@act_inact_ind{index}, @mod_by_usr_cd, GETDATE());");
                            }
                            else
                            {
                                query.Append($@"INSERT INTO wkg_tour_prod_cty_dtls (wkg_city_cds, supp_map_id, prod_id,act_inact_ind, mod_by_usr_cd, mod_dttm)
                                VALUES (@wkg_city_cds{index}, @supp_map_id{index},@prod_id{index},@act_inact_ind{index}, @mod_by_usr_cd, GETDATE());");
                            }
                        }
                        if (!string.IsNullOrEmpty(item.ovrd_srl.ToString()))
                        {
                            query.Append($@"UPDATE wkg_supp_prod_ovrd SET prod_id = @prod_id{index},supp_map_id = @supp_map_id{index},prod_featrd = @prod_featrd{index},    
                            mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE(),sort_ordr = @sort_ordr{index} WHERE ovrd_srl = @ovrd_srl{index};");
                            dbParameters.Add($"@ovrd_srl{index}", item.ovrd_srl.ToString());
                        }
                        else
                        {
                            query.Append($@"INSERT INTO wkg_supp_prod_ovrd (prod_id,supp_map_id,prod_featrd,mod_by_usr_cd,mod_dttm,sort_ordr)
                            VALUES(@prod_id{index},@supp_map_id{index},@prod_featrd{index},@mod_by_usr_cd,GETDATE(),@sort_ordr{index});");
                        }
                        index++;
                    }
                    await dbService.ExecuteSqlCommandAsync(query.ToString(), dbParameters);
                    dbTran.Commit();
                    return new OperationStatus
                    {
                        IsSuccess = true,
                        Message = "Data processed successfully."
                    };
                }
                catch (Exception ex)
                {
                    dbTran.Rollback();
                    this.Logger.LogError(ex, $"Method: {nameof(SaveAsync)} failed during transaction.");
                    return new OperationStatus
                    {
                        IsSuccess = false,
                        Message = "Something went wrong during transaction."
                    };
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Method: {nameof(SaveAsync)} encountered an error.");
                return new OperationStatus
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred."
                };
            }
        }
        #endregion
    }
}

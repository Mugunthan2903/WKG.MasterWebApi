using Microsoft.AspNetCore.Http;
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
using WKG.Masters.Services;

namespace WKG.Masters.Services
{
    public class SSM012Service : WKLServiceManger, ISSM012Service
    {
        #region Constructor
        public SSM012Service(IServiceProvider serviceProvider, ILogger<SSM012Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Private Methods
        private async Task<SSM012CheckExist> CheckPosId(short? posId)
        {
            SSM012CheckExist output = new SSM012CheckExist();
            output.SectionExist = new SSM012SecExistIndex();
            output.isPosGrpIdExist = false;

            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", posId);
                int i = 0;
                // check's if home page details already exist for the passed in pos group id
                string query = @"SELECT hmpg_srl, pos_grp_id, hmpg_sctn_cd, head_data_srl, cptn_data_srl, cptn_bg_clr, hmd.img_srl, form_id, hmd.prod_id, 
                                  hmd.sort_ordr, hmd.act_inact_ind, emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd, 
                                  REPLACE(CONVERT(VARCHAR, hmd.mod_dttm, 106), ' ', '-') + ' ' + CONVERT(VARCHAR(5), hmd.mod_dttm, 108) AS mod_dttm, 
                                  imd.img_nam AS img_nam,head_img_srl,img.img_nam AS head_img FROM wkg_pos_grp_hmpg_dtls hmd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmd.mod_by_usr_cd 
                                  INNER JOIN rps_emp_mast emp ON emp.emp_cd = usr.emp_cd LEFT JOIN wkg_img_dtls imd ON imd.img_srl = hmd.img_srl
                                  LEFT JOIN wkg_img_dtls img ON img.img_srl = hmd.head_img_srl WHERE NOT hmpg_sctn_cd = 'SEC5' AND pos_grp_id = @pos_grp_id;";
                output.FormData = await this.DBUtils(true).GetEntityDataListAsync<SSM012TableFields>(query, dbParamters, r =>
                {
                    var temp = new SSM012TableFields();
                    temp.cptn_data_srl = r.GetValue<int>("cptn_data_srl");
                    temp.bg_img = r.GetValue<string>("img_nam");
                    temp.img_srl = r.GetValue<int>("img_srl");
                    temp.form_id = r.GetValue<string>("form_id");
                    temp.cptn_bg_clr = r.GetValue<string>("cptn_bg_clr");
                    temp.pos_grp_id = r.GetValue<short>("pos_grp_id");
                    temp.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                    temp.mod_dttm = r.GetValue<string>("mod_dttm");
                    if (r.GetValue<string>("hmpg_sctn_cd") == "SEC1")
                    {
                        temp.head_data_srl_sec1 = r.GetValue<int>("head_data_srl");
                        temp.head_img_srl = r.GetValue<string>("head_img_srl");
                        temp.hdr_img = r.GetValue<string>("head_img");
                        output.SectionExist.Sec1Index = i;
                        output.SectionExist.Sec1hmpgsrl = r.GetValue<int>("hmpg_srl");
                    }
                    else if (r.GetValue<string>("hmpg_sctn_cd") == "SEC2")
                    {
                        temp.head_data_srl_sec2 = r.GetValue<int>("head_data_srl");
                        temp.cptn_data_srl_sec2 = r.GetValue<int>("cptn_data_srl");
                        output.SectionExist.Sec2Exist = true;
                        output.SectionExist.Sec2Index = i;
                        output.SectionExist.Sec2hmpgsrl = r.GetValue<int>("hmpg_srl");
                    }
                    else if (r.GetValue<string>("hmpg_sctn_cd") == "SEC3")
                    {
                        temp.head_data_srl_sec3 = r.GetValue<int>("head_data_srl");
                        output.SectionExist.Sec3Exist = true;
                        output.SectionExist.Sec3Index = i;
                        output.SectionExist.Sec3hmpgsrl = r.GetValue<int>("hmpg_srl");
                    }
                    else
                    {
                        temp.head_data_srl_sec4 = r.GetValue<int>("head_data_srl");
                        output.SectionExist.Sec4Exist = true;
                        output.SectionExist.Sec4Index = i;
                        output.SectionExist.Sec4hmpgsrl = r.GetValue<int>("hmpg_srl");
                    }
                    i++;
                    return temp;
                });
                if (output.FormData.Count > 0)
                {
                    output.isPosGrpIdExist = true;
                }
                else
                {
                    output.isPosGrpIdExist = false;
                }

            }
            catch (Exception ex) { }
            return output;

        }
        #endregion

        #region Public Methods SSM012
        //SSM012
        public async Task<SSM012InitLoad> LoadInitData(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new SSM012InitLoad();
            try
            {
                output.posIdExist = await CheckPosId(input.pos_grp_id);
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParamters.Add("@endrow", input.PageNo * input.PageSize);
                dbParamters.Add("@img_dir", input.img_dir);

                //retrives select box head and content text list, form id. table data todo,slider and concierge and image list
                string query = @"SELECT data_srl, en_GB FROM wkg_lang_data WHERE data_typ_cd = 'HMPG';

                                  select form_id,form_nam from wkg_pos_ssm_form_dtls;

                                  select data_srl,en_GB from wkg_lang_data where data_typ_cd='TODO';

                                  SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY todo_srl) AS cnt, tod.todo_srl,tod.form_id,tod.sort_ordr,tod.act_inact_ind,lnm.en_GB, 
                                  COUNT(*) OVER () AS total_count FROM wkg_pos_grp_todo_dtls tod Inner Join wkg_lang_data lnm on tod.data_srl = lnm.data_srl 
                                  where lnm.data_typ_cd = 'TODO' And tod.pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY slide_srl) AS cnt, sld.slide_srl,sld.form_id,sld.sort_ordr,sld.act_inact_ind,imd.img_nam,
                                  COUNT(*) OVER () AS total_count FROM wkg_pos_grp_slide_dtls sld LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                                  sld.img_srl
                                  where sld.pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY hmpg_srl) AS cnt, hmd.hmpg_srl,hmd.form_id,hmd.sort_ordr,hmd.act_inact_ind,ldm.en_GB, 
                                  COUNT(*) OVER () AS total_count FROM wkg_pos_grp_hmpg_dtls hmd Inner Join wkg_lang_data ldm on hmd.cptn_data_srl = ldm.data_srl 
                                  where hmpg_sctn_cd = 'SEC5' and pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;

                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;

                                  SELECT data_srl, en_GB FROM wkg_lang_data WHERE data_typ_cd = 'CTY';

                                  SELECT hmpg_typ from wkg_pos_grp_mast WHERE pos_grp_id=@pos_grp_id;";
                List<SSM012ComboBoxes> headerTextSec1 = null;
                List<SSM012ComboBoxes> HeaderCitySec2 = null;
                List<SSM012ComboBoxes> formId = null;
                List<SSM012ComboBoxes> todo = null;
                PageInfo<SSM012TableFields> sec2Table = null;
                PageInfo<SSM012TableFields> sec3Table = null;
                PageInfo<SSM012TableFields> sec4Table = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    headerTextSec1 = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.data_srl = r.GetValue<int>("data_srl");
                        obj.enGB = r.GetValue<string>("en_GB");
                        headerTextSec1.Add(obj);
                    }
                    formId = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.form_nam = r.GetValue<string>("form_nam");
                        formId.Add(obj);
                    }
                    todo = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.data_srl = r.GetValue<int>("data_srl");
                        obj.enGB = r.GetValue<string>("en_GB");
                        todo.Add(obj);
                    }
                    sec2Table = new PageInfo<SSM012TableFields>();
                    sec2Table.Items = new List<SSM012TableFields>();
                    sec2Table.CurrentPage = 1;
                    int tolR = 0;
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        tolR = r.GetValue<int>("total_count");
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.todo_srl = r.GetValue<int>("todo_srl");
                        obj.todoName = r.GetValue<string>("en_GB");
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        sec2Table.Items.Add(obj);
                    }
                    sec2Table.TotalRecords = tolR;
                    sec2Table.CurrentPage = 1;
                    sec2Table.SetPages(sec2Table.TotalRecords, input.PageSize);
                    sec3Table = new PageInfo<SSM012TableFields>();
                    sec3Table.Items = new List<SSM012TableFields>();
                    tolR = 0;
                    /*SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY slide_srl) AS cnt, sld.slide_srl,sld.form_id,sld.sort_ordr,sld.act_inact_ind,imd.img_nam,
                                  COUNT(*) OVER () AS total_count FROM wkg_pos_grp_slide_dtls sld LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                                  sld.img_srl
                                  where sld.pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;*/
                    foreach (DataRow r in DS.Tables[4].Rows)
                    {
                        tolR = r.GetValue<int>("total_count");
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.slide_img = r.GetValue<string>("img_nam");
                        obj.slide_srl = r.GetValue<int>("slide_srl");
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        sec3Table.Items.Add(obj);
                    }
                    sec3Table.TotalRecords = tolR;
                    sec3Table.CurrentPage = 1;
                    sec3Table.SetPages(sec3Table.TotalRecords, input.PageSize);
                    sec4Table = new PageInfo<SSM012TableFields>();
                    sec4Table.Items = new List<SSM012TableFields>();
                    tolR = 0;
                    /*SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY hmpg_srl) AS cnt, hmd.hmpg_srl,hmd.form_id,hmd.sort_ordr,hmd.act_inact_ind,ldm.en_GB, 
                                  COUNT(*) OVER () AS total_count FROM wkg_pos_grp_hmpg_dtls hmd Inner Join wkg_lang_data ldm on hmd.cptn_data_srl = ldm.data_srl 
                                  where hmpg_sctn_cd = 'SEC5' and pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;*/
                    foreach (DataRow r in DS.Tables[5].Rows)
                    {
                        tolR = r.GetValue<int>("total_count");
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.en_GB = r.GetValue<string>("en_GB");
                        obj.hmpg_srl = r.GetValue<int>("hmpg_srl");
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        sec4Table.Items.Add(obj);
                    }
                    sec4Table.TotalRecords = tolR;
                    sec4Table.CurrentPage = 1;
                    sec4Table.SetPages(sec4Table.TotalRecords, input.PageSize);
                    foreach (DataRow r in DS.Tables[6].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");

                    }
                    HeaderCitySec2 = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[7].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.data_srl = r.GetValue<int>("data_srl");
                        obj.enGB = r.GetValue<string>("en_GB");
                        HeaderCitySec2.Add(obj);
                    }
                    foreach (DataRow r in DS.Tables[8].Rows)
                    {
                        output.Grphmpgtyp = string.IsNullOrEmpty(r.GetValue<string>("hmpg_typ")) ? StaticData.SSM010SC.HomePageList.First(item => item.Default == true)?.ID : r.GetValue<string>("hmpg_typ");
                    }
                }
                output.HeaderTextSec1 = headerTextSec1;
                output.HeaderCitySec2 = HeaderCitySec2;
                output.FormId = formId;
                output.TodoSec2 = todo;
                output.Section2Table = sec2Table;
                output.Section3Table = sec3Table;
                output.Section4Table = sec4Table;
                output.HomeScreenList = StaticData.SSM010SC.HomeScreenTypes;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<PageInfo<SSM012TableFields>> TablePagination(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new PageInfo<SSM012TableFields>();
            var dbParamters = new DBParameters();
            dbParamters.Add("@pos_grp_id", input.pos_grp_id);
            dbParamters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
            dbParamters.Add("@endrow", input.PageNo * input.PageSize);
            string query = "";
            int totalrecords = 0;
            if (input.TableNo == 2)
            {
                // table pagination for todo
                query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY todo_srl) AS cnt, tod.todo_srl,tod.form_id,tod.sort_ordr,tod.act_inact_ind,lnm.en_GB, 
                           COUNT(*) OVER () AS total_count FROM wkg_pos_grp_todo_dtls tod Inner Join wkg_lang_data lnm on tod.data_srl = lnm.data_srl 
                           where lnm.data_typ_cd = 'TODO' And tod.pos_grp_id = @pos_grp_id) AS temp 
                           WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM012TableFields>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM012TableFields
                    {
                        todo_srl = r.GetValue<int>("todo_srl"),
                        todoName = r.GetValue<string>("en_GB"),
                        form_id = r.GetValue<string>("form_id"),
                        sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind")
                    };
                });
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }
            else if (input.TableNo == 3)
            {
                // table pagination for slider
                query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY slide_srl) AS cnt, sld.slide_srl,sld.form_id,sld.sort_ordr,sld.act_inact_ind,imd.img_nam,
                           COUNT(*) OVER () AS total_count FROM wkg_pos_grp_slide_dtls sld LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                           sld.img_srl
                           where sld.pos_grp_id = @pos_grp_id) AS temp 
                           WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM012TableFields>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM012TableFields
                    {
                        slide_img = r.GetValue<string>("img_nam"),
                        slide_srl = r.GetValue<int>("slide_srl"),
                        form_id = r.GetValue<string>("form_id"),
                        sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),

                    };
                });
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }
            else
            {
                // table pagination for concierge
                query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY hmpg_srl) AS cnt, hmd.hmpg_srl,hmd.form_id,hmd.sort_ordr,hmd.act_inact_ind,ldm.en_GB, 
                           COUNT(*) OVER () AS total_count FROM wkg_pos_grp_hmpg_dtls hmd Inner Join wkg_lang_data ldm on hmd.cptn_data_srl = ldm.data_srl 
                           where hmpg_sctn_cd = 'SEC5' and pos_grp_id = @pos_grp_id) AS temp 
                           WHERE temp.cnt BETWEEN @startrow AND @endrow;";

                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM012TableFields>(query, dbParamters, r =>
                {
                    totalrecords = r.GetValue<int>("total_count");
                    return new SSM012TableFields
                    {
                        en_GB = r.GetValue<string>("en_GB"),
                        hmpg_srl = r.GetValue<int>("hmpg_srl"),
                        form_id = r.GetValue<string>("form_id"),
                        sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind")

                    };
                });
                output.TotalRecords = totalrecords;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsync(SessionInfo sessionInfo, SSM012TableFields input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            using (var dbService = this.GetDBService(true))
            {
                using (var dbTran = dbService.BeginTransaction())
                {
                    try
                    {
                        var dbParamters = new DBParameters();
                        dbParamters.Add("@head_data_srl_sec1", input.head_data_srl_sec1);
                        dbParamters.Add("@cptn_data_srl_sec2", input.cptn_data_srl_sec2);
                        dbParamters.Add("@head_data_srl_sec2", input.head_data_srl_sec2);
                        dbParamters.Add("@head_data_srl_sec3", input.head_data_srl_sec3);
                        dbParamters.Add("@head_data_srl_sec4", input.head_data_srl_sec4);
                        dbParamters.Add("@Sec1hmpgsrl", input.Sec1hmpgsrl);
                        dbParamters.Add("@Sec2hmpgsrl", input.Sec2hmpgsrl);
                        dbParamters.Add("@Sec3hmpgsrl", input.Sec3hmpgsrl);
                        dbParamters.Add("@Sec4hmpgsrl", input.Sec4hmpgsrl);
                        dbParamters.Add("@cptn_data_srl", input.cptn_data_srl);
                        dbParamters.Add("@bg_img", input.bg_img);
                        dbParamters.Add("@hdr_img", input.hdr_img);
                        dbParamters.Add("@img_srl", input.img_srl);
                        dbParamters.Add("@head_img_srl", input.head_img_srl);
                        dbParamters.Add("@form_id", input.form_id);
                        dbParamters.Add("@cptn_bg_clr", input.cptn_bg_clr);
                        dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                        dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                        string query = "";

                        // SSM012 update and insert
                        if (input.mode == "UPDATE")
                        {
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    if (input.oldhdrImage || input.hdrImgRm)
                                    {
                                        query = $@"UPDATE wkg_pos_grp_hmpg_dtls SET head_data_srl = 
                                       CASE 
                                           WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_data_srl_sec1       
                                           WHEN hmpg_srl = @Sec2hmpgsrl THEN @head_data_srl_sec2
                                           WHEN hmpg_srl = @Sec3hmpgsrl THEN @head_data_srl_sec3
                                           WHEN hmpg_srl = @Sec4hmpgsrl THEN @head_data_srl_sec4
                                       ELSE head_data_srl END,
                                       head_img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_img_srl ELSE head_img_srl END,
                                       cptn_data_srl =
                                       CASE 
                                            WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_data_srl 
                                            WHEN hmpg_srl = @Sec2hmpgsrl THEN @cptn_data_srl_sec2 
                                       ELSE cptn_data_srl END,
                                       img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @img_srl ELSE img_srl END, 
                                       form_id = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @form_id ELSE form_id END,
                                       cptn_bg_clr = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_bg_clr ELSE cptn_bg_clr END,
                                       mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() WHERE
                                       pos_grp_id = @pos_grp_id AND hmpg_sctn_cd IN ('SEC1', 'SEC2', 'SEC3', 'SEC4');
                                       {(!input.Sec2Exist && input.head_data_srl_sec2 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec3Exist && input.head_data_srl_sec3 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC3', @head_data_srl_sec3, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec4Exist && input.head_data_srl_sec4 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC4', @head_data_srl_sec4, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}";
                                    }
                                    else
                                    {
                                        query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@hdr_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       UPDATE wkg_pos_grp_hmpg_dtls SET head_data_srl = 
                                       CASE 
                                           WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_data_srl_sec1
                                           WHEN hmpg_srl = @Sec2hmpgsrl THEN @head_data_srl_sec2
                                           WHEN hmpg_srl = @Sec3hmpgsrl THEN @head_data_srl_sec3
                                           WHEN hmpg_srl = @Sec4hmpgsrl THEN @head_data_srl_sec4
                                       ELSE head_data_srl END,
                                       head_img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN (SELECT MAX(img_srl) FROM wkg_img_dtls) ELSE head_img_srl END,
                                       cptn_data_srl = 
                                       CASE 
                                            WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_data_srl 
                                            WHEN hmpg_srl = @Sec2hmpgsrl THEN @cptn_data_srl_sec2 
                                       ELSE cptn_data_srl END,
                                       img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @img_srl ELSE img_srl END, 
                                       form_id = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @form_id ELSE form_id END,
                                       cptn_bg_clr = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_bg_clr ELSE cptn_bg_clr END,
                                       mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() WHERE
                                       pos_grp_id = @pos_grp_id AND hmpg_sctn_cd IN ('SEC1', 'SEC2', 'SEC3', 'SEC4');
                                       {(!input.Sec2Exist && input.head_data_srl_sec2 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec3Exist && input.head_data_srl_sec3 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC3', @head_data_srl_sec3, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec4Exist && input.head_data_srl_sec4 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC4', @head_data_srl_sec4, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                    }
                                }
                                else
                                {
                                    if (input.oldhdrImage || input.hdrImgRm)
                                    {
                                        query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@bg_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       UPDATE wkg_pos_grp_hmpg_dtls SET head_data_srl = 
                                       CASE 
                                           WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_data_srl_sec1
                                           WHEN hmpg_srl = @Sec2hmpgsrl THEN @head_data_srl_sec2
                                           WHEN hmpg_srl = @Sec3hmpgsrl THEN @head_data_srl_sec3
                                           WHEN hmpg_srl = @Sec4hmpgsrl THEN @head_data_srl_sec4
                                       ELSE head_data_srl END,
                                       head_img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_img_srl ELSE head_img_srl END,
                                       cptn_data_srl = 
                                       CASE 
                                            WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_data_srl
                                            WHEN hmpg_srl = @Sec2hmpgsrl THEN @cptn_data_srl_sec2
                                       ELSE cptn_data_srl END,
                                       img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN (SELECT MAX(img_srl) FROM wkg_img_dtls) ELSE img_srl END, 
                                       form_id = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @form_id ELSE form_id END,
                                       cptn_bg_clr = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_bg_clr ELSE cptn_bg_clr END,
                                       mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() WHERE
                                       pos_grp_id = @pos_grp_id AND hmpg_sctn_cd IN ('SEC1', 'SEC2', 'SEC3', 'SEC4');
                                       {(!input.Sec2Exist && input.head_data_srl_sec2 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec3Exist && input.head_data_srl_sec3 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC3', @head_data_srl_sec3, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec4Exist && input.head_data_srl_sec4 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC4', @head_data_srl_sec4, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                    }
                                    else
                                    {
                                        query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES 
                                                   (@hdr_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE()),
                                                   (@bg_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       UPDATE wkg_pos_grp_hmpg_dtls SET head_data_srl = 
                                       CASE 
                                           WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_data_srl_sec1
                                           WHEN hmpg_srl = @Sec2hmpgsrl THEN @head_data_srl_sec2
                                           WHEN hmpg_srl = @Sec3hmpgsrl THEN @head_data_srl_sec3
                                           WHEN hmpg_srl = @Sec4hmpgsrl THEN @head_data_srl_sec4
                                       ELSE head_data_srl END,
                                       head_img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN (SELECT MAX(img_srl)-1 FROM wkg_img_dtls) ELSE head_img_srl END,
                                       cptn_data_srl = 
                                       CASE 
                                            WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_data_srl 
                                            WHEN hmpg_srl = @Sec2hmpgsrl THEN @cptn_data_srl_sec2
                                       ELSE cptn_data_srl END,
                                       img_srl = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN (SELECT MAX(img_srl) FROM wkg_img_dtls) ELSE img_srl END, 
                                       form_id = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @form_id ELSE form_id END,
                                       cptn_bg_clr = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_bg_clr ELSE cptn_bg_clr END,
                                       mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() WHERE
                                       pos_grp_id = @pos_grp_id AND hmpg_sctn_cd IN ('SEC1', 'SEC2', 'SEC3', 'SEC4');
                                       {(!input.Sec2Exist && input.head_data_srl_sec2 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec3Exist && input.head_data_srl_sec3 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC3', @head_data_srl_sec3, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       {(!input.Sec4Exist && input.head_data_srl_sec4 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC4', @head_data_srl_sec4, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                    }
                                }
                            }
                            else
                            {
                                query = @$"UPDATE wkg_pos_grp_hmpg_dtls SET head_data_srl = 
                               CASE 
                                   WHEN hmpg_srl = @Sec1hmpgsrl THEN @head_data_srl_sec1
                                   WHEN hmpg_srl = @Sec2hmpgsrl THEN @head_data_srl_sec2
                                   WHEN hmpg_srl = @Sec3hmpgsrl THEN @head_data_srl_sec3
                                   WHEN hmpg_srl = @Sec4hmpgsrl THEN @head_data_srl_sec4
                                   ELSE head_data_srl
                               END,
                                   cptn_data_srl = 
                                   CASE 
                                         WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_data_srl 
                                         WHEN hmpg_srl = @Sec2hmpgsrl THEN @cptn_data_srl_sec2 
                                   ELSE cptn_data_srl END,
                                   form_id = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @form_id ELSE form_id END,
                                   cptn_bg_clr = CASE WHEN hmpg_srl = @Sec1hmpgsrl THEN @cptn_bg_clr ELSE cptn_bg_clr END,
                               mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = GETDATE() WHERE pos_grp_id = @pos_grp_id AND hmpg_sctn_cd IN ('SEC1', 'SEC2', 'SEC3', 'SEC4');
                               {(!input.Sec2Exist && input.head_data_srl_sec2 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                               {(!input.Sec3Exist && input.head_data_srl_sec3 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC3', @head_data_srl_sec3, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}
                               {(!input.Sec4Exist && input.head_data_srl_sec4 != null ? "INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES ('SEC4', @head_data_srl_sec4, @pos_grp_id, @mod_by_usr_cd, GETDATE());" : "")}";
                            }
                        }
                        else
                        {
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    if (input.oldhdrImage || input.hdrImgRm)
                                    {
                                        query = $@"INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, img_srl, form_id, cptn_bg_clr, pos_grp_id, mod_by_usr_cd, mod_dttm, head_img_srl) VALUES
                                       ('SEC1', @head_data_srl_sec1, @cptn_data_srl, @img_srl, @form_id, @cptn_bg_clr, @pos_grp_id, @mod_by_usr_cd, GETDATE(),@head_img_srl)
                                       {(input.head_data_srl_sec2 != null ? ",('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec3 != null ? ",('SEC3', @head_data_srl_sec3, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec4 != null ? ",('SEC4', @head_data_srl_sec4, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")};";
                                    }
                                    else
                                    {
                                        query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@hdr_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, img_srl, form_id, cptn_bg_clr, pos_grp_id, mod_by_usr_cd, mod_dttm, head_img_srl) VALUES
                                       ('SEC1', @head_data_srl_sec1, @cptn_data_srl, @img_srl, @form_id, @cptn_bg_clr, @pos_grp_id, @mod_by_usr_cd, GETDATE(), (SELECT MAX(img_srl) FROM wkg_img_dtls))
                                       {(input.head_data_srl_sec2 != null ? ",('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec3 != null ? ",('SEC3', @head_data_srl_sec3, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec4 != null ? ",('SEC4', @head_data_srl_sec4, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")};
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                    }
                                }
                                else
                                {
                                    if (input.oldhdrImage || input.hdrImgRm)
                                    {
                                        query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@bg_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, img_srl, form_id, cptn_bg_clr, pos_grp_id, mod_by_usr_cd, mod_dttm, head_img_srl) VALUES
                                       ('SEC1', @head_data_srl_sec1, @cptn_data_srl, (SELECT MAX(img_srl) FROM wkg_img_dtls), @form_id, @cptn_bg_clr, @pos_grp_id, @mod_by_usr_cd, GETDATE(), @head_img_srl)
                                       {(input.head_data_srl_sec2 != null ? ",('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec3 != null ? ",('SEC3', @head_data_srl_sec3, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec4 != null ? ",('SEC4', @head_data_srl_sec4, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")};
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                    }
                                    else
                                    {
                                        query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm) VALUES 
                                       (@hdr_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE()),
                                       (@bg_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, img_srl, form_id, cptn_bg_clr, pos_grp_id, mod_by_usr_cd, mod_dttm, head_img_srl) VALUES
                                       ('SEC1', @head_data_srl_sec1, @cptn_data_srl, (SELECT MAX(img_srl) FROM wkg_img_dtls), @form_id, @cptn_bg_clr, @pos_grp_id, @mod_by_usr_cd, GETDATE(),(SELECT MAX(img_srl)-1 FROM wkg_img_dtls))
                                       {(input.head_data_srl_sec2 != null ? ",('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec3 != null ? ",('SEC3', @head_data_srl_sec3, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")}
                                       {(input.head_data_srl_sec4 != null ? ",('SEC4', @head_data_srl_sec4, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE(), null)" : "")};
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                    }
                                }
                            }
                            else
                            {
                                query = @$"INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd, head_data_srl, cptn_data_srl, form_id, cptn_bg_clr, pos_grp_id, mod_by_usr_cd, mod_dttm) VALUES
                               ('SEC1', @head_data_srl_sec1, @cptn_data_srl, @form_id, @cptn_bg_clr, @pos_grp_id, @mod_by_usr_cd, GETDATE())
                               {(input.head_data_srl_sec2 != null ? ",('SEC2', @head_data_srl_sec2, @cptn_data_srl_sec2, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE())" : "")},
                               {(input.head_data_srl_sec3 != null ? ",('SEC3', @head_data_srl_sec3, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE())" : "")}
                               {(input.head_data_srl_sec4 != null ? ",('SEC4', @head_data_srl_sec4, NULL, NULL, NULL, NULL, @pos_grp_id, @mod_by_usr_cd, GETDATE())" : "")};";
                            }

                        }
                        var temp = new imageDir();
                        temp = await this.DBUtils(true).GetEntityDataAsync<imageDir>(query, dbParamters, r =>
                        {
                            return new imageDir
                            {
                                ssm_img_dir = r.GetValue<string>("ssm_img_dir")
                            };
                        });
                        if (input.isImageChanged && (!input.oldImage || !input.oldhdrImage) && !input.hdrImgRm)
                        {
                            if (files != null)
                            {
                                var tourser = this.GetService<IFileManagerService>();
                                var saverslt = await tourser.SaveFileAsync(files, new List<string> { temp.ssm_img_dir });

                            }
                        }
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
                            this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                        }
                        this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                    }
                }
            }
            return output;
        }
        #endregion

        #region Public Methods SSM013
        public async Task<SSM012TableFields> LoadInitData5(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new SSM012TableFields();
            output.cntTxtExist = false;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@hmpg_srl", input.hmpg_srl);
                dbParamters.Add("@img_dir", input.img_dir);
                // retrives concierge corner data for specified hmpg_srl and image list
                string query = @"SELECT hmpg_srl,pos_grp_id,hmpg_sctn_cd,head_data_srl,cptn_data_srl,cptn_bg_clr,hmd.img_srl,imd.img_nam,hmd.form_id,hmd.supp_map_id,hmd.wkg_ctgry_id,
                                  hmd.prod_id,hmd.sort_ordr,hmd.act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                  REPLACE(CONVERT(VARCHAR,hmd.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmd.mod_dttm,108) AS mod_dttm 
                                  FROM wkg_pos_grp_hmpg_dtls hmd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmd.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                                  emp.emp_cd = usr.emp_cd LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                                  hmd.img_srl where hmpg_srl = @hmpg_srl And pos_grp_id = @pos_grp_id;
                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;
                                  SELECT ROW_NUMBER() OVER (ORDER BY supp_map_id) AS id,supp_map_id FROM wkg_supp_config WHERE supp_map_id IN ('LTD','TUI','GT2','BG','TB');
                                  SELECT ctgry.tour_ctgry_id,lang.en_GB as tour_ctgry_nam,ctgry.act_inact_ind FROM wkg_tour_ctgry ctgry 
                                  INNER JOIN wkg_lang_data lang ON ctgry.lang_data_srl = lang.data_srl;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.cptn_data_srl = r.GetValue<int>("cptn_data_srl");
                        obj.cptn_bg_clr = r.GetValue<string>("cptn_bg_clr");
                        obj.img_srl = r.GetValue<int>("img_srl");
                        obj.bg_img = r.GetValue<string>("img_nam");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.prod_id = r.GetValue<string>("prod_id");
                        obj.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj.wkg_ctgry_id = r.GetValue<string>("wkg_ctgry_id");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj.mod_dttm = r.GetValue<string>("mod_dttm");
                        output = obj;
                        output.cntTxtExist = true;
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");
                    }
                    output.supplierList = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj.id = r.GetValue<string>("id");
                        output.supplierList.Add(obj);
                    }
                    output.TourCategoryList = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        output.TourCategoryList.Add(obj);
                    }
                }
                output.LinkTypeSC = StaticData.SSM012SC.LinkType;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataSec5Async(SessionInfo sessionInfo, SSM012TableFields input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            using (var dbService = this.GetDBService(true))
            {
                using (var dbTran = dbService.BeginTransaction())
                {
                    try
                    {
                        var dbParamters = new DBParameters();
                        dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                        dbParamters.Add("@cptn_data_srl", input.cptn_data_srl);
                        dbParamters.Add("@cptn_bg_clr", input.cptn_bg_clr);
                        dbParamters.Add("@sort_ordr", input.sort_ordr);
                        dbParamters.Add("@form_id", input.form_id);
                        dbParamters.Add("@supp_map_id", input.supp_map_id);
                        dbParamters.Add("@prod_id", input.prod_id);
                        dbParamters.Add("@wkg_ctgry_id", input.wkg_ctgry_id);
                        dbParamters.Add("@bg_img", input.bg_img);
                        dbParamters.Add("@img_srl", input.img_srl);
                        dbParamters.Add("@hmpg_srl", input.hmpg_srl);
                        dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                        dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                        string query = "";

                        // SSM013 concierge update and insert
                        if (input.mode == "UPDATE")
                        {
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    // image reuse
                                    query = $@"UPDATE wkg_pos_grp_hmpg_dtls SET cptn_data_srl = @cptn_data_srl,cptn_bg_clr = @cptn_bg_clr,
                                       sort_ordr = @sort_ordr,{(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,wkg_ctgry_id = null" : "form_id =  @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = @wkg_ctgry_id"))}
                                       ,img_srl = @img_srl,act_inact_ind = @act_inact_ind,
                                       mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE()
                                       WHERE pos_grp_id = @pos_grp_id AND hmpg_sctn_cd = 'SEC5' AND hmpg_srl = @hmpg_srl;";
                                }
                                else
                                {
                                    // new image
                                    query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@bg_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       UPDATE wkg_pos_grp_hmpg_dtls SET cptn_data_srl = @cptn_data_srl,cptn_bg_clr = @cptn_bg_clr,
                                       sort_ordr = @sort_ordr,{(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,wkg_ctgry_id = null" : "form_id =  @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = @wkg_ctgry_id"))}
                                       ,img_srl = (SELECT MAX(img_srl) FROM wkg_img_dtls),act_inact_ind = @act_inact_ind,
                                       mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE()
                                       WHERE pos_grp_id = @pos_grp_id AND hmpg_sctn_cd = 'SEC5' AND hmpg_srl = @hmpg_srl;
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                }
                            }
                            else
                            {
                                // image not changed
                                query = $@"UPDATE wkg_pos_grp_hmpg_dtls SET cptn_data_srl = @cptn_data_srl,cptn_bg_clr = @cptn_bg_clr,
                               sort_ordr = @sort_ordr,{(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,wkg_ctgry_id = null" : "form_id =  @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = @wkg_ctgry_id"))}
                               ,act_inact_ind = @act_inact_ind,
                               mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE()
                               WHERE pos_grp_id = @pos_grp_id AND hmpg_sctn_cd = 'SEC5' AND hmpg_srl = @hmpg_srl;";
                            }
                        }
                        else
                        {
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    // image reuse
                                    query = $@"INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd,pos_grp_id,img_srl, cptn_data_srl, cptn_bg_clr,sort_ordr,form_id,supp_map_id,prod_id,wkg_ctgry_id,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                               VALUES ('SEC5',@pos_grp_id,@img_srl, @cptn_data_srl, @cptn_bg_clr,@sort_ordr,
                                               {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))}
                                               ,@act_inact_ind,@mod_by_usr_cd,getdate());";
                                }
                                else
                                {
                                    // new image
                                    query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@bg_img,(select ssm_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd,pos_grp_id,img_srl, cptn_data_srl, cptn_bg_clr,sort_ordr,form_id,supp_map_id,prod_id,wkg_ctgry_id,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES ('SEC5',@pos_grp_id,(SELECT MAX(img_srl) FROM wkg_img_dtls), @cptn_data_srl, @cptn_bg_clr,@sort_ordr,
                                       {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))}
                                       ,@act_inact_ind,@mod_by_usr_cd,getdate());
                                       select ssm_img_dir from wkg_cntrl_param_mast;";
                                }
                            }
                            else
                            {
                                // no image uploaded
                                query = $@"INSERT INTO wkg_pos_grp_hmpg_dtls (hmpg_sctn_cd,pos_grp_id, cptn_data_srl, cptn_bg_clr,sort_ordr,form_id,supp_map_id,prod_id,wkg_ctgry_id,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                          VALUES ('SEC5',@pos_grp_id, @cptn_data_srl, @cptn_bg_clr,@sort_ordr,
                                          {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))}
                                          ,@act_inact_ind,@mod_by_usr_cd,getdate());";
                            }
                        }
                        var temp = new imageDir();
                        temp = await this.DBUtils(true).GetEntityDataAsync<imageDir>(query, dbParamters, r =>
                        {
                            return new imageDir
                            {
                                ssm_img_dir = r.GetValue<string>("ssm_img_dir")
                            };
                        });
                        if (input.isImageChanged && !input.oldImage)
                        {
                            if (files != null)
                            {
                                var tourser = this.GetService<IFileManagerService>();
                                var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { temp.ssm_img_dir });

                            }
                        }
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
                            this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                        }
                        this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                    }
                }
            }
            return output;
        }
        public async Task<SSM012TableFields> ContentTextExistSec5(SessionInfo sessionInfo, SSM012TableFields input)
        {
            SSM012TableFields output = null;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@cptn_data_srl", input.cptn_data_srl);
                // checks if content text already exist in the wkg_pos_grp_hmpg_dtls table
                string query = @"SELECT hmpg_srl,pos_grp_id,hmpg_sctn_cd,head_data_srl,cptn_data_srl,cptn_bg_clr,hmd.img_srl,imd.img_nam,form_id,hmd.prod_id,hmd.supp_map_id,hmd.wkg_ctgry_id,
                                  hmd.sort_ordr,hmd.act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                  REPLACE(CONVERT(VARCHAR,hmd.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),hmd.mod_dttm,108) AS mod_dttm 
                                  FROM wkg_pos_grp_hmpg_dtls hmd INNER JOIN rps_usr_mast usr ON usr.Usr_id = hmd.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                                  emp.emp_cd = usr.emp_cd LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                                  hmd.img_srl where hmpg_sctn_cd = 'SEC5' AND cptn_data_srl = @cptn_data_srl And pos_grp_id = @pos_grp_id;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM012TableFields>(query, dbParamters, r =>
                {
                    return new SSM012TableFields
                    {
                        cptn_data_srl = r.GetValue<int>("cptn_data_srl"),
                        cptn_bg_clr = r.GetValue<string>("cptn_bg_clr"),
                        img_srl = r.GetValue<int>("img_srl"),
                        hmpg_srl = r.GetValue<int>("hmpg_srl"),
                        bg_img = r.GetValue<string>("img_nam"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        form_id = r.GetValue<string>("form_id"),
                        prod_id = r.GetValue<string>("prod_id"),
                        supp_map_id = r.GetValue<string>("supp_map_id"),
                        wkg_ctgry_id = r.GetValue<string>("wkg_ctgry_id"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });
                if (output != null)
                {
                    output.cntTxtExist = true;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataSec3Async(SessionInfo sessionInfo, SSM012TableFields input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            using (var dbService = this.GetDBService(true))
            {
                using (var dbTran = dbService.BeginTransaction())
                {
                    try
                    {
                        var dbParamters = new DBParameters();
                        //dbParamters.Add("@bg_img", input.bg_img);
                        dbParamters.Add("@bg_img", input.bg_img);
                        dbParamters.Add("@sort_ordr", input.sort_ordr);
                        dbParamters.Add("@form_id", input.form_id);
                        dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                        dbParamters.Add("@wkg_ctgry_id", input.wkg_ctgry_id);
                        dbParamters.Add("@slide_srl", input.slide_srl);
                        dbParamters.Add("@img_srl", input.img_srl);
                        dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                        dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                        dbParamters.Add("@supp_map_id", input.supp_map_id);
                        dbParamters.Add("@prod_id", input.prod_id);
                        string query = "";
                        if (input.mode == "UPDATE")
                        {
                            // update case
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    // linktype page
                                    query = $@"UPDATE wkg_pos_grp_slide_dtls SET img_srl = @img_srl,sort_ordr = @sort_ordr,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,
                                    {(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,wkg_ctgry_id = null" : "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = @wkg_ctgry_id"))}
                                    ,mod_dttm = GETDATE() WHERE pos_grp_id = @pos_grp_id AND slide_srl = @slide_srl;";

                                }
                                else
                                {

                                    // link type page
                                    query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@bg_img,(select sld_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       UPDATE wkg_pos_grp_slide_dtls SET img_srl = (SELECT MAX(img_srl) FROM wkg_img_dtls),sort_ordr = @sort_ordr,
                                       act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd,
                                       {(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,wkg_ctgry_id = null" : "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = @wkg_ctgry_id"))}
                                       ,mod_dttm = GETDATE() WHERE pos_grp_id = @pos_grp_id AND slide_srl = @slide_srl;
                                       select sld_img_dir from wkg_cntrl_param_mast;";

                                }
                            }
                            else
                            {
                                // link type page
                                query = $@"UPDATE wkg_pos_grp_slide_dtls SET sort_ordr = @sort_ordr,act_inact_ind = @act_inact_ind,
                                    mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE(),
                                    {(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,wkg_ctgry_id = null" : "form_id =  @form_id,supp_map_id = null,prod_id = null,wkg_ctgry_id = @wkg_ctgry_id"))}
                                    WHERE pos_grp_id = @pos_grp_id AND slide_srl = @slide_srl;";
                            }
                        }
                        else
                        {
                            // insert case
                            if (input.isImageChanged)
                            {
                                // image changed
                                if (input.oldImage)
                                {
                                    query = $@"INSERT INTO wkg_pos_grp_slide_dtls (pos_grp_id, img_srl, sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm,form_id,supp_map_id,prod_id,wkg_ctgry_id)
                                               VALUES (@pos_grp_id,@img_srl, @sort_ordr,@act_inact_ind,@mod_by_usr_cd,GETDATE(),
                                               {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))});";

                                }
                                else
                                {

                                    query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                                VALUES (@bg_img,(select sld_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                                INSERT INTO wkg_pos_grp_slide_dtls (pos_grp_id, img_srl, sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm,form_id,supp_map_id,prod_id,wkg_ctgry_id)
                                                VALUES (@pos_grp_id,(SELECT MAX(img_srl) FROM wkg_img_dtls), @sort_ordr,@act_inact_ind,@mod_by_usr_cd,GETDATE(),
                                                {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))});
                                                select sld_img_dir from wkg_cntrl_param_mast;";

                                }
                            }
                            else
                            {
                                // no image uploaded

                                query = $@"INSERT INTO wkg_pos_grp_slide_dtls (pos_grp_id, sort_ordr,act_inact_ind,mod_by_usr_cd,mod_dttm,form_id,supp_map_id,prod_id,wkg_ctgry_id)
                                               VALUES (@pos_grp_id, @sort_ordr,@act_inact_ind,@mod_by_usr_cd,GETDATE(),
                                               {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))});";
                            }
                        }
                        var temp = new imageDir();
                        temp = await this.DBUtils(true).GetEntityDataAsync<imageDir>(query, dbParamters, r =>
                        {
                            return new imageDir
                            {
                                sld_img_dir = r.GetValue<string>("sld_img_dir")
                            };
                        });
                        if (input.isImageChanged && !input.oldImage)
                        {
                            if (files != null)
                            {
                                var tourser = this.GetService<IFileManagerService>();
                                var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { temp.sld_img_dir });

                            }
                        }
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
                            this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                        }
                        this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                    }
                }
            }
            return output;
        }
        public async Task<SSM012TableFields> LoadInitData3(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new SSM012TableFields();
            output.cntTxtExist = false;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@slide_srl", input.slide_srl);
                dbParamters.Add("@img_dir", input.img_dir);
                // retrives slide image data for specified slide_srl, image list for specified directory and supplier map id
                string query = @"SELECT slide_srl,pos_grp_id,sld.img_srl,imd.img_nam,form_id,sld.prod_id,sld.sort_ordr,sld.act_inact_ind,sld.supp_map_id,sld.prod_id,sld.wkg_ctgry_id,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                  REPLACE(CONVERT(VARCHAR,sld.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),sld.mod_dttm,108) AS mod_dttm 
                                  FROM wkg_pos_grp_slide_dtls sld INNER JOIN rps_usr_mast usr ON usr.Usr_id = sld.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                                  emp.emp_cd = usr.emp_cd LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                                  sld.img_srl where slide_srl = @slide_srl And pos_grp_id = @pos_grp_id;
                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;
                                  SELECT ROW_NUMBER() OVER (ORDER BY supp_map_id) AS id,supp_map_id FROM wkg_supp_config WHERE supp_map_id IN ('LTD','TUI','GT2','BG','TB');
                                  SELECT ctgry.tour_ctgry_id,lang.en_GB as tour_ctgry_nam,ctgry.act_inact_ind FROM wkg_tour_ctgry ctgry 
                                  INNER JOIN wkg_lang_data lang ON ctgry.lang_data_srl = lang.data_srl;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.img_srl = r.GetValue<int>("img_srl");
                        obj.bg_img = r.GetValue<string>("img_nam");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr");
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        obj.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj.prod_id = r.GetValue<string>("prod_id");
                        obj.wkg_ctgry_id = r.GetValue<string>("wkg_ctgry_id");
                        obj.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        obj.mod_dttm = r.GetValue<string>("mod_dttm");
                        output = obj;
                        output.cntTxtExist = true;
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");
                    }
                    output.supplierList = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj.id = r.GetValue<string>("id");
                        output.supplierList.Add(obj);
                    }
                    output.TourCategoryList = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        output.TourCategoryList.Add(obj);
                    }
                }
                output.LinkTypeSC = StaticData.SSM012SC.LinkType;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataSec2Async(SessionInfo sessionInfo, SSM012TableFields input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            using (var dbService = this.GetDBService(true))
            {
                using (var dbTran = dbService.BeginTransaction())
                {
                    try
                    {
                        var dbParamters = new DBParameters();
                        dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                        dbParamters.Add("@data_srl", input.data_srl);
                        dbParamters.Add("@img_srl", input.img_srl);
                        dbParamters.Add("@todo_srl", input.todo_srl);
                        dbParamters.Add("@todo_bg_clr", input.todo_bg_clr);
                        dbParamters.Add("@todo_grdnt_clr", input.todo_grdnt_clr);
                        dbParamters.Add("@todo_img", input.todo_img);
                        dbParamters.Add("@sort_ordr", input.sort_ordr);
                        dbParamters.Add("@form_id", input.form_id);
                        dbParamters.Add("@supp_map_id", input.supp_map_id);
                        dbParamters.Add("@prod_id", input.prod_id);
                        dbParamters.Add("@wkg_ctgry_id", input.wkg_ctgry_id);
                        dbParamters.Add("@act_inact_ind", input.act_inact_ind);
                        dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                        dbParamters.Add("@aval_typ_data_srl", input.aval_typ_data_srl);
                        dbParamters.Add("@sec_typ", input.sec_typ);
                        dbParamters.Add("@tot_aval_txt", input.tot_aval_txt);
                        string query = "";
                        if (input.mode == "UPDATE")
                        {
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    query = $@"UPDATE wkg_pos_grp_todo_dtls SET data_srl = @data_srl, todo_bg_clr = @todo_bg_clr, todo_grdnt_clr = @todo_grdnt_clr, img_srl = @img_srl,aval_typ_data_srl = @aval_typ_data_srl,sec_typ = @sec_typ,tot_aval_txt = @tot_aval_txt,
                                       sort_ordr = @sort_ordr,{(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,tui_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,tui_ctgry_id = null" : "form_id =  @form_id,supp_map_id = null,prod_id = null,tui_ctgry_id = @wkg_ctgry_id"))}
                                       ,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = getdate()
                                       WHERE pos_grp_id = @pos_grp_id And todo_srl = @todo_srl;";
                                }
                                else
                                {
                                    query = $@"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                       VALUES (@todo_img,(select todo_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                       UPDATE wkg_pos_grp_todo_dtls SET data_srl = @data_srl, todo_bg_clr = @todo_bg_clr, todo_grdnt_clr = @todo_grdnt_clr, img_srl = (SELECT MAX(img_srl) FROM wkg_img_dtls),aval_typ_data_srl = @aval_typ_data_srl,sec_typ = @sec_typ,tot_aval_txt = @tot_aval_txt,
                                       sort_ordr = @sort_ordr,{(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,tui_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,tui_ctgry_id = null" : "form_id = @form_id,supp_map_id = null,prod_id = null,tui_ctgry_id = @wkg_ctgry_id"))}
                                       ,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = getdate()
                                       WHERE pos_grp_id = @pos_grp_id And todo_srl = @todo_srl;
                                       select todo_img_dir from wkg_cntrl_param_mast;";
                                }
                            }
                            else
                            {
                                query = @$"UPDATE wkg_pos_grp_todo_dtls SET data_srl = @data_srl, todo_bg_clr = @todo_bg_clr, todo_grdnt_clr = @todo_grdnt_clr,aval_typ_data_srl = @aval_typ_data_srl,sec_typ = @sec_typ,tot_aval_txt = @tot_aval_txt,img_srl = @img_srl,
                                   sort_ordr = @sort_ordr,{(input.linkType == "PAGE" ? "form_id = @form_id,supp_map_id = null,prod_id = null,tui_ctgry_id = null" : (input.linkType == "PRODUCT" ? "form_id = null,supp_map_id = @supp_map_id,prod_id = @prod_id,tui_ctgry_id = null" : "form_id = @form_id,supp_map_id = null,prod_id = null,tui_ctgry_id = @wkg_ctgry_id"))}
                                   ,act_inact_ind = @act_inact_ind,mod_by_usr_cd = @mod_by_usr_cd, mod_dttm = getdate()
                                   WHERE pos_grp_id = @pos_grp_id And todo_srl = @todo_srl;";
                            }
                        }
                        else
                        {
                            if (input.isImageChanged)
                            {
                                if (input.oldImage)
                                {
                                    query = @$"INSERT INTO wkg_pos_grp_todo_dtls (pos_grp_id,data_srl, todo_bg_clr, todo_grdnt_clr,img_srl,sort_ordr,form_id,supp_map_id,prod_id,tui_ctgry_id,act_inact_ind,mod_by_usr_cd,mod_dttm,aval_typ_data_srl,sec_typ,tot_aval_txt)
                                       VALUES (@pos_grp_id,@data_srl, @todo_bg_clr, @todo_grdnt_clr,@img_srl,@sort_ordr,
                                       {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))}
                                       ,@act_inact_ind,@mod_by_usr_cd,GETDATE(),@aval_typ_data_srl,@sec_typ,@tot_aval_txt);";
                                }
                                else
                                {
                                    query = @$"INSERT INTO wkg_img_dtls (img_nam, img_dir,act_inact_ind,mod_by_usr_cd,mod_dttm)
                                   VALUES (@todo_img,(select todo_img_dir from wkg_cntrl_param_mast),1,@mod_by_usr_cd,GETDATE());
                                   INSERT INTO wkg_pos_grp_todo_dtls (pos_grp_id,data_srl, todo_bg_clr, todo_grdnt_clr,img_srl,sort_ordr,form_id,supp_map_id,prod_id,tui_ctgry_id,act_inact_ind,mod_by_usr_cd,mod_dttm,aval_typ_data_srl,sec_typ,tot_aval_txt)
                                   VALUES (@pos_grp_id,@data_srl, @todo_bg_clr, @todo_grdnt_clr,(SELECT MAX(img_srl) FROM wkg_img_dtls),@sort_ordr,
                                   {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))}
                                   ,@act_inact_ind,@mod_by_usr_cd,GETDATE(),@aval_typ_data_srl,@sec_typ,@tot_aval_txt);
                                   select todo_img_dir from wkg_cntrl_param_mast;";
                                }
                            }
                            else
                            {
                                query = @$"INSERT INTO wkg_pos_grp_todo_dtls (pos_grp_id,data_srl, todo_bg_clr, todo_grdnt_clr,sort_ordr,form_id,supp_map_id,prod_id,tui_ctgry_id,act_inact_ind,mod_by_usr_cd,mod_dttm,aval_typ_data_srl,sec_typ,tot_aval_txt)
                               VALUES (@pos_grp_id,@data_srl, @todo_bg_clr, @todo_grdnt_clr,@sort_ordr,
                               {(input.linkType == "PAGE" ? "@form_id,null,null,null" : (input.linkType == "PRODUCT" ? "null,@supp_map_id,@prod_id,null" : "@form_id,null,null,@wkg_ctgry_id"))}
                               ,@act_inact_ind,@mod_by_usr_cd,GETDATE(),@aval_typ_data_srl,@sec_typ,@tot_aval_txt);";
                            }
                        }
                        var temp = new imageDir();
                        temp = await this.DBUtils(true).GetEntityDataAsync<imageDir>(query, dbParamters, r =>
                        {
                            return new imageDir
                            {
                                todo_img_dir = r.GetValue<string>("todo_img_dir")
                            };
                        });
                        if (input.isImageChanged && !input.oldImage)
                        {
                            if (files != null)
                            {
                                var tourser = this.GetService<IFileManagerService>();
                                var saverslt = await tourser.SaveFileAsync(files[0], new List<string> { temp.todo_img_dir });

                            }
                        }
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
                            this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                        }
                        this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
                    }
                }
            }
            return output;
        }
        public async Task<SSM012TableFields> LoadInitDataSec2(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new SSM012TableFields();
            output.todoExist = false;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@todo_srl", input.todo_srl);
                dbParamters.Add("@img_dir", input.img_dir);
                // retrieves todo data for specified todo_srl, todo list for select box,image list, supp_map_id list and tui category list for select box
                string query = @"select data_srl,en_GB from wkg_lang_data where data_typ_cd='TODO';
                                  SELECT todo_srl,pos_grp_id,data_srl,todo_bg_clr,todo_grdnt_clr,imd.img_srl,imd.img_nam,tod.form_id,tod.supp_map_id,tod.prod_id,tod.aval_typ_data_srl,ISNULL(tod.sec_typ,'C') AS sec_typ,tod.tot_aval_txt,
                                  tod.tui_ctgry_id,tod.sort_ordr,tod.act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                                  REPLACE(CONVERT(VARCHAR,tod.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),tod.mod_dttm,108) AS mod_dttm 
                                  FROM wkg_pos_grp_todo_dtls tod INNER JOIN rps_usr_mast usr ON usr.Usr_id = tod.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                                  emp.emp_cd = usr.emp_cd LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                                  tod.img_srl where todo_srl = @todo_srl And pos_grp_id = @pos_grp_id;
                                  SELECT STRING_AGG(img_nam, ',') AS Image_arr FROM wkg_img_dtls  where img_dir=@img_dir;
                                  SELECT ROW_NUMBER() OVER (ORDER BY supp_map_id) AS id,supp_map_id FROM wkg_supp_config WHERE supp_map_id IN ('LTD','TUI','GT2','BG','TB');
                                  SELECT ctgry.tour_ctgry_id,lang.en_GB as tour_ctgry_nam,ctgry.act_inact_ind FROM wkg_tour_ctgry ctgry 
                                  INNER JOIN wkg_lang_data lang ON ctgry.lang_data_srl = lang.data_srl;";
                List<SSM012ComboBoxes> todo = null;
                SSM012TableFields data = null;
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    todo = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.data_srl = r.GetValue<int>("data_srl");
                        obj.enGB = r.GetValue<string>("en_GB");
                        todo.Add(obj);
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        output.todoExist = true;
                        data = new SSM012TableFields();
                        data.data_srl = r.GetValue<int>("data_srl");
                        data.todo_bg_clr = r.GetValue<string>("todo_bg_clr");
                        data.todo_grdnt_clr = r.GetValue<string>("todo_grdnt_clr");
                        data.form_id = r.GetValue<string>("form_id");
                        data.supp_map_id = r.GetValue<string>("supp_map_id");
                        data.prod_id = r.GetValue<string>("prod_id");
                        data.wkg_ctgry_id = r.GetValue<string>("tui_ctgry_id");
                        data.aval_typ_data_srl = r.GetValue<int>("aval_typ_data_srl");
                        data.sec_typ = r.GetValue<string>("sec_typ");
                        data.tot_aval_txt = r.GetValue<string>("tot_aval_txt");
                        data.img_srl = r.GetValue<int>("img_srl");
                        data.todo_img = r.GetValue<string>("img_nam");
                        data.sort_ordr = r.GetValue<string>("sort_ordr");
                        data.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        data.mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd");
                        data.mod_dttm = r.GetValue<string>("mod_dttm");
                    }
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        output.ImageName = r.GetValue<string>("Image_arr");
                    }
                    output.supplierList = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.supp_map_id = r.GetValue<string>("supp_map_id");
                        obj.id = r.GetValue<string>("id");
                        output.supplierList.Add(obj);
                    }
                    output.TourCategoryList = new List<SSM012ComboBoxes>();
                    foreach (DataRow r in DS.Tables[4].Rows)
                    {
                        SSM012ComboBoxes obj = new SSM012ComboBoxes();
                        obj.tour_ctgry_id = r.GetValue<string>("tour_ctgry_id");
                        obj.tour_ctgry_nam = r.GetValue<string>("tour_ctgry_nam");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        output.TourCategoryList.Add(obj);
                    }
                }
                output.LinkTypeSC = StaticData.SSM012SC.LinkType;
                output.TypeList = StaticData.SSM012SC.TypeList;
                output.Image = StaticData.SSM012SC.Image;
                output.BackgroundColor = StaticData.SSM012SC.BackgroundColor;
                output.Button = StaticData.SSM012SC.Button;
                output.todoList = todo;
                output.data = data;

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SSM012TableFields> TodoExistSec2(SessionInfo sessionInfo, SSM012TableFields input)
        {
            SSM012TableFields output = null;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@data_srl", input.data_srl);
                // checks if the passed in data_srl exist for particular pos_grp_id
                string query = @"SELECT todo_srl,pos_grp_id,data_srl,todo_bg_clr,todo_grdnt_clr,imd.img_srl,imd.img_nam,tod.form_id,tod.supp_map_id,tod.prod_id,tod.tui_ctgry_id,tod.sort_ordr,tod.act_inact_ind,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd,
                              REPLACE(CONVERT(VARCHAR,tod.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),tod.mod_dttm,108) AS mod_dttm 
                              FROM wkg_pos_grp_todo_dtls tod INNER JOIN rps_usr_mast usr ON usr.Usr_id = tod.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                              emp.emp_cd = usr.emp_cd LEFT JOIN wkg_img_dtls imd ON imd.img_srl = 
                              tod.img_srl where data_srl = @data_srl And pos_grp_id = @pos_grp_id;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM012TableFields>(query, dbParamters, r =>
                {
                    return new SSM012TableFields
                    {
                        data_srl = r.GetValue<int>("data_srl"),
                        todo_srl = r.GetValue<int>("todo_srl"),
                        todo_bg_clr = r.GetValue<string>("todo_bg_clr"),
                        todo_grdnt_clr = r.GetValue<string>("todo_grdnt_clr"),
                        form_id = r.GetValue<string>("form_id"),
                        supp_map_id = r.GetValue<string>("supp_map_id"),
                        prod_id = r.GetValue<string>("prod_id"),
                        wkg_ctgry_id = r.GetValue<string>("tui_ctgry_id"),
                        img_srl = r.GetValue<int>("img_srl"),
                        todo_img = r.GetValue<string>("img_nam"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd"),
                        mod_dttm = r.GetValue<string>("mod_dttm"),
                    };
                });
                if (output != null)
                {
                    output.todoExist = true;
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<SSM012TableFields> GetProductList(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new SSM012TableFields();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@supp_map_id", input.supp_map_id);
                string query = "";
                // retrieves list of products for specified supp_map_id
                if (input.supp_map_id == StaticData.SupplierMapId.TUI)
                {
                    query = @"SELECT tui_prod_id [prod_id],ISNULL(lang.prod_nam,prod.tui_prod_nam) [prod_nam],act_inact_ind
                               FROM wkg_tui_prod_dtl prod
                               LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=prod.tui_prod_id AND lang.supp_map_id='TUI' AND lang.lang_cd='en-GB'
                               WHERE tui_prod_aval=1 AND prod.lang_cd = 'en-GB';";
                }
                else if (input.supp_map_id == StaticData.SupplierMapId.Bigbus)
                {
                    query = @"SELECT vntrt_prod_id [prod_id],ISNULL(lang.prod_nam,prod.vntrt_prod_nam) [prod_nam],act_inact_ind
                             FROM wkg_vntrt_prod_dtl prod
                             LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=prod.vntrt_prod_id AND lang.supp_map_id=@supp_map_id AND lang.lang_cd='en-GB'
                             WHERE vntrt_prod_aval=1 AND prod.supp_map_id = @supp_map_id;";
                }
                else if (input.supp_map_id == StaticData.SupplierMapId.ToothBus)
                {
                    query = @"SELECT vntrt_prod_id [prod_id],ISNULL(lang.prod_nam,prod.vntrt_prod_nam) [prod_nam],act_inact_ind
                             FROM wkg_vntrt_prod_dtl prod
                             LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=prod.vntrt_prod_id AND lang.supp_map_id=@supp_map_id AND lang.lang_cd='en-GB'
                             WHERE vntrt_prod_aval=1 AND prod.supp_map_id = @supp_map_id;";
                }
                else if (input.supp_map_id == StaticData.SupplierMapId.GoldenTours)
                {
                    query = @"SELECT vntrt_prod_id [prod_id],ISNULL(lang.prod_nam,prod.vntrt_prod_nam) [prod_nam],act_inact_ind
                             FROM wkg_vntrt_prod_dtl prod
                             LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=prod.vntrt_prod_id AND lang.supp_map_id=@supp_map_id AND lang.lang_cd='en-GB'
                             WHERE vntrt_prod_aval=1 AND prod.supp_map_id = @supp_map_id;";
                }
                else if (input.supp_map_id == StaticData.SupplierMapId.LondonTheatreDirect)
                {
                    query = @"SELECT ltd_prod_id [prod_id],ISNULL(lang.prod_nam,prod.ltd_evnt_nam) [prod_nam],act_inact_ind
                               FROM wkg_ltd_prod_dtl prod
                               LEFT OUTER JOIN wkg_supp_prod_grp_excptn_lang lang ON lang.prod_id=prod.ltd_prod_id AND lang.supp_map_id='LTD' AND lang.lang_cd='en-GB'
                               WHERE ltd_prod_aval=1;";
                }
                output.ProductList = await this.DBUtils(true).GetEntityDataListAsync<SSM012ComboBoxes>(query, dbParamters, r =>
                {
                    return new SSM012ComboBoxes
                    {
                        prod_id = r.GetValue<string>("prod_id"),
                        prod_nam = r.GetValue<string>("prod_nam"),
                        act_inact_ind = r.GetValue<bool>("act_inact_ind"),
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

        #region Public Methods SSM014
        public async Task<PageInfo<SSM014TableFields>> SearchDataAsyncSSM014(SessionInfo sessionInfo, SSM014SearchFields input)
        {
            var output = new PageInfo<SSM014TableFields>();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@pos_grp_id", input.pos_grp_id);
                dbParameters.Add("@loc_desc", $"%{input.loc_desc?.Trim()}%");
                dbParameters.Add("@startrow", (input.PageNo - 1) * input.PageSize + 1);
                dbParameters.Add("@endrow", input.PageNo * input.PageSize);
                // onload and search to populate the table
                string query = @"SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY pos_grp_id ) AS cnt, ppd.poplr_srl,ISNULL(ppd.loc_shrt_nam,ppd.loc_desc) loc_desc,ppd.loc_post_cd,ppd.sort_ordr, COUNT(*) OVER () AS total_count FROM 
                                  wkg_pos_grp_poplr_destn ppd WHERE (ppd.loc_desc LIKE @loc_desc OR ppd.loc_shrt_nam LIKE @loc_desc) And ppd.pos_grp_id = @pos_grp_id) AS temp 
                                  WHERE temp.cnt BETWEEN @startrow AND @endrow;";
                int tolR = 0;
                output.Items = await this.DBUtils(true).GetEntityDataListAsync<SSM014TableFields>(query, dbParameters, r =>
                {
                    tolR = r.GetValue<int>("total_count");
                    return new SSM014TableFields
                    {
                        poplr_srl = r.GetValue<string>("poplr_srl"),
                        loc_desc = r.GetValue<string>("loc_desc"),
                        loc_post_cd = r.GetValue<string>("loc_post_cd"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
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
        public async Task<SSM014TableFields> LoadDataAsyncSSM014(SessionInfo sessionInfo, SSM014TableFields input)
        {
            var output = new SSM014TableFields();
            try
            {
                var dbParameters = new DBParameters();
                dbParameters.Add("@poplr_srl", input.poplr_srl);
                // retrieves record from specified popl_srl in wkg_pos_grp_poplr_destn table
                string query = @"SELECT ppd.poplr_srl,ppd.loc_desc,ppd.loc_shrt_nam,ppd.loc_lat,ppd.loc_lon,ppd.loc_post_cd,ppd.sort_ordr,emp.emp_fname + ' ' + emp.emp_lname AS mod_by_usr_cd_final,
                                   REPLACE(CONVERT(VARCHAR,ppd.mod_dttm,106),' ','-')+' '+CONVERT(VARCHAR(5),ppd.mod_dttm,108) AS mod_dttm_final FROM 
                                   wkg_pos_grp_poplr_destn ppd INNER JOIN rps_usr_mast usr ON usr.Usr_id = ppd.mod_by_usr_cd INNER JOIN rps_emp_mast emp ON 
                                   emp.emp_cd = usr.emp_cd where poplr_srl = @poplr_srl;";
                output = await this.DBUtils(true).GetEntityDataAsync<SSM014TableFields>(query, dbParameters, r =>
                {
                    return new SSM014TableFields
                    {
                        poplr_srl = r.GetValue<string>("poplr_srl"),
                        loc_desc = r.GetValue<string>("loc_desc"),
                        loc_shrt_nam = r.GetValue<string>("loc_shrt_nam"),
                        loc_lat = r.GetValue<string>("loc_lat"),
                        loc_lon = r.GetValue<string>("loc_lon"),
                        loc_post_cd = r.GetValue<string>("loc_post_cd"),
                        sort_ordr = r.GetValue<string>("sort_ordr"),
                        mod_by_usr_cd = r.GetValue<string>("mod_by_usr_cd_final"),
                        mod_dttm = r.GetValue<string>("mod_dttm_final"),
                    };

                });

            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveDataAsyncSSM014(SessionInfo sessionInfo, SSM014TableFields input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@poplr_srl", input.poplr_srl);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                dbParamters.Add("@loc_desc", input.loc_desc);
                dbParamters.Add("@loc_shrt_nam", input.loc_shrt_nam);
                dbParamters.Add("@loc_lat", input.loc_lat);
                dbParamters.Add("@loc_lon", input.loc_lon);
                dbParamters.Add("@loc_post_cd", input.loc_post_cd);
                dbParamters.Add("@sort_ordr", input.sort_ordr);
                dbParamters.Add("@mod_by_usr_cd", input.mod_by_usr_cd);
                string query = "";
                if (input.mode == "UPDATE")
                {
                    // SSM014 update
                    query = @"UPDATE wkg_pos_grp_poplr_destn
                               SET loc_desc = @loc_desc, loc_shrt_nam = @loc_shrt_nam, loc_lat = @loc_lat, loc_lon = @loc_lon,loc_post_cd = @loc_post_cd,sort_ordr = @sort_ordr,
                               mod_by_usr_cd = @mod_by_usr_cd,mod_dttm = GETDATE()
                               WHERE poplr_srl = @poplr_srl;";
                }
                else
                {
                    // SSM014 insert
                    query = @"INSERT INTO wkg_pos_grp_poplr_destn (pos_grp_id, loc_desc, loc_shrt_nam, loc_lat,loc_lon,loc_post_cd,sort_ordr,mod_by_usr_cd,mod_dttm)
                               VALUES (@pos_grp_id,@loc_desc,@loc_shrt_nam,@loc_lat,@loc_lon,@loc_post_cd,@sort_ordr,@mod_by_usr_cd,GETDATE());";
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
        public async Task<OperationStatus> DeleteDataAsyncSSM014(SessionInfo sessionInfo, SSM014TableFields input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@poplr_srl", input.poplr_srl);
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                // delete's specified record poplr_srl from wkg_pos_grp_poplr_destn table 
                string query = "DELETE FROM wkg_pos_grp_poplr_destn WHERE poplr_srl = @poplr_srl And pos_grp_id = @pos_grp_id;";
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

        #region Public Methods Preview

        public async Task<SSM012InitLoad> LoadpreviewData(SessionInfo sessionInfo, SSM012TableFields input)
        {
            var output = new SSM012InitLoad();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@pos_grp_id", input.pos_grp_id);
                // retrieves data for rendering preview of hompage for specified pos_grp_id
                string query = @"SELECT DISTINCT hmpg_todo,hmpg_slide,hmpg_hlp,hmpg_flght,hmpg_cncl,hmpg_typ from wkg_pos_grp_mast M  WHERE pos_grp_id=@pos_grp_id;

                         SELECT DISTINCT CRS.ftp_supp_img_url + I.img_dir + '/' + I.img_nam AS fnl_path_img,H.hmpg_sctn_cd,L.en_GB AS head_data,C.en_GB AS cptn_data,cptn_bg_clr,I.img_nam,I.img_dir,form_id,G.prod_id,ISNULL(G.sort_ordr,9999) AS sort_ordr,CRS.ftp_supp_img_url + I.img_dir + '/' + J.img_nam AS head_img_url,J.img_nam AS head_img_nam,G.act_inact_ind  FROM wkg_pos_grp_hmpg_dtls G  LEFT JOIN wkg_hmpg_sctn H ON G.hmpg_sctn_cd = H.hmpg_sctn_cd LEFT JOIN wkg_lang_data L ON G.head_data_srl = L.data_srl LEFT JOIN wkg_lang_data C ON G.cptn_data_srl = C.data_srl LEFT JOIN wkg_img_dtls I ON G.img_srl = I.img_srl AND ISNULL(I.act_inact_ind,0) = 1 LEFT JOIN wkg_img_dtls J ON G.head_img_srl = J.img_srl AND ISNULL(J.act_inact_ind,0) = 1 CROSS JOIN wkg_cntrl_param_mast CRS WHERE pos_grp_id =@pos_grp_id;	

                         SELECT ftp_supp_img_url + img_dir + '/' + img_nam AS fnl_path_img,img_dir,img_nam,form_id,S.prod_id,isnull(S.sort_ordr,9999)sort_ordr from wkg_pos_grp_slide_dtls S 
                         LEFT JOIN wkg_img_dtls I ON S.img_srl=I.img_srl and isnull(I.act_inact_ind,0)=1 CROSS JOIN  wkg_cntrl_param_mast C WHERE pos_grp_id =@pos_grp_id and  S.act_inact_ind=1  ORDER BY isnull(S.sort_ordr,9999);

                         SELECT ftp_supp_img_url + img_dir + '/' + img_nam AS fnl_path_img,img_dir,img_nam,L.en_GB AS todo_nam,todo_bg_clr,todo_grdnt_clr,form_id,T.prod_id, ISNULL(T.sort_ordr, 9999) AS sort_ordr,LAN.en_GB AS aval_typ_data_srl,ISNULL(T.sec_typ, 'C') AS sec_typ,tot_aval_txt FROM wkg_pos_grp_todo_dtls T
                         LEFT JOIN wkg_lang_data LAN ON LAN.data_srl = T.aval_typ_data_srl
                         LEFT JOIN wkg_lang_data L ON T.data_srl = L.data_srl LEFT JOIN wkg_img_dtls I ON T.img_srl = I.img_srl AND ISNULL(I.act_inact_ind, 0) = 1 CROSS JOIN  wkg_cntrl_param_mast C WHERE pos_grp_id = @pos_grp_id AND T.act_inact_ind = 1 ORDER BY T.sort_ordr;";

                SSM010Object tbl1 = null;
                List<SSM012TableFields> tbl2 = null;
                List<SSM012TableFields> tbl3 = null;
                List<SSM012TableFields> tbl4 = null;

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    tbl1 = new SSM010Object();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM010Object obj = new SSM010Object();
                        obj.hmpg_todo = r.GetValue<string>("hmpg_todo");
                        obj.hmpg_slide = r.GetValue<string>("hmpg_slide");
                        obj.hmpg_hlp = r.GetValue<string>("hmpg_hlp");
                        obj.hmpg_flght = r.GetValue<string>("hmpg_flght");
                        obj.hmpg_cncl = r.GetValue<string>("hmpg_cncl");
                        obj.hmpg_typ = r.GetValue<string>("hmpg_typ");
                        tbl1 = obj;
                    }
                    var ftpService = GetService<IFileManagerService>();
                    var imagePathsTbl = new Dictionary<string, string>();
                    int j = 0;
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        string imagePath = r.GetValue<string>("fnl_path_img");
                        string imageName = r.GetValue<string>("img_nam");
                        if (!string.IsNullOrEmpty(imageName))
                        {
                            imagePathsTbl.Add(j + imageName, imagePath);
                            j++;
                        }
                    }
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        string headImagePath = r.GetValue<string>("head_img_url");
                        string headImageName = r.GetValue<string>("head_img_nam");

                        if (!string.IsNullOrEmpty(headImageName))
                        {
                            imagePathsTbl.Add(j + headImageName, headImagePath);
                            j++;
                        }
                    }
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        string imagePath = r.GetValue<string>("fnl_path_img");
                        string imageName = r.GetValue<string>("img_nam");
                        if (!string.IsNullOrEmpty(imageName))
                        {
                            imagePathsTbl.Add(j + imageName, imagePath);
                            j++;
                        }
                    }
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        string imagePath = r.GetValue<string>("fnl_path_img");
                        string imageName = r.GetValue<string>("img_nam");
                        if (!string.IsNullOrEmpty(imageName))
                        {
                            imagePathsTbl.Add(j + imageName, imagePath);
                            j++;
                        }
                    }

                    var tasksTbl = imagePathsTbl.Select(kvp => ftpService.ReadFileAsync(kvp.Value, kvp.Key));
                    var resultsTbl = await Task.WhenAll(tasksTbl);

                    tbl2 = new List<SSM012TableFields>();
                    int i = 0;
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.hmpg_sctn_cd = r.GetValue<string>("hmpg_sctn_cd");
                        obj.head_data = r.GetValue<string>("head_data");
                        obj.cptn_data = r.GetValue<string>("cptn_data");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr");
                        obj.cptn_bg_clr = r.GetValue<string>("cptn_bg_clr");
                        obj.img_nam = r.GetValue<string>("img_nam");
                        obj.img_dir = r.GetValue<string>("img_dir");
                        obj.fnl_path_img = !string.IsNullOrEmpty(obj.img_nam) ? resultsTbl[i] : "";
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.prod_id = r.GetValue<string>("prod_id");
                        obj.head_img_nam = r.GetValue<string>("head_img_nam");
                        obj.act_inact_ind = r.GetValue<bool>("act_inact_ind");
                        tbl2.Add(obj);
                        i = !string.IsNullOrEmpty(obj.img_nam) ? i + 1 : i;
                    }
                    foreach (SSM012TableFields obj in tbl2)
                    {
                        obj.head_img_srl = !string.IsNullOrEmpty(obj.head_img_nam) ? resultsTbl[i] : "";
                        i = !string.IsNullOrEmpty(obj.head_img_nam) ? i + 1 : i;
                    }
                    tbl3 = new List<SSM012TableFields>();
                    foreach (DataRow r in DS.Tables[2].Rows)
                    {
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.img_dir = r.GetValue<string>("img_dir");
                        obj.img_nam = r.GetValue<string>("img_nam");
                        obj.fnl_path_img = !string.IsNullOrEmpty(obj.img_nam) ? resultsTbl[i] : "";
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr");
                        obj.prod_id = r.GetValue<string>("prod_id");
                        tbl3.Add(obj);
                        i = !string.IsNullOrEmpty(obj.img_nam) ? i + 1 : i;
                    }
                    tbl4 = new List<SSM012TableFields>();
                    foreach (DataRow r in DS.Tables[3].Rows)
                    {
                        SSM012TableFields obj = new SSM012TableFields();
                        obj.img_dir = r.GetValue<string>("img_dir");
                        obj.img_nam = r.GetValue<string>("img_nam");
                        obj.fnl_path_img = !string.IsNullOrEmpty(obj.img_nam) ? resultsTbl[i] : "";
                        obj.todo_nam = r.GetValue<string>("todo_nam");
                        obj.sort_ordr = r.GetValue<string>("sort_ordr") == null ? null : r.GetValue<string>("sort_ordr");
                        obj.prod_id = r.GetValue<string>("prod_id");
                        obj.todo_bg_clr = r.GetValue<string>("todo_bg_clr");
                        obj.todo_grdnt_clr = r.GetValue<string>("todo_grdnt_clr");
                        obj.form_id = r.GetValue<string>("form_id");
                        obj.aval_typ_data = r.GetValue<string>("aval_typ_data_srl");
                        obj.sec_typ = r.GetValue<string>("sec_typ");
                        obj.tot_aval_txt = r.GetValue<string>("tot_aval_txt");
                        tbl4.Add(obj);
                        i = !string.IsNullOrEmpty(obj.img_nam) ? i + 1 : i;
                    }
                    output.Grpmastinfo = tbl1;
                    output.Homepage = tbl2;
                    output.Slide = tbl3;
                    output.Todo = tbl4;
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

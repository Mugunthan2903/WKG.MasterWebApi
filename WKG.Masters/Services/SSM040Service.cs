using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
    internal class SSM040Service : WKLServiceManger, ISSM040Service
    {
        #region Constructor
        public SSM040Service(IServiceProvider serviceProvider, ILogger<SSM040Service> logger)
            : base(serviceProvider, logger)
        {
        }
        #endregion

        #region Public Methods SSM040
        public async Task<SSM040Object> GetComboSearchAsync(SessionInfo sessionInfo, SSM040Object input)
        {
            var output = new SSM040Object();
            try
            {
                List<SSM040Srchcmbo> Srccmbo = null;
                List<CarriageTypesList> CarriageTypesList = null;
                var dbParamters = new DBParameters();
                dbParamters.Add("@lang_cd", StaticData.Common.DefaultLangCode);
                string query = "";
                //SSM040 onload.retrives records for combo box
                query = @$"select data_typ_cd,data_typ_nam,allw_data_add,multln_data,html_data,data_grp_cd from wkg_lang_data_typ_mast;

                           SELECT crrg_id,crrg_nam FROM wkg_dstrbsn_carriage_dtls WHERE lang_cd = @lang_cd;";
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    Srccmbo = new List<SSM040Srchcmbo>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM040Srchcmbo Tabone = new SSM040Srchcmbo();
                        Tabone.data_typ_cd = r.GetValue<string>("data_typ_cd");
                        Tabone.data_typ_nam = r.GetValue<string>("data_typ_nam");
                        Tabone.allw_data_add = r.GetValue<bool>("allw_data_add");
                        Tabone.multln_data = r.GetValue<bool>("multln_data");
                        Tabone.html_data = r.GetValue<bool>("html_data");
                        Tabone.data_grp_cd = r.GetValue<string>("data_grp_cd");

                        Srccmbo.Add(Tabone);
                    }
                    CarriageTypesList = new List<CarriageTypesList>();
                    foreach (DataRow r in DS.Tables[1].Rows)
                    {
                        CarriageTypesList obj1 = new CarriageTypesList();
                        obj1.crrg_id = r.GetValue<string>("crrg_id");
                        obj1.crrg_nam = r.GetValue<string>("crrg_nam");

                        CarriageTypesList.Add(obj1);
                    }
                }
                output.Srchcmbrslt = Srccmbo;
                output.CarriageTypesList = CarriageTypesList;
                output.GroupList = StaticData.SSM040SC.Group_List;
            }

            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;

        }
        public async Task<string> GetSearchrecordAsync(SessionInfo sessionInfo, SSM040Object input)
        {
            var output = string.Empty;
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@data_typ_cd", input.data_typ_cd);
                dbParamters.Add("@crrg_id", input.crrg_id);
                string query = "";
                if (input.data_typ_cd == "Lbl" || input.data_typ_cd =="HTML" || input.data_typ_cd == "Msg" || input.data_typ_cd == "Info")
                {   //SSM040 search for "HMPG" and "TODO"
                    query = $"select * from wkg_lang_data_mast where data_typ_cd =@data_typ_cd;";
                }
                else
                {   //SSM040 search for other than "HMPG" and "TODO"
                    if (input.html_data)
                    {
                        query = $"SELECT * FROM wkg_lang_data_html WHERE data_typ_cd =@data_typ_cd;";
                    }
                    else if (input.crrg_id == null)
                    {
                        query = $"select * from wkg_lang_data where data_typ_cd =@data_typ_cd;";
                    }
                    else
                    {
                        if (input.data_typ_cd == "DSTRBSNDIF")
                        {
                            query = @$"SELECT * FROM wkg_lang_data where data_typ_cd = @data_typ_cd AND data_srl IN (SELECT diffrt_nam_srl 
                                   FROM wkg_dstrbsn_carriage_diff_dtls WHERE crrg_id = @crrg_id);";
                        }
                        else if (input.data_typ_cd == "DSTRBSNDES")
                        {
                            query = @$"SELECT * FROM wkg_lang_data where data_typ_cd = @data_typ_cd AND data_srl IN (SELECT diffrt_desc_srl 
                                   FROM wkg_dstrbsn_carriage_diff_dtls WHERE crrg_id = @crrg_id);";
                        }
                        else if (input.data_typ_cd == "DSTRBSNFCL")
                        {
                            query = @$"SELECT * FROM wkg_lang_data where data_typ_cd = @data_typ_cd AND data_srl IN (SELECT fclty_nam_srl 
                                   FROM wkg_dstrbsn_carriage_fclty_dtls WHERE crrg_id = @crrg_id);";
                        }
                        else if (input.data_typ_cd == "DSTRBSNFCD")
                        {
                            query = @$"SELECT * FROM wkg_lang_data where data_typ_cd = @data_typ_cd AND data_srl IN (SELECT fclty_desc_srl 
                                   FROM wkg_dstrbsn_carriage_fclty_dtls WHERE crrg_id = @crrg_id);";
                        }
                    }
                }
                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParamters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    output = JsonConvert.SerializeObject(DS, Formatting.Indented);

                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }

            return output;

        }

        public async Task<OperationStatus> SaveDataAsync(SessionInfo sessionInfo, SSM040Object input)
        {
            var output = new OperationStatus();
            var dbParamters = new DBParameters();
            try
            {
                using (var dbService = this.GetDBService(true))
                {
                    using (var dbTran = dbService.BeginTransaction())
                    {
                        foreach (var dynamicArray in input.DynamicValues)
                        {
                            StringBuilder queryBuilder = new StringBuilder();
                            string dataSrlValue = null;
                            string dynamicArrayString = dynamicArray.ToString();
                            JObject keyValuePairs = JObject.Parse(dynamicArrayString);
                            if (keyValuePairs.ContainsKey("data_srl") && !string.IsNullOrEmpty(keyValuePairs["data_srl"].ToString()))
                            {
                                if (keyValuePairs.ContainsKey("data_typ_cd"))
                                {
                                    
                                    if (keyValuePairs["data_typ_cd"].ToString() == "Lbl" || keyValuePairs["data_typ_cd"].ToString() == "HTML" || keyValuePairs["data_typ_cd"].ToString() == "Msg" || keyValuePairs["data_typ_cd"].ToString() == "Info")
                                    {   //SSM040 Update to wkg_lang_data
                                        queryBuilder.Append("UPDATE wkg_lang_data_mast SET ");
                                    }
                                    else if(input.html_data)
                                    {
                                        queryBuilder.Append("UPDATE wkg_lang_data_html SET ");
                                    }
                                    else
                                    {    //SSM040 Update to wkg_lang_data_mast
                                        queryBuilder.Append("UPDATE wkg_lang_data SET ");
                                    }

                                }
                                int i = 1;
                                foreach (var pair in keyValuePairs)
                                {
                                    if (pair.Key == "data_srl")
                                    {

                                        dataSrlValue = pair.Value.ToString();
                                    }
                                    else if (pair.Key != "mod_by_usr_cd" && pair.Key != "mod_dttm")
                                    {
                                        dbParamters.Add($"@{pair.Key}{i}", pair.Value.ToString());
                                        queryBuilder.Append($"{pair.Key} = @{pair.Key}{i}, ");
                                        //queryBuilder.Append($"{pair.Key} = '{pair.Value.ToString().Replace("'","''")}', ");
                                    }
                                    ++i;
                                }
                                dbParamters.Add($"@mod_by_usr_cd", input.mod_by_usr_cd);
                                queryBuilder.Append($"mod_by_usr_cd = @mod_by_usr_cd, ");
                                queryBuilder.Append("mod_dttm = getdate() ");
                                if (!string.IsNullOrEmpty(dataSrlValue))
                                {
                                    dbParamters.Add($"@data_srl", dataSrlValue);
                                    queryBuilder.Append($"WHERE data_srl = @data_srl;");
                                }
                                else
                                {
                                    throw new Exception("data_srl value not found in dynamic columns.");
                                }
                            }
                            else
                            {
                                if (keyValuePairs.ContainsKey("data_typ_cd"))
                                {
                                    
                                    if (keyValuePairs["data_typ_cd"].ToString() == "Lbl" || keyValuePairs["data_typ_cd"].ToString() == "HTML" || keyValuePairs["data_typ_cd"].ToString() == "Msg" || keyValuePairs["data_typ_cd"].ToString() == "Info")
                                    {   //SSM040 Insert to wkg_lang_data
                                        queryBuilder.Append("INSERT INTO wkg_lang_data_mast (");
                                    }
                                    else if (input.html_data)
                                    {
                                        queryBuilder.Append("INSERT INTO wkg_lang_data_html (");
                                    }
                                    else
                                    {   //SSM040 Insert to wkg_lang_data_mast
                                        queryBuilder.Append("INSERT INTO wkg_lang_data (");
                                    }
                                }
                                foreach (var pair in keyValuePairs)
                                {
                                    if (pair.Key != "data_srl")
                                    {
                                        queryBuilder.Append($"{pair.Key}, ");
                                    }
                                }
                                queryBuilder.Append("mod_by_usr_cd, mod_dttm) VALUES (");
                                int i = 1;
                                foreach (var pair in keyValuePairs)
                                {
                                    if (pair.Key != "data_srl")
                                    {
                                        dbParamters.Add($"@pairvalue{i}", pair.Value.ToString());
                                        queryBuilder.Append($"@pairvalue{i}, ");
                                    }
                                    i++;
                                }
                                dbParamters.Add($"@mod_by_usr_cd", input.mod_by_usr_cd);
                                queryBuilder.Append($"@mod_by_usr_cd, getdate());");
                            }
                            string query = queryBuilder.ToString();
                            try
                            {
                                await dbService.ExecuteSqlCommandAsync(query, dbParamters);
                                dbParamters = new DBParameters();
                            }
                            catch (Exception ex)
                            {
                                this.Logger.LogError(ex, $"Failed to save data.");
                                throw;
                            }
                        }
                        dbTran.Commit();
                        output.IsSuccess = true;
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

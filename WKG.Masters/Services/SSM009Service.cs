using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using WKL.Data;

namespace WKG.Masters.Services
{
    public class SSM009Service : WKLServiceManger, ISSM009Service
    {

        #region Constructor
        public SSM009Service(IServiceProvider serviceProvider, ILogger<SSM005Service> logger) : base(serviceProvider, logger) { }
        #endregion

        #region Public Methods SSM009
        public async Task<List<SSM020Overrides>>SSM009OnloadImageData(SessionInfo sessionInfo, SSM020Overrides input)
        {
            var output = new List<SSM020Overrides>();
            try
            {
                List<SSM020Overrides> GetObjImg = null;
                var dbParameters = new DBParameters();
                dbParameters.Add("@img_dir", input.img_dir);
                dbParameters.Add("@prod_id", input.prod_id);
                dbParameters.Add("@supp_map_id", input.supp_map_id);
                dbParameters.Add("@lp_prod_typ", input.lp_prod_typ);
                //SSM009 onload.retrives image details from the wkg_img_dtls for specified prod_id and supp_map_id
                string query = @"SELECT CONCAT((SELECT ftp_supp_img_url FROM wkg_cntrl_param_mast), 
                                  LOWER(img.img_dir), '/', img.img_nam) AS img_url,img_srl,img_nam,img_dir,is_video,mnl_upld
                                  FROM wkg_img_dtls img WHERE img_dir = @img_dir AND 
                                  (prod_id = @prod_id OR COALESCE(prod_id, '') = '') AND 
                                  (supp_map_id = @supp_map_id OR COALESCE(supp_map_id, '') = '') AND 
                                  (lp_prod_typ = @lp_prod_typ OR COALESCE(lp_prod_typ, '') = '') 
                                  ORDER BY ISNULL(sort_ordr, '');";

                DataSet DS = await this.DBUtils(true).GetDataSetAsync(query, dbParameters);
                if (DS != null && DS.Tables.Count > 0)
                {
                    GetObjImg = new List<SSM020Overrides>();
                    foreach (DataRow r in DS.Tables[0].Rows)
                    {
                        SSM020Overrides ImgObj = new SSM020Overrides();
                        ImgObj.img_nam = r.GetValue<string>("img_nam");
                        ImgObj.img_srl = r.GetValue<string>("img_srl");
                        ImgObj.img_dir = r.GetValue<string>("img_dir");
                        ImgObj.img_url = r.GetValue<string>("img_url");
                        ImgObj.img_Ftp_url = null;
                        ImgObj.is_video = r.GetValue<bool>("is_video");
                        ImgObj.mnl_upld = r.GetValue<bool>("mnl_upld");

                        GetObjImg.Add(ImgObj);

                    }
                }
                output = GetObjImg;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }

        public async Task<string> SSM009DownloadFileAsync(SessionInfo sessionInfo, SSM020Overrides input)
        {
            string result = "";
            try
            {
                var ftpService = GetService<IFileManagerService>();
                result = await ftpService.ReadFileAsync(input.img_Ftp_url, input.img_nam);
                return result;
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return result;
        }
        #endregion
    }

}

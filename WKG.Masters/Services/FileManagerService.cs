using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using Microsoft.AspNetCore.StaticFiles;
using System.Net;
//using System.Net.Http;

namespace WKG.Masters.Services
{
    public class FileManagerService: IFileManagerService
    {
        #region Elements

        IOptions<AppSettings> _appSetting = null;
        private ILogger<FileManagerService> _logger;
        private readonly FileExtensionContentTypeProvider _contentTypeProvider;
        IHttpClientFactory _httpClientFactory = null;

        #endregion

        #region Constructor

        //IOptions<AppSetting> applicationSettings,
        public FileManagerService(IOptions<AppSettings> applicationSettings, IHttpClientFactory httpClientFactory, ILogger<FileManagerService> logger)
        {
            this._appSetting = applicationSettings;
            this._contentTypeProvider = new FileExtensionContentTypeProvider();
            this._logger = logger;
            this._httpClientFactory = httpClientFactory;
        }

        #endregion

        #region Public Metthods
        public async Task<string> SaveFileAsync(List<IFormFile> lstfile, List<string> folders = null )
        {
            string saveFileName = "";
            string saveFileName1 = "";
            try
            {
                //string fileExtension = Path.GetExtension(file.FileName);
                //if (string.IsNullOrWhiteSpace(fileExtension))
                //    fileExtension = this.GetFileExtension(file.ContentType);

                //saveFileName1 = $"{Guid.NewGuid().ToString()}{fileExtension}";

                foreach (IFormFile file in lstfile)
                {

                    this._logger.LogInformation($"file name : {file.FileName}");

                    var fils = new List<string>();
                    fils.Add(_appSetting.Value.ImageSavePath);
                    if (folders?.Count > 0)
                        fils.AddRange(folders);
                    fils.Add(file.FileName);

                    string filePath = System.IO.Path.Combine(fils.ToArray());
                    this._logger.LogInformation($"filePath : {filePath}");
                    byte[] fileBytes = null;
                    using var fileStream1 = file.OpenReadStream();
                    fileBytes = new byte[file.Length];
                    fileStream1.Read(fileBytes, 0, (int)file.Length);
                    this._logger.LogInformation($"fileStreamcompleted :fileStreamcompleted");
                    FtpWebRequest request = (FtpWebRequest)WebRequest.Create(filePath);
                    request.Method = WebRequestMethods.Ftp.UploadFile;
                    request.Credentials = new NetworkCredential(_appSetting.Value.ImageUid, Base64Decode(_appSetting.Value.ImagePwd));
                    request.ContentLength = fileBytes.Length;
                    request.UsePassive = true;
                    request.UseBinary = true;
                    request.ServicePoint.ConnectionLimit = fileBytes.Length;
                    request.EnableSsl = false;
                    using (Stream requestStream = request.GetRequestStream())
                    {
                        requestStream.Write(fileBytes, 0, fileBytes.Length);
                        requestStream.Close();
                    }
                    FtpWebResponse response = (FtpWebResponse)request.GetResponse();
                    response.Close();


                    //using (Stream fileStream = new FileStream(filePath, FileMode.Create))
                    //{
                    //    await file.CopyToAsync(fileStream);
                    //}

                    this._logger.LogInformation($"file name : {file.FileName}");

                    //if (string.IsNullOrWhiteSpace(saveFileName))
                    //    saveFileName1 = "";
                }

            }
            catch (Exception ex)
            {
                saveFileName = "";
                this._logger.LogError(ex, nameof(SaveFileAsync));
            }
            return saveFileName1;
        }
        public async Task<string> SaveFileAsync(IFormFile file, List<string> folders = null)
        {
            string saveFileName = "";
            string saveFileName1 = "";
            try
            {
                //string fileExtension = Path.GetExtension(file.FileName);
                //if (string.IsNullOrWhiteSpace(fileExtension))
                //    fileExtension = this.GetFileExtension(file.ContentType);

                //saveFileName1 = $"{Guid.NewGuid().ToString()}{fileExtension}";

                this._logger.LogInformation($"file name : {file.FileName}");

                var fils = new List<string>();
                fils.Add(_appSetting.Value.ImageSavePath);
                if (folders?.Count > 0)
                    fils.AddRange(folders);
                fils.Add(file.FileName);

                string filePath = System.IO.Path.Combine(fils.ToArray());
                this._logger.LogInformation($"filePath : {filePath}");
                byte[] fileBytes = null;
                using var fileStream1 = file.OpenReadStream();
                fileBytes = new byte[file.Length];
                fileStream1.Read(fileBytes, 0, (int)file.Length);
                this._logger.LogInformation($"fileStreamcompleted :fileStreamcompleted");
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(filePath);
                request.Method = WebRequestMethods.Ftp.UploadFile;
                request.Credentials = new NetworkCredential(_appSetting.Value.ImageUid, Base64Decode(_appSetting.Value.ImagePwd));
                request.ContentLength = fileBytes.Length;
                request.UsePassive = true;
                request.UseBinary = true;
                request.ServicePoint.ConnectionLimit = fileBytes.Length;
                request.EnableSsl = false;
                using (Stream requestStream = await request.GetRequestStreamAsync())
                {
                    requestStream.Write(fileBytes, 0, fileBytes.Length);
                    requestStream.Close();
                }
                FtpWebResponse response = (FtpWebResponse) await request.GetResponseAsync();
                response.Close();


                //using (Stream fileStream = new FileStream(filePath, FileMode.Create))
                //{
                //    await file.CopyToAsync(fileStream);
                //}

                this._logger.LogInformation($"file name : {file.FileName}");

                //if (string.IsNullOrWhiteSpace(saveFileName))
                //    saveFileName1 = "";

            }
            catch (Exception ex)
            {
                saveFileName = "";
                this._logger.LogError(ex, nameof(SaveFileAsync));
            }
            return saveFileName1;
        }
        public async Task<string> SaveFileAsync(byte[] filedata, string fileExtension, List<string> folders = null)
        {
            string saveFileName = "";
            try
            {
                this._logger.LogInformation("File init");
                saveFileName = $"{Guid.NewGuid().ToString()}{fileExtension}";

                string filePath = "";   //System.IO.Path.Combine(this._appSetting.Value?.FileFolder, folders, saveFileName);
                await System.IO.File.WriteAllBytesAsync(filePath, filedata);

                this._logger.LogInformation($"file name : {saveFileName}");
            }
            catch (Exception ex)
            {
                saveFileName = "";
                this._logger.LogError(ex, nameof(SaveFileAsync));
            }
            return saveFileName;
        }
        public async Task<MemoryStream> GetFileStreamAsync(string fileName, List<string> folders = null)
        {
            try
            {
                string file = "";  // Path.Combine(this._appSetting.Value?.FileFolder, fileName);
                if (System.IO.File.Exists(file))
                {
                    var memory = new MemoryStream();
                    using (var stream = new System.IO.FileStream(file, FileMode.Open))
                    {
                        await stream.CopyToAsync(memory);
                    }
                    return memory;
                }
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, nameof(GetFileStreamAsync));
            }
            return null;
        }
        public string GetMimeContentType(string fileName)
        {
            string contentType;
            if (!_contentTypeProvider.TryGetContentType(fileName, out contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }

        public async Task<string> ReadFileAsync(string fullUrl, string filename)
        {
            try
            {
                FtpWebRequest downloadRequest = (FtpWebRequest)WebRequest.Create(fullUrl);
                downloadRequest.Method = WebRequestMethods.Ftp.DownloadFile;
                downloadRequest.Credentials = new NetworkCredential(_appSetting.Value.ImageUid, Base64Decode(_appSetting.Value.ImagePwd));

                using (FtpWebResponse response = (FtpWebResponse)await downloadRequest.GetResponseAsync())
                using (Stream responseStream = response.GetResponseStream())
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    await responseStream.CopyToAsync(memoryStream);
                    byte[] fileData = memoryStream.ToArray();

                    string base64Data = Convert.ToBase64String(fileData);
                    return $"data:{(GetMimeType(filename))};base64,{base64Data}";
                }
            }
            catch (WebException ex)
            {
                if (ex.Response is FtpWebResponse ftpResponse)
                {
                    if (ftpResponse.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                    {
                        System.IO.File.AppendAllText("errorlog.txt", $"{$"Flie does not exist for Deletion {fullUrl} " + ex.ToString() + Environment.NewLine}");
                    }
                    else
                    {
                        System.IO.File.AppendAllText("errorlog.txt", $"{"Flight Details FTP Server failed to respond " + ex.ToString() + Environment.NewLine}");
                    }
                }
                return "";
            }
        }

        #endregion

        #region Private Metthods

        private string GetFileExtension(string contentType)
        {
            if (contentType.Contains("mp3"))
            {
                //return ".mpeg";
                contentType = "audio/mpeg";
            }
            var item = this._contentTypeProvider.Mappings.FirstOrDefault(f => string.Compare(f.Value, contentType, true) == 0);
            return item.Key;

        }

        private static string GetMimeType(string fileName)
        {
            var extension = System.IO.Path.GetExtension(fileName).ToLowerInvariant();

            switch (extension)
            {
                case ".png":
                    return "image/png";
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".gif":
                    return "image/gif";
                case ".bmp":
                    return "image/bmp";
                case ".svg":
                    return "image/svg+xml";
                case ".mp4":
                    return "video/mp4";
                case ".avi":
                    return "video/avi";
                case ".wmv":
                    return "video/x-msvideo";
                case ".flv":
                    return "video/x-flv";
                case ".mov":
                    return "video/quicktime";
                default:
                    return "application/octet-stream";
            }
        }

        private string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

        #endregion
    }
}

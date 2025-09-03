using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace WKG.Masters.Services.Interfaces
{
    public interface IFileManagerService
    {
        Task<string> SaveFileAsync(List<IFormFile> file, List<string> folders = null );
        Task<string> SaveFileAsync(IFormFile file, List<string> folders = null);
        Task<string> SaveFileAsync(byte[] filedata, string fileExtension, List<string> folders = null);
        Task<MemoryStream> GetFileStreamAsync(string fileName, List<string> folders = null);
        Task<string> ReadFileAsync(string fullUrl, string filename);
    }
}

using WKG.Transaction.Core.Services;
using Microsoft.Extensions.Logging;
using WKL.Data;

namespace WKG.Masters
{
    public class WKLServiceManger : ServiceMangerFactoryObject
    {
        #region Constructor
        public WKLServiceManger(IServiceProvider serviceProvider, ILogger<WKLServiceManger> logger) : base(serviceProvider, logger)
        { }
        #endregion

        #region Methods
        public DateTime GetSystemDate()
        {
            return DBUtils(true).GetEntityData($"select GETDATE();", null, r => r.GetValue<DateTime>(0));
        }
        public async Task<DateTime> GetSystemDateAsync()
        {
            return await DBUtils(true).GetEntityDataAsync($"select GETDATE();", null, r => r.GetValue<DateTime>(0));
        }

        #endregion
    }
}

using WKG.MasterWebApi.Core.Services.Interfaces;
using WKG.MasterWebApi.Model;
using WKL.Data.Sqlite.Domain;
using WKL.Data.Sqlite.Extensions;
using WKL.Data.Sqlite.Interfaces;
using WKL.Web.Core.Interfaces;

namespace WKG.MasterWebApi.Core.Services
{
    public class TokenStoreService : ITokenStoreService, IStartupTask
    {
        string TableName = "UserSessions";

        readonly ISqliteDBService _dbService = null;
        readonly ILogger<TokenStoreService> _logger = null;

        #region Properties 

        public int Order => 0;

        #endregion

        #region Constructor

        public TokenStoreService(ISqliteDBService sqliteDBService, ILogger<TokenStoreService> logger)
        {
            this._dbService = sqliteDBService;
            this._logger = logger;
        }

        #endregion

        #region Public Methods

        public async Task ExecuteAsync()
        {
            this._logger.LogInformation("Table Init....");
            try
            {
                string query = @$"CREATE TABLE IF NOT EXISTS {this.TableName} (ssn_id VARCHAR(50) NOT NULL PRIMARY KEY, usr_cd VARCHAR(13) NOT NULL, mac_id VARCHAR(50) NOT NULL, crtd_dttm INTEGER NOT NULL, expry_dt INTEGER NOT NULL)";
                this._dbService.CreateTableIfNotExist(query);
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sqlite Init. Method: {nameof(ExecuteAsync)}");
            }
            await Task.CompletedTask;
        }

        //https://www.developersoapbox.com/connecting-to-a-sqlite-database-using-net-core/
        public async Task<bool> AddTokenAsync(TokenInfo tokenInfo)
        {
            bool saved = false;
            try
            {
                DateTime modifiedOn = DateTime.UtcNow;
                var parameters = new SqliteParameters();
                parameters.Add(new SqliteParameter("@crtd_dttm", this.ConvertToLong(modifiedOn)));
                parameters.Add(new SqliteParameter("@expry_dt", this.ConvertToLong(modifiedOn.AddMinutes(tokenInfo.Timeout))));
                string query = $@"INSERT INTO {this.TableName} 
                                (ssn_id, usr_cd, mac_id, crtd_dttm, expry_dt) 
                                VALUES
                                ('{tokenInfo.RefreshTokenID}', '{tokenInfo.UserID}',
                                 '{tokenInfo.MachineID}', @crtd_dttm, @expry_dt);";

                int rowCount = this._dbService.ExecuteNonQuery(query, parameters);
                saved = rowCount > 0;

                this.RemoveTokens(tokenInfo.OldRefreshTokenID);
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sqlite token adding. Method: {nameof(AddTokenAsync)}, Input: {tokenInfo?.ToJsonText()}");
            }
            return await Task.FromResult<bool>(saved);
        }

        public async Task<TokenInfo> FindUserAsync(string userID, string refreshToken)
        {
            TokenInfo result = null;
            try
            {
                DateTime modifiedOn = DateTime.UtcNow;

                var dt = this.ConvertToLong(modifiedOn);

                string query = $@"select 
                                usr_cd AS UserID, 
                                ssn_id as RefreshTokenID, 
                                expry_dt as ExpiryDate,  
                                mac_id as MachineID                           
                            from {this.TableName} 
                            where ssn_id = '{refreshToken}' 
                                and usr_cd = '{userID}';";

                result = this._dbService.GetEntity<TokenInfo>(query, null, r =>
                {
                    var expiryDate = r.ConvertTo<long>("ExpiryDate");
                    if (expiryDate > dt)
                    {
                        return new TokenInfo
                        {
                            UserID = r.GetValue<string>("UserID"),
                            RefreshTokenID = r.GetValue<string>("RefreshTokenID"),
                            MachineID = r.GetValue<string>("MachineID")
                        };
                    }
                    else
                        return null;
                });
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sqlite find token. Method: {nameof(FindUserAsync)}, Input: {new { refreshToken }.ToJsonText()}");
            }
            return await Task.FromResult<TokenInfo>(result);
        }

        public async Task<bool> IsValidTokenAsync(string userID, string refreshToken)
        {
            bool isvalid = false;
            try
            {
                DateTime modifiedOn = DateTime.UtcNow;
                var parameters = new SqliteParameters();
                var dtTime = this.ConvertToLong(modifiedOn);

                string query = @$"select 
                                    expry_dt AS ExpiryDate
                                from {this.TableName} 
                                where ssn_id = '{refreshToken}' 
                                    and usr_cd = '{userID}';";
                isvalid = this._dbService.GetEntity<bool>(query, null, r =>
                {
                    var expiryDate = r.GetValue<long>("ExpiryDate");
                    return (expiryDate > dtTime);
                });
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sqlite find valid token. Method: {nameof(IsValidTokenAsync)}, Input: {new { userID, refreshToken }.ToJsonText()}");
            }
            return await Task.FromResult<bool>(isvalid);
        }
        public async Task RevokeBearerTokensAsync(string userID, string refreshToken)
        {
            try
            {
                this.RemoveTokens(refreshToken);
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sqlite removing token. Method: {nameof(RevokeBearerTokensAsync)}, Input: {new { userID, refreshToken }.ToJsonText()}");
            }
            await Task.CompletedTask;
        }

        #endregion

        #region Private Methods

        private long ConvertToLong(DateTime dt)
        {
            //// Get the offset from current time in UTC time
            //DateTimeOffset dto = new DateTimeOffset(DateTime.UtcNow);
            //// Get the unix timestamp in seconds
            //string unixTime = dto.ToUnixTimeSeconds().ToString();
            //// Get the unix timestamp in seconds, and add the milliseconds
            //string unixTimeMilliSeconds = dto.ToUnixTimeMilliseconds()

            return dt.ToFileTime();
        }
        private bool RemoveTokens(string refreshToken)
        {
            try
            {
                DateTime modifiedOn = DateTime.UtcNow;

                var dtTime = this.ConvertToLong(modifiedOn);

                var parameters = new SqliteParameters();
                parameters.Add(new SqliteParameter("@expry_dt", dtTime));
                string query = "";
                if (!string.IsNullOrWhiteSpace(refreshToken))
                    query = $"OR (ssn_id = '{refreshToken}')";
                query = $@"delete from {this.TableName} where (expry_dt < @expry_dt) {query};";
                this._dbService.ExecuteNonQuery(query, parameters);
                return true;
            }
            catch (Exception ex)
            {
                this._logger.LogError(ex, $"Sqlite removing old tokens or selected token. Method: {nameof(RemoveTokens)}, Input: {new { refreshToken }.ToJsonText()}");
            }
            return false;
        }

        #endregion
    }
}

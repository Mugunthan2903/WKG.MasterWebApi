using WKG.Masters.Model;
using WKG.Masters.Services.Interfaces;
using Microsoft.Extensions.Logging;
using WKL.Data;
using WKL.Service.Domain;
using Microsoft.AspNetCore.Http;

namespace WKG.Masters.Services
{
    public class SampleService : WKLServiceManger, ISampleService
    {
        #region Constructor

        public SampleService(IServiceProvider serviceProvider, ILogger<SampleService> logger)
            : base(serviceProvider, logger)
        {
        }

        #endregion

        #region Public Methods

        public async Task<PageInfo<BaseObject<string>>> GetPageDataAsync(SessionInfo sessionInfo, ProductObject.PageSearchInfo input)
        {
            var output = new PageInfo<BaseObject<string>>();
            try
            {
                input.PageSize = 10;
                if (input.PageNo == 0)
                    input.PageNo = 1;
                int startRow = input.PageSize * (input.PageNo - 1);
                int endRow = startRow + input.PageSize;

                output.Items = new List<BaseObject<string>>();
                for (var i = startRow; i < endRow; i++)
                {
                    output.Items.Add(new()
                    {
                        ID = i.ToString(),
                        Text = $"Product {i}"
                    });
                }
                output.TotalRecords = (input.PageNo * input.PageSize) + 1;
                output.CurrentPage = input.PageNo;
                output.SetPages(output.TotalRecords, input.PageSize);
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return await Task.FromResult<PageInfo<BaseObject<string>>>(output);
        }
        public async Task<List<BaseObject<string>>> GetSearchDataAsync(SessionInfo sessionInfo, ProductObject.SimpleSearchInput input)
        {
            var output = new List<BaseObject<string>>();
            try
            {
                for (var i = 0; i < 15; i++)
                {
                    output.Add(new()
                    {
                        ID = i.ToString(),
                        Text = $"{input.Text} {i}"
                    });
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return await Task.FromResult<List<BaseObject<string>>>(output);
        }
        public async Task<List<ProductObject.Product>> GetProductsAsync(SessionInfo sessionInfo, ProductObject.SearchInput input)
        {
            var output = new List<ProductObject.Product>();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prdt_nam", $"{input.Name}%");
                string query = $"SELECT prdt_id AS ID, prdt_nam AS Text FROM prdt_mast WHERE prdt_nam LIKE @prdt_nam;";

                output = await this.DBUtils(true).GetEntityDataListAsync<ProductObject.Product>(query, dbParamters, r =>
                {
                    return new ProductObject.Product
                    {
                        ID = r.GetValue<string>("ID"),
                        Text = r.GetValue<string>("Text"),
                    };
                });
                /*
                 * multiple table selection
                 * query  = "select * from country; select * from city;";
                await this.DBUtils(true).GetMultipleDataListAsync<bool>(query, dbParamters, r =>
               {
                   while (r.Read())
                   {

                   }
                   if (r.NextResult())
                   {
                       while (r.Read())
                       {

                       }
                   }
               });*/
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, $"Session Info: {sessionInfo.ToJsonText()}, Input : {input.ToJsonText()}");
            }
            return output;
        }
        public async Task<OperationStatus> SaveAsync(SessionInfo sessionInfo, ProductObject.Product input)
        {
            var output = new OperationStatus();
            try
            {
                var dbParamters = new DBParameters();
                dbParamters.Add("@prdt_id", input.ID);
                dbParamters.Add("@prdt_nam", input.Text);

                string query = $"INSERT INTO prdt_mast(prdt_id, prdt_nam) VALUES(@prdt_id, @prdt_nam);";
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
                                this.Logger.LogError(ex1, $"Method: {nameof(this.SaveAsync)}. Level: 1. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
                            }
                            this.Logger.LogError(ex, $"Method: {nameof(this.SaveAsync)}. Level: 2. Session: {sessionInfo?.ToJsonText()}. Input: {input?.ToJsonText()}");
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

        public async Task<OperationStatus> SaveImageAsync(SessionInfo sessionInfo, ProductObject.Product input, List<IFormFile> files)
        {
            var output = new OperationStatus();
            try
            {
                
                if (files != null)
                {
                    var tourser = this.GetService<IFileManagerService>();
                    var  saverslt =await tourser.SaveFileAsync(files[0],new List<string> {"lp"});

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

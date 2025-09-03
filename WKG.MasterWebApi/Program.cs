using WKG.Masters.Model;
using WKG.MasterWebApi;
using WKG.MasterWebApi.Core.Services.Interfaces;
using WKG.MasterWebApi.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Serilog;
using WKL.Data;
using WKL.Data.Sqlite;
using WKL.Security;
using WKL.Security.Interfaces;
using WKG.MasterWebApi.Core.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//builder.Configuration.AddSecurityConfiguration();

var appSettingSection = builder.Configuration.GetSection("WKL");

var settings = appSettingSection.Get<AppSettings>();

builder.Services.Configure<AppSettings>(appSettingSection);
builder.Services.AddOptions();

/*Using SIgnalR*/
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Services.AddResponseCompression();

builder.Services.AddWebApiCors(builder.Configuration, AppConstants.CROS_POLICY_NAME);

builder.Services.AddHttpClient();

/*For handling Crypto Service */
builder.Services.AddScoped<ICryptoService, CryptoService>();

/*On application, initial setup*/
builder.Services.AddInitializationAsync();

/*Other Application services*/
builder.Services.AddApiServices();

builder.Services.AddFilePathConfiguration();

/*JWT Authenication*/
builder.Services.AddJwtBearer(builder.Configuration, "WKL:JwtOptions", (context) =>
{
    var tokenValidatorService = context.HttpContext.RequestServices.GetRequiredService<ITokenValidatorService>();
    return tokenValidatorService.ValidateAsync(context);
});

builder.Services.AddDBFactory(settings?.DBConfiguration);
SqlDbProviderFactories.RegisterFactory();

builder.Services.AddSqlite(settings.SqliteConnection);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.AddModelBinderProvider();
}).AddNewtonsoftJson(op =>
    {
        op.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver();
        op.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.None;
        op.SerializerSettings.TypeNameHandling = TypeNameHandling.Auto;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WKG Master Web API", Version = "v1" });
    c.CustomSchemaIds(type =>
    {
        return $"{type.FullName.Replace("+", ".")}, {type.Assembly.GetName().Name}";
        //return t.AssemblyQualifiedName;
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme {
                            Reference = new OpenApiReference {
                                Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
});

//builder.Services.ConfigureMVCSetup(false);
//Microsoft.AspNetCore.Http.Json
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.PropertyNamingPolicy = null;
    options.JsonSerializerOptions.AllowTrailingCommas = true;
    options.JsonSerializerOptions.WriteIndented = false;
});

//builder.Host.UseContentRoot(Directory.GetCurrentDirectory());
builder.Host.UseSerilog((hostingContext, loggerConfiguration) => loggerConfiguration
                .ReadFrom.Configuration(hostingContext.Configuration));
Serilog.Log.Information("Configuring web host ...");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(AppConstants.CROS_POLICY_NAME);

app.UseAuthentication();

app.UseAuthorization();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();
}
else
{
    var options = new DefaultFilesOptions();
    options.DefaultFileNames.Clear();
    options.DefaultFileNames.Add("index.html");
    app.UseDefaultFiles(options);
}

app.MapControllers();
app.MapHub<NotificationsHub>(AppConstants.SIGNALR_HUB_PATH, options => options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransports.All);

Serilog.Log.Information("Starting initialization process...");
await app.InitAsync();
app.MapFallbackToFile("/index.html");

Serilog.Log.Information("Starting web host ...");
app.Run();


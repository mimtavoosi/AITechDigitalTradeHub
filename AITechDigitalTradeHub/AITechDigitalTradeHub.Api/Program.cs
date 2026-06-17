
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.DataLayer.Services;
using AITechWebAPI.Tools;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MTPermissionCenter.AspNetCore;
using System.Text;
using System.Text.Json.Serialization;

namespace AITechDigitalTradeHub.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            var corsPolicy = builder.Configuration["cors:policy"].ToString();
            var cookiesecurity = builder.Configuration["cors:cookiesecurity"].ToString();

            var allowedOrigins = builder.Configuration.GetSection("cors:allowedOrigins").Get<List<string>>().ToArray();

            builder.Configuration.AddJsonFile("DataSetting.json", optional: true, reloadOnChange: true);

            // Add services to the container.
            var connectionString = builder.Configuration.GetConnectionString("publicdb");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("ConnectionStrings:publicdb must be configured.");
            }

            builder.Services.AddDbContext<TheAppContext>(options =>
                options.UseSqlServer(connectionString));

            var jwtSecret = builder.Configuration["Jwt:Secret"];
            if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
            {
                throw new InvalidOperationException("Jwt:Secret must be configured and at least 32 bytes long.");
            }

            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AITechDigitalTradeHub",
                        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AITechDigitalTradeHub",
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                        ClockSkew = TimeSpan.FromMinutes(1)
                    };
                });

            builder.Services.AddAuthorization();
            builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorizationPolicyProvider>();
            builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();



            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddMemoryCache();
            builder.Services.AddHttpContextAccessor();
            if (cookiesecurity == "default")
            {
                builder.Services.AddSession();
            }
            else
            {
                builder.Services.AddSession(options =>
                {
                    options.Cookie.HttpOnly = true; // ????? ????? ???? ???????
                    options.Cookie.IsEssential = true; // ????? ???? ???? ???? ?????? Session
                    options.Cookie.SameSite = SameSiteMode.None;  // ????? ????? ??????? ?? ??????????? cross-origin
                    options.Cookie.SecurePolicy = (CookieSecurePolicy)int.Parse(cookiesecurity);  // ??? HTTPS ???? ???
                });
            }


            builder.Services.AddCors(options =>
            {

                if (corsPolicy.ToLower().Contains("allowall"))
                {
                    options.AddPolicy(corsPolicy, builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader()
                               .WithExposedHeaders("Set-Cookie");

                    });
                }
                else
                {
                    options.AddPolicy(corsPolicy, builder =>
                    builder.WithOrigins(allowedOrigins) // اضافه کردن localhost و آی‌پی لوکال
                           .AllowCredentials()
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                             .WithExposedHeaders("Set-Cookie"));

                }
            });

            //if (corsSettings.useRateLimiter)
            //{
            //    ///--محدود کردن نرخ درخواست‌ها (Rate Limiting) --///
            //    builder.Services.AddRateLimiter(options =>
            //    {
            //        options.AddFixedWindowLimiter("Fixed", limiterOptions =>
            //        {
            //            limiterOptions.Window = TimeSpan.FromSeconds(10);
            //            limiterOptions.PermitLimit = 5; // تعداد درخواست‌ها در هر بازه زمانی
            //        });
            //    });
            //}


            // Add services to the container.

            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.Configure<SmsSenderOptions>(builder.Configuration.GetSection("SmsSender"));
            builder.Services.AddHttpClient<ISmsSender, FarazSmsSender>();
            builder.Services.AddScoped<IRoleRep, RoleRep>();
            builder.Services.AddScoped<IPermissionRep, PermissionRep>();
            builder.Services.AddScoped<IPermissionRoleRep, PermissionRoleRep>();
            builder.Services.AddScoped<IUserPermissionRep, UserPermissionRep>();
            builder.Services.AddScoped<ICategoryRep, CategoryRep>();
            builder.Services.AddScoped<IListingRep, ListingRep>();
            builder.Services.AddScoped<IOrderRep, OrderRep>();
            builder.Services.AddScoped<IProjectRep, ProjectRep>();
            builder.Services.AddScoped<IEducationRep, EducationRep>();
            builder.Services.AddScoped<IFinanceRep, FinanceRep>();
            builder.Services.AddScoped<ITicketRep, TicketRep>();
            builder.Services.AddScoped<ITicketMessageRep, TicketMessageRep>();
            builder.Services.AddScoped<INotificationRep, NotificationRep>();
            builder.Services.AddScoped<IReviewRep, ReviewRep>();

            var apiVersion = ToolBox.CalculateAppVersionNo();
            var apiTitle = builder.Environment.ApplicationName;

            builder.Services.AddControllers(options =>
            {
                //options.OutputFormatters.Add()
                options.ReturnHttpNotAcceptable = true;
            })
                 .AddNewtonsoftJson(options =>
                 {
                     options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                 })
                .AddXmlDataContractSerializerFormatters();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .ToDictionary(
                            x => x.Key,
                            x => x.Value!.Errors.Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage)
                                ? "مقدار وارد شده معتبر نیست"
                                : e.ErrorMessage).ToArray());

                    return new BadRequestObjectResult(new ApiErrorResponse
                    {
                        ErrorMessage = "داده‌های ارسالی معتبر نیستند",
                        TraceId = context.HttpContext.TraceIdentifier,
                        Errors = errors
                    });
                };
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = apiTitle,
                    Version = apiVersion
                });

                // Configure Swagger to use JWT authentication
                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Please enter your JWT with Bearer into the field",

                    //Reference = new OpenApiReference
                    //{
                    //    Id = JwtBearerDefaults.AuthenticationScheme,
                    //    Type = ReferenceType.SecurityScheme
                    //}
                };

                options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);


                options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = new List<string>()
                });
            });

            builder.Services.AddHealthChecks();

            builder.Services.AddAutoMapper(cfg => { /* تنظیمات سراسری اختیاری */ },
                                        typeof(Program).Assembly);

            builder.Services.AddMTPermissionCenter();

            var app = builder.Build();

            if (app.Configuration.GetValue("SeedIdentityDataOnStartup", false))
            {
                await IdentityDataSeeder.SeedAsync(app.Services);
            }


            #region Pipeline

            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            //if (app.Environment.IsDevelopment())
            //{
                app.UseSwagger();
                app.UseSwaggerUI();
            //}

            app.UseMiddleware<GlobalExceptionMiddleware>();
         
            app.MapHealthChecks("/health");



            //if (app.Environment.IsDevelopment())
            //{
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                c.SwaggerEndpoint("/swagger/v1/swagger.json", $"{apiTitle} {apiVersion}");
                c.RoutePrefix = string.Empty; // روت اصلی سایت برای Swagger
                c.InjectJavascript("/js/swagger-token.js");
            });

            //}
            app.UseHttpsRedirection();

            //app.UseParbadVirtualGateway();

            app.UseCors(corsPolicy);


            app.UseSession();

            #region HangFire

 //           app.UseHangfireDashboard("/hangfire");
 //           //app.UseHangfireServer();

 //           // 👇 اینجا دقیقاً محل ثبت Job هست
 //           RecurringJob.AddOrUpdate<JobManager>(
 //    job => job.ProcessTodayBirthdays(),
 //    "0 9 * * *",
 //    TimeZoneInfo.Local
 //);

            #endregion

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            // IMPORTANT: after authentication
            app.UseMTPermissionCenter();

            //Controller/Action/Id?
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            //app.UseParbadVirtualGateway();


#endregion Pipeline


            app.Run();
        }
    }
}

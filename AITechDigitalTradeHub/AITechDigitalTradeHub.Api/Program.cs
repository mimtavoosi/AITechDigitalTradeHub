
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.DataLayer.Services;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using System.Text.Json.Serialization;

namespace AITechDigitalTradeHub.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

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

            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

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

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

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
                    Title = "AITech Digital Trade Hub API",
                    Version = "v1"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT access token"
                });

                options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference("Bearer", document, null),
                        new List<string>()
                    }
                });
            });

            builder.Services.AddHealthChecks();

            var app = builder.Build();

            if (app.Configuration.GetValue("SeedIdentityDataOnStartup", false))
            {
                await IdentityDataSeeder.SeedAsync(app.Services);
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseMiddleware<GlobalExceptionMiddleware>();
            app.UseHttpsRedirection();
            app.UseCors("Frontend");
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();
            app.MapHealthChecks("/health");

            app.Run();
        }
    }
}

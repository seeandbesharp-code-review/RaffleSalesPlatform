using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TrickyTrayAPI.Data;
using TrickyTrayAPI.Messaging;
using TrickyTrayAPI.Repositories;
using TrickyTrayAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;

        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter 'Bearer' followed by a space and the JWT token"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});

var connectionString =
    builder.Configuration.GetConnectionString("TrickyTrayConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'TrickyTrayConnection' is missing.");

builder.Services.AddDbContext<TrickyTrayDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration =
        builder.Configuration["Redis:ConnectionString"];

    options.InstanceName = "TrickyTray:";
});

builder.Services
    .AddOptions<KafkaSettings>()
    .Bind(builder.Configuration.GetSection(KafkaSettings.SectionName))
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.BootstrapServers),
        "Kafka BootstrapServers is required.")
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.Topic),
        "Kafka Topic is required.")
    .Validate(
        settings => !string.IsNullOrWhiteSpace(settings.ClientId),
        "Kafka ClientId is required.")
    .ValidateOnStart();

builder.Services.AddSingleton<IKafkaProducer, KafkaProducer>();

builder.Services.AddScoped<IGiftRepository, GiftRepository>();
builder.Services.AddScoped<IGiftService, GiftService>();

builder.Services.AddScoped<IDonorRepository, DonorRepository>();
builder.Services.AddScoped<IDonorService, DonorService>();

builder.Services.AddScoped<IBuyerRepository, BuyerRepository>();
builder.Services.AddScoped<IBuyerService, BuyerService>();

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IOrderGiftRepository, OrderGiftRepository>();
builder.Services.AddScoped<IOrderGiftService, OrderGiftService>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<RaffleService>();

builder.Services.AddScoped<SystemStateRepository>();
builder.Services.AddScoped<SystemStateService>();

var jwtSection = builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSection.GetValue<string>("Key")
    ?? throw new InvalidOperationException(
        "JWT Key is missing in configuration.");

var jwtIssuer = jwtSection.GetValue<string>("Issuer")
    ?? throw new InvalidOperationException(
        "JWT Issuer is missing in configuration.");

var jwtAudience = jwtSection.GetValue<string>("Audience")
    ?? throw new InvalidOperationException(
        "JWT Audience is missing in configuration.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey))
            };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token =
                    context.Request.Cookies["access_token"];

                if (!string.IsNullOrWhiteSpace(token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            },

            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("Jwt");

                logger.LogError(
                    context.Exception,
                    "Authentication failed: {Message}",
                    context.Exception.Message);

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "ClientPolicy",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(
        "fixed",
        limiterOptions =>
        {
            limiterOptions.PermitLimit = 20;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder =
                QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });

    options.RejectionStatusCode =
        StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = Microsoft.AspNetCore.Http.StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        var payload = System.Text.Json.JsonSerializer.Serialize(new { error = "An unexpected error occurred." });
        await context.Response.WriteAsync(payload);
    });
});

app.UseCors("ClientPolicy");

app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers()
    .RequireRateLimiting("fixed");

app.Run();

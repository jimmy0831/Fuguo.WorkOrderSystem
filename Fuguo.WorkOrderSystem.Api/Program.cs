using Fuguo.WorkOrderSystem.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// --- 服務註冊 (Dependency Injection) ---

// 1. 設定 CORS 策略
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 2. 註冊 Controller 服務
builder.Services.AddControllers();

// 3. 註冊 Swagger/OpenAPI 服務
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. 註冊 DbContext 服務
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 5. 【新增】設定 JWT 驗證服務
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // 驗證設定
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // 值設定
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]))
        };
    });


// --- 建立 WebApplication 物件 ---
var app = builder.Build();

// --- 設定 HTTP 請求處理管線 (Middleware) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 啟用 CORS
app.UseCors("AllowAll");

// 【重要】啟用驗證與授權，順序必須在 UseCors 之後，MapControllers 之前
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
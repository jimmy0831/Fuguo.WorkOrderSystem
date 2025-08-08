using Fuguo.WorkOrderSystem.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

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

// 2. 加入 Controller 服務
builder.Services.AddControllers();

// 3. 加入 Swagger/OpenAPI 服務
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. 加入 DbContext 服務
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 5. 設定 JWT 認證服務
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // 驗證參數設定
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]))
        };
    });


// --- 建構 WebApplication 實例 ---
var app = builder.Build();

// --- 設定 HTTP 請求處理管道 (Middleware) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 啟用 CORS
app.UseCors("AllowAll");

// 設定預設起始頁面，伺服器會優先尋找 index.html
app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> { "index.html", "login.html" }
});
// 啟用靜態檔案服務 (wwwroot)
app.UseStaticFiles();

// 啟用認證和授權，必須在 UseCors 之後和 MapControllers 之前
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

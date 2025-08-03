using Fuguo.WorkOrderSystem.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. 設定 CORS 策略
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.AllowAnyOrigin()
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// 2. 註冊 Controller 服務
builder.Services.AddControllers();

// 3. 註冊 Swagger/OpenAPI 服務 (用於 API 測試介面)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. 註冊 DbContext 服務 (連接資料庫的核心)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- 建立 WebApplication 物件 ---
var app = builder.Build();

// --- 設定 HTTP 請求處理管線 (Middleware) ---
// 開發環境下，啟用 Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 強制使用 HTTPS
app.UseHttpsRedirection();

// 啟用 CORS 策略
app.UseCors(MyAllowSpecificOrigins);

// 啟用靜態檔案服務 (未來建立前端頁面時會用到)
app.UseDefaultFiles();
app.UseStaticFiles();

// 啟用授權
app.UseAuthorization();

// 將請求對應到 Controller
app.MapControllers();

// --- 執行應用程式 ---
app.Run();
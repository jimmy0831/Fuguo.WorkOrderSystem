using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;
using Fuguo.WorkOrderSystem.Api.Dtos;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        try
        {
            // 1. 根據帳號查詢使用者
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Account == loginRequest.Account);

            if (user == null)
            {
                return Unauthorized(new { message = "帳號或密碼錯誤。" });
            }

            // 2. 驗證密碼 - 使用 BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "帳號或密碼錯誤。" });
            }

            // 3. 密碼驗證成功，產生 JWT Token
            var token = GenerateJwtToken(user);

            // 4. 回傳一個包含所有需要資訊的物件
            return Ok(new
            {
                token = token,
                userId = user.UserId,
                userName = user.UserName,
                account = user.Account,
                isAdmin = user.IsAdmin
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "登入時發生錯誤", error = ex.Message });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Account),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId ?? ""),
            new Claim(ClaimTypes.Name, user.Account ?? ""),
        };

        if (string.Equals(user.IsAdmin, "Y", StringComparison.OrdinalIgnoreCase))
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }
        else
        {
            claims.Add(new Claim(ClaimTypes.Role, "User"));
        }

        // 設定 Token 過期時間為當天的 23:59:59
        var endOfDay = DateTime.Today.AddDays(1).AddTicks(-1);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = endOfDay, // Token 在當天結束時過期
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
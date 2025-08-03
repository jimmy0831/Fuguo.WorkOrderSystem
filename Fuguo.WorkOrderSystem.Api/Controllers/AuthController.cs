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
        // 1. 根據帳號查詢使用者，邏輯不變
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Account == loginRequest.Account);

        if (user == null)
        {
            return Unauthorized(new { message = "帳號或密碼錯誤。" });
        }

        // 2. 驗證密碼，邏輯不變
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password);

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "帳號或密碼錯誤。" });
        }

        // 3. 密碼驗證成功，產生 JWT Token
        var token = GenerateJwtToken(user);

        // 4. 【修改點】回傳一個包含所有需要資訊的物件
        return Ok(new
        {
            token = token,
            userId = user.UserId,
            userName = user.UserName,
            account = user.Account,
            isAdmin = user.IsAdmin
        });
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Key"]);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Account),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId),
            new Claim(ClaimTypes.Name, user.UserName),
        };

        if (string.Equals(user.IsAdmin, "Y", StringComparison.OrdinalIgnoreCase))
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }
        else
        {
            claims.Add(new Claim(ClaimTypes.Role, "User"));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(8), // Token 過期時間
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
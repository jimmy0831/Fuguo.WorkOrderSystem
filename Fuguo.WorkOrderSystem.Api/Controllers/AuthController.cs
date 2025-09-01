using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;
using Fuguo.WorkOrderSystem.Api.Dtos;
using Fuguo.WorkOrderSystem.Api.Services;
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
    private readonly IPasswordEncryptionService _passwordEncryption;

    public AuthController(ApplicationDbContext context, IConfiguration configuration, IPasswordEncryptionService passwordEncryption)
    {
        _context = context;
        _configuration = configuration;
        _passwordEncryption = passwordEncryption;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        try
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Account == loginRequest.Account);

            if (user == null)
            {
                return Unauthorized(new { message = "帳號或密碼錯誤" });
            }

            if (!_passwordEncryption.Verify(loginRequest.Password, user.Password))
            {
                return Unauthorized(new { message = "帳號或密碼錯誤" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
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
        var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]);
        
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Account ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId ?? ""),
            new Claim(ClaimTypes.Name, user.Account ?? ""),
            new Claim(ClaimTypes.Role, user.IsAdmin == "Y" ? "Admin" : "User")
        };

        var endOfDay = DateTime.Today.AddDays(1).AddTicks(-1);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = endOfDay,
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
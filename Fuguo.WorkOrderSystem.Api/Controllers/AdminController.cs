using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;
using Fuguo.WorkOrderSystem.Api.Services;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordEncryptionService _passwordEncryption;

    public AdminController(ApplicationDbContext context, IPasswordEncryptionService passwordEncryption)
    {
        _context = context;
        _passwordEncryption = passwordEncryption;
    }

    [HttpPost("init-admin")]
    [AllowAnonymous]
    public async Task<IActionResult> InitializeAdmin([FromBody] InitAdminDto initDto)
    {
        try
        {
            var adminExists = await _context.Users.AnyAsync(u => u.IsAdmin == "Y");

            if (adminExists && !initDto.ForceReset)
            {
                return BadRequest(new { message = "管理員帳號已存在" });
            }

            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Account == initDto.Account);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserId = initDto.Account,
                    UserName = "系統管理員",
                    Account = initDto.Account,
                    Password = _passwordEncryption.Encrypt(initDto.Password),
                    IsAdmin = "Y",
                    CreateBy = "System",
                    CreateDate = DateTime.UtcNow
                };
                _context.Users.Add(adminUser);
            }
            else
            {
                adminUser.Password = _passwordEncryption.Encrypt(initDto.Password);
                adminUser.IsAdmin = "Y";
                adminUser.UpdateBy = "System";
                adminUser.UpdateDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "管理員帳號初始化成功",
                account = adminUser.Account,
                password = initDto.Password
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "初始化失敗", error = ex.Message });
        }
    }

    [HttpGet("check-userid/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CheckUserIdExists(string userId)
    {
        try
        {
            var exists = await _context.Users.AnyAsync(u => u.UserId == userId);
            return Ok(new { exists = exists });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "檢查使用者ID失敗", error = ex.Message });
        }
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _context.Users.OrderBy(u => u.UserId).ToListAsync();

            var userList = users.Select(u => new
            {
                u.UserId,
                u.UserName,
                u.Account,
                Password = SafeDecryptPassword(u.Password),
                u.IsAdmin,
                u.CreateDate,
                u.UpdateDate
            }).ToList();

            return Ok(userList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取使用者列表失敗", error = ex.Message });
        }
    }

    [HttpGet("users/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUser(string userId)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new { message = "使用者不存在" });
            }

            return Ok(new
            {
                user.UserId,
                user.UserName,
                user.Account,
                Password = SafeDecryptPassword(user.Password),
                user.IsAdmin,
                user.CreateBy,
                user.CreateDate,
                user.UpdateBy,
                user.UpdateDate
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取使用者資訊失敗", error = ex.Message });
        }
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)
    {
        try
        {
            var existingUserByUserId = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userDto.UserId);
            if (existingUserByUserId != null)
            {
                return BadRequest(new { message = "使用者ID已存在" });
            }

            var existingUserByAccount = await _context.Users.FirstOrDefaultAsync(u => u.Account == userDto.Account);
            if (existingUserByAccount != null)
            {
                return BadRequest(new { message = "帳號已存在" });
            }

            var newUser = new User
            {
                UserId = userDto.UserId,
                UserName = userDto.UserName,
                Account = userDto.Account,
                Password = _passwordEncryption.Encrypt(userDto.Password),
                IsAdmin = userDto.IsAdmin,
                CreateBy = User.Identity?.Name,
                CreateDate = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "使用者建立成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "建立使用者失敗", error = ex.Message });
        }
    }

    [HttpPut("users/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto userDto)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new { message = "使用者不存在" });
            }

            user.UserName = userDto.UserName ?? user.UserName;
            user.Account = userDto.Account ?? user.Account;
            if (!string.IsNullOrEmpty(userDto.Password))
            {
                user.Password = _passwordEncryption.Encrypt(userDto.Password);
            }
            user.IsAdmin = userDto.IsAdmin ?? user.IsAdmin;
            user.UpdateBy = User.Identity?.Name;
            user.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "使用者更新成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "更新使用者失敗", error = ex.Message });
        }
    }

    [HttpDelete("users/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new { message = "使用者不存在" });
            }

            if (user.Account == User.Identity?.Name)
            {
                return BadRequest(new { message = "不能刪除自己的帳號" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "使用者刪除成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "刪除使用者失敗", error = ex.Message });
        }
    }

    private string SafeDecryptPassword(string encryptedPassword)
    {
        try
        {
            if (string.IsNullOrEmpty(encryptedPassword))
                return "";

            return _passwordEncryption.Decrypt(encryptedPassword);
        }
        catch
        {
            return "[需要重設密碼]";
        }
    }
}

public class CreateUserDto
{
    public string UserId { get; set; } = "";
    public string UserName { get; set; } = "";
    public string Account { get; set; } = "";
    public string Password { get; set; } = "";
    public string IsAdmin { get; set; } = "N";
}

public class UpdateUserDto
{
    public string? UserName { get; set; }
    public string? Account { get; set; }
    public string? Password { get; set; }
    public string? IsAdmin { get; set; }
}

public class InitAdminDto
{
    public string Account { get; set; } = "admin";
    public string Password { get; set; } = "admin123";
    public bool ForceReset { get; set; } = false;
}

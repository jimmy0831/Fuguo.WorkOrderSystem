using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;

[Route("api/[controller]")]
[ApiController]
[Authorize] // 需要JWT驗證
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    // 獲取所有使用者列表 - 僅管理員可存取
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.UserId,
                    u.UserName,
                    u.Account,
                    // 為了安全性，不回傳密碼
                    u.IsAdmin,
                    u.CreateDate,
                    u.UpdateDate
                })
                .OrderBy(u => u.UserId)
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取使用者列表時發生錯誤", error = ex.Message });
        }
    }

    // 獲取特定使用者詳細資訊
    [HttpGet("users/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUser(string userId)
    {
        try
        {
            var user = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new
                {
                    u.UserId,
                    u.UserName,
                    u.Account,
                    // 為了安全性，不回傳密碼
                    u.IsAdmin,
                    u.CreateBy,
                    u.CreateDate,
                    u.UpdateBy,
                    u.UpdateDate
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "使用者不存在" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取使用者資訊時發生錯誤", error = ex.Message });
        }
    }

    // 建立新使用者
    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)
    {
        try
        {
            // 檢查帳號是否已存在
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Account == userDto.Account);

            if (existingUser != null)
            {
                return BadRequest(new { message = "帳號已存在" });
            }

            // 建立新使用者
            var newUser = new User
            {
                UserId = userDto.UserId,
                UserName = userDto.UserName,
                Account = userDto.Account,
                Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password), // 使用BCrypt雜湊
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
            return StatusCode(500, new { message = "建立使用者時發生錯誤", error = ex.Message });
        }
    }

    // 更新使用者
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

            // 更新使用者資訊
            user.UserName = userDto.UserName ?? user.UserName;
            user.Account = userDto.Account ?? user.Account;
            if (!string.IsNullOrEmpty(userDto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(userDto.Password); // 使用BCrypt雜湊
            }
            user.IsAdmin = userDto.IsAdmin ?? user.IsAdmin;
            user.UpdateBy = User.Identity?.Name;
            user.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "使用者更新成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "更新使用者時發生錯誤", error = ex.Message });
        }
    }

    // 刪除使用者
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

            // 檢查是否為當前登入的使用者
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
            return StatusCode(500, new { message = "刪除使用者時發生錯誤", error = ex.Message });
        }
    }
}

// DTO 類別
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

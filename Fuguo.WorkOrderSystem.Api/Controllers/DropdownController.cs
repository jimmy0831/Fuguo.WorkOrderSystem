using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DropdownController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DropdownController(ApplicationDbContext context)
    {
        _context = context;
    }

    #region PackagingTypes
    [HttpGet("packaging-types")]
    public async Task<IActionResult> GetPackagingTypes()
    {
        try
        {
            var items = await _context.PackagingTypes.OrderBy(x => x.Id).ToListAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取包裝方式列表失敗", error = ex.Message });
        }
    }

    [HttpPost("packaging-types")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreatePackagingType([FromBody] CreateDropdownItemDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "名稱不能為空" });
            }

            var exists = await _context.PackagingTypes.AnyAsync(x => x.Name == dto.Name);
            if (exists)
            {
                return BadRequest(new { message = "此包裝方式已存在" });
            }

            var item = new PackagingType { Name = dto.Name };
            _context.PackagingTypes.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "包裝方式建立成功", id = item.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "建立包裝方式失敗", error = ex.Message });
        }
    }

    [HttpPut("packaging-types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePackagingType(int id, [FromBody] UpdateDropdownItemDto dto)
    {
        try
        {
            var item = await _context.PackagingTypes.FindAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "包裝方式不存在" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "名稱不能為空" });
            }

            var exists = await _context.PackagingTypes.AnyAsync(x => x.Name == dto.Name && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "此包裝方式已存在" });
            }

            item.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { message = "包裝方式更新成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "更新包裝方式失敗", error = ex.Message });
        }
    }

    [HttpDelete("packaging-types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePackagingType(int id)
    {
        try
        {
            var item = await _context.PackagingTypes.FindAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "包裝方式不存在" });
            }

            _context.PackagingTypes.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "包裝方式刪除成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "刪除包裝方式失敗", error = ex.Message });
        }
    }
    #endregion

    #region FormingTypes
    [HttpGet("forming-types")]
    public async Task<IActionResult> GetFormingTypes()
    {
        try
        {
            var items = await _context.FormingTypes.OrderBy(x => x.Id).ToListAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取成形列表失敗", error = ex.Message });
        }
    }

    [HttpPost("forming-types")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateFormingType([FromBody] CreateDropdownItemDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "名稱不能為空" });
            }

            var exists = await _context.FormingTypes.AnyAsync(x => x.Name == dto.Name);
            if (exists)
            {
                return BadRequest(new { message = "此成形方式已存在" });
            }

            var item = new FormingType { Name = dto.Name };
            _context.FormingTypes.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "成形方式建立成功", id = item.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "建立成形方式失敗", error = ex.Message });
        }
    }

    [HttpPut("forming-types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateFormingType(int id, [FromBody] UpdateDropdownItemDto dto)
    {
        try
        {
            var item = await _context.FormingTypes.FindAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "成形方式不存在" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "名稱不能為空" });
            }

            var exists = await _context.FormingTypes.AnyAsync(x => x.Name == dto.Name && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "此成形方式已存在" });
            }

            item.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { message = "成形方式更新成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "更新成形方式失敗", error = ex.Message });
        }
    }

    [HttpDelete("forming-types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFormingType(int id)
    {
        try
        {
            var item = await _context.FormingTypes.FindAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "成形方式不存在" });
            }

            _context.FormingTypes.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "成形方式刪除成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "刪除成形方式失敗", error = ex.Message });
        }
    }
    #endregion

    #region CuttingTypes
    [HttpGet("cutting-types")]
    public async Task<IActionResult> GetCuttingTypes()
    {
        try
        {
            var items = await _context.CuttingTypes.OrderBy(x => x.Id).ToListAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取斬型列表失敗", error = ex.Message });
        }
    }

    [HttpPost("cutting-types")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateCuttingType([FromBody] CreateDropdownItemDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "名稱不能為空" });
            }

            var exists = await _context.CuttingTypes.AnyAsync(x => x.Name == dto.Name);
            if (exists)
            {
                return BadRequest(new { message = "此斬型方式已存在" });
            }

            var item = new CuttingType { Name = dto.Name };
            _context.CuttingTypes.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "斬型方式建立成功", id = item.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "建立斬型方式失敗", error = ex.Message });
        }
    }

    [HttpPut("cutting-types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCuttingType(int id, [FromBody] UpdateDropdownItemDto dto)
    {
        try
        {
            var item = await _context.CuttingTypes.FindAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "斬型方式不存在" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "名稱不能為空" });
            }

            var exists = await _context.CuttingTypes.AnyAsync(x => x.Name == dto.Name && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "此斬型方式已存在" });
            }

            item.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { message = "斬型方式更新成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "更新斬型方式失敗", error = ex.Message });
        }
    }

    [HttpDelete("cutting-types/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCuttingType(int id)
    {
        try
        {
            var item = await _context.CuttingTypes.FindAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "斬型方式不存在" });
            }

            _context.CuttingTypes.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "斬型方式刪除成功" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "刪除斬型方式失敗", error = ex.Message });
        }
    }
    #endregion
}

public class CreateDropdownItemDto
{
    public string Name { get; set; } = "";
}

public class UpdateDropdownItemDto
{
    public string Name { get; set; } = "";
}
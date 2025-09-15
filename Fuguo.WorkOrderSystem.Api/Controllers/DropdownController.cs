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
            return StatusCode(500, new { message = "����]�ˤ覡�C����", error = ex.Message });
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
                return BadRequest(new { message = "�W�٤��ର��" });
            }

            var exists = await _context.PackagingTypes.AnyAsync(x => x.Name == dto.Name);
            if (exists)
            {
                return BadRequest(new { message = "���]�ˤ覡�w�s�b" });
            }

            var item = new PackagingType { Name = dto.Name };
            _context.PackagingTypes.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "�]�ˤ覡�إߦ��\", id = item.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "�إߥ]�ˤ覡����", error = ex.Message });
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
                return NotFound(new { message = "�]�ˤ覡���s�b" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "�W�٤��ର��" });
            }

            var exists = await _context.PackagingTypes.AnyAsync(x => x.Name == dto.Name && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "���]�ˤ覡�w�s�b" });
            }

            item.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { message = "�]�ˤ覡��s���\" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "��s�]�ˤ覡����", error = ex.Message });
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
                return NotFound(new { message = "�]�ˤ覡���s�b" });
            }

            _context.PackagingTypes.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "�]�ˤ覡�R�����\" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "�R���]�ˤ覡����", error = ex.Message });
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
            return StatusCode(500, new { message = "������ΦC����", error = ex.Message });
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
                return BadRequest(new { message = "�W�٤��ର��" });
            }

            var exists = await _context.FormingTypes.AnyAsync(x => x.Name == dto.Name);
            if (exists)
            {
                return BadRequest(new { message = "�����Τ覡�w�s�b" });
            }

            var item = new FormingType { Name = dto.Name };
            _context.FormingTypes.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "���Τ覡�إߦ��\", id = item.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "�إߦ��Τ覡����", error = ex.Message });
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
                return NotFound(new { message = "���Τ覡���s�b" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "�W�٤��ର��" });
            }

            var exists = await _context.FormingTypes.AnyAsync(x => x.Name == dto.Name && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "�����Τ覡�w�s�b" });
            }

            item.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { message = "���Τ覡��s���\" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "��s���Τ覡����", error = ex.Message });
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
                return NotFound(new { message = "���Τ覡���s�b" });
            }

            _context.FormingTypes.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "���Τ覡�R�����\" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "�R�����Τ覡����", error = ex.Message });
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
            return StatusCode(500, new { message = "����٫��C����", error = ex.Message });
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
                return BadRequest(new { message = "�W�٤��ର��" });
            }

            var exists = await _context.CuttingTypes.AnyAsync(x => x.Name == dto.Name);
            if (exists)
            {
                return BadRequest(new { message = "���٫��覡�w�s�b" });
            }

            var item = new CuttingType { Name = dto.Name };
            _context.CuttingTypes.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "�٫��覡�إߦ��\", id = item.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "�إ߱٫��覡����", error = ex.Message });
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
                return NotFound(new { message = "�٫��覡���s�b" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "�W�٤��ର��" });
            }

            var exists = await _context.CuttingTypes.AnyAsync(x => x.Name == dto.Name && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "���٫��覡�w�s�b" });
            }

            item.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(new { message = "�٫��覡��s���\" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "��s�٫��覡����", error = ex.Message });
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
                return NotFound(new { message = "�٫��覡���s�b" });
            }

            _context.CuttingTypes.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "�٫��覡�R�����\" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "�R���٫��覡����", error = ex.Message });
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
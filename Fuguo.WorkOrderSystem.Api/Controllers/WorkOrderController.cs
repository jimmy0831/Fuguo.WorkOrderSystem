using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Fuguo.WorkOrderSystem.Api.Data;
using Fuguo.WorkOrderSystem.Api.Models;
using System.Text.RegularExpressions;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WorkOrderController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public WorkOrderController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("next-id")]
    public async Task<IActionResult> GetNextWorkOrderId()
    {
        try
        {
            var lastWorkOrder = await _context.WorkOrders
                .Where(w => w.WorkOrderId != null && w.WorkOrderId.StartsWith("BU"))
                .OrderByDescending(w => w.WorkOrderId)
                .FirstOrDefaultAsync();

            var nextNumber = 1;
            if (lastWorkOrder != null && !string.IsNullOrEmpty(lastWorkOrder.WorkOrderId))
            {
                var numberPart = lastWorkOrder.WorkOrderId.Substring(2);
                if (int.TryParse(numberPart, out int currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }

            var nextWorkOrderId = $"BU{nextNumber:D6}";
            return Ok(new { workOrderId = nextWorkOrderId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取工單編號失敗", error = ex.Message });
        }
    }

    [HttpGet("check-id/{workOrderId}")]
    public async Task<IActionResult> CheckWorkOrderIdExists(string workOrderId)
    {
        try
        {
            var exists = await _context.WorkOrders.AnyAsync(w => w.WorkOrderId == workOrderId);
            return Ok(new { exists = exists });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "檢查工單編號失敗", error = ex.Message });
        }
    }

    [HttpPost("validate-id")]
    public IActionResult ValidateWorkOrderId([FromBody] ValidateWorkOrderIdDto dto)
    {
        try
        {
            var pattern = @"^BU\d{6}$";
            var isValid = Regex.IsMatch(dto.WorkOrderId, pattern);
            
            return Ok(new { isValid = isValid });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "驗證工單編號失敗", error = ex.Message });
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _context.Users
                .OrderBy(u => u.UserId)
                .Select(u => new { u.UserId, u.UserName })
                .ToListAsync();

            // 前端排序：數字在前，文字在後
            var sortedUsers = users
                .OrderBy(u => int.TryParse(u.UserId, out _) ? 0 : 1) // 數字優先
                .ThenBy(u => int.TryParse(u.UserId, out int numValue) ? numValue : 0) // 數字按大小排序
                .ThenBy(u => u.UserId) // 文字按字典排序
                .ToList();

            return Ok(sortedUsers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取使用者列表失敗", error = ex.Message });
        }
    }

    [HttpGet("next-customer-po/{userId}")]
    public async Task<IActionResult> GetNextCustomerPoNumber(string userId)
    {
        try
        {
            var prefix = $"{userId}-";
            var lastCustomerPo = await _context.WorkOrders
                .Where(w => w.CustomerPoNumber != null && w.CustomerPoNumber.StartsWith(prefix))
                .OrderByDescending(w => w.CustomerPoNumber)
                .FirstOrDefaultAsync();

            var nextNumber = 1;
            if (lastCustomerPo != null && !string.IsNullOrEmpty(lastCustomerPo.CustomerPoNumber))
            {
                var numberPart = lastCustomerPo.CustomerPoNumber.Substring(prefix.Length);
                if (int.TryParse(numberPart, out int currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }

            var nextCustomerPo = $"{prefix}{nextNumber:D4}";
            return Ok(new { customerPoNumber = nextCustomerPo });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "獲取客戶編號失敗", error = ex.Message });
        }
    }

    [HttpGet("check-customer-po/{customerPoNumber}")]
    public async Task<IActionResult> CheckCustomerPoNumberExists(string customerPoNumber)
    {
        try
        {
            var exists = await _context.WorkOrders.AnyAsync(w => w.CustomerPoNumber == customerPoNumber);
            return Ok(new { exists = exists });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "檢查客戶編號失敗", error = ex.Message });
        }
    }
}

public class ValidateWorkOrderIdDto
{
    public string WorkOrderId { get; set; } = "";
}
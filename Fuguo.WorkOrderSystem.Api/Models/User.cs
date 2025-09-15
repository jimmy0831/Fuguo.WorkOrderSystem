using System;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Models;

public partial class User
{
    public int Record { get; set; }

    public string? UserId { get; set; }

    public string? UserName { get; set; }

    public string? Account { get; set; }

    public string? Password { get; set; }

    public string? IsAdmin { get; set; }

    public string? CreateBy { get; set; }

    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    public DateTime? UpdateDate { get; set; }

    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

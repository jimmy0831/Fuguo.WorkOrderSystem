using System;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Models;

public partial class Mold
{
    public int Record { get; set; }

    public string? MoldId { get; set; }

    public int? MoldQuantity { get; set; }

    public int? CarQuantity { get; set; }

    public int? SetQuantity { get; set; }

    public string? MoldDevelopmentNotes { get; set; }

    public string? PunchDevelopmentNotes { get; set; }

    public string? CreateBy { get; set; }

    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    public DateTime? UpdateDate { get; set; }

    public virtual ICollection<CuttingDy> CuttingDies { get; set; } = new List<CuttingDy>();

    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

using System;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Models;

public partial class WorkOrder
{
    public int Record { get; set; }

    public string? WorkOrderId { get; set; }

    public int? MoldRefId { get; set; }

    public int? CuttingDieRefId { get; set; }

    public string? CustomerPoNumber { get; set; }

    public string? ProductName { get; set; }

    public string? LeatherSupplier { get; set; }

    public string? Material { get; set; }

    public int? Thickness { get; set; }

    public int? Width { get; set; }

    public int? UsedLength { get; set; }

    public string? Remarks { get; set; }

    public bool? FoldingRequired { get; set; }

    public bool? PunchingRequired { get; set; }

    public bool? ProcessingRequired { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsCompleted { get; set; }

    public int? AssignedSalespersonRefId { get; set; }

    public DateTime? ShipDate { get; set; }

    public string? CreateBy { get; set; }

    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    public DateTime? UpdateDate { get; set; }

    public virtual User? AssignedSalespersonRef { get; set; }

    public virtual CuttingDy? CuttingDieRef { get; set; }

    public virtual Mold? MoldRef { get; set; }
}

using System;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Models;

public partial class CuttingDy
{
    public int Record { get; set; }

    public string? CuttingDieId { get; set; }

    public int? MoldRefId { get; set; }

    public int? CuttingDieQuantity { get; set; }

    public int? ProductionLength { get; set; }

    public int? DeliveryQuantity { get; set; }

    public string? PackagingMethod { get; set; }

    public int? PackageLength { get; set; }

    public int? PackageWidth { get; set; }

    public int? PackageHeight { get; set; }

    public int? FractionalPackageLength { get; set; }

    public int? FractionalPackageWidth { get; set; }

    public int? FractionalPackageHeight { get; set; }

    public decimal? WeightPerPiece { get; set; }

    public string? CuttingDieDevelopmentNotes { get; set; }

    public string? FormingNotes { get; set; }

    public bool? HasUpperMold { get; set; }

    public string? CuttingNotes { get; set; }

    public string? PunchingNotes { get; set; }

    public string? ExternalProcessingNotes { get; set; }

    public string? CreateBy { get; set; }

    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    public DateTime? UpdateDate { get; set; }

    public virtual Mold? MoldRef { get; set; }

    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

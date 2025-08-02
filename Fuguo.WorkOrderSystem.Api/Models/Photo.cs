using System;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Models;

public partial class Photo
{
    public int Record { get; set; }

    public string? EntityType { get; set; }

    public int? EntityId { get; set; }

    public string? PhotoUrl { get; set; }

    public string? Description { get; set; }

    public string? UploadedBy { get; set; }

    public DateTime? CreateDate { get; set; }
}

using System;
using System.Collections.Generic;

namespace Fuguo.WorkOrderSystem.Api.Models;

public partial class PackagingType
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;
}

using System;
using System.Collections.Generic;
using Fuguo.WorkOrderSystem.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Fuguo.WorkOrderSystem.Api.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CuttingDy> CuttingDies { get; set; }

    public virtual DbSet<CuttingType> CuttingTypes { get; set; }

    public virtual DbSet<FormingType> FormingTypes { get; set; }

    public virtual DbSet<Mold> Molds { get; set; }

    public virtual DbSet<PackagingType> PackagingTypes { get; set; }

    public virtual DbSet<Photo> Photos { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<WorkOrder> WorkOrders { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CuttingDy>(entity =>
        {
            entity.HasKey(e => e.Record).HasName("PK__CuttingD__8DBE5B9E2E3B12CC");

            entity.Property(e => e.CreateBy).HasMaxLength(50);
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CuttingDieId).HasMaxLength(50);
            entity.Property(e => e.HasUpperMold).HasDefaultValue(false);
            entity.Property(e => e.PackagingMethod).HasMaxLength(100);
            entity.Property(e => e.UpdateBy).HasMaxLength(50);
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.WeightPerPiece).HasColumnType("decimal(18, 4)");

            entity.HasOne(d => d.MoldRef).WithMany(p => p.CuttingDies)
                .HasForeignKey(d => d.MoldRefId)
                .HasConstraintName("FK__CuttingDi__MoldR__3D5E1FD2");
        });

        modelBuilder.Entity<CuttingType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CuttingT__3214EC273AC90FEE");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<FormingType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FormingT__3214EC275EDACC65");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Mold>(entity =>
        {
            entity.HasKey(e => e.Record).HasName("PK__Molds__8DBE5B9E38F2BBD9");

            entity.Property(e => e.CreateBy).HasMaxLength(50);
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MoldId).HasMaxLength(50);
            entity.Property(e => e.UpdateBy).HasMaxLength(50);
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<PackagingType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Packagin__3214EC27B97B848D");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(e => e.Record).HasName("PK__Photos__8DBE5B9EF154206B");

            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.EntityType).HasMaxLength(50);
            entity.Property(e => e.IsShow).HasMaxLength(5);
            entity.Property(e => e.UploadedBy).HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Record).HasName("PK__Users__8DBE5B9E2F8ED6C1");

            entity.Property(e => e.Account).HasMaxLength(50);
            entity.Property(e => e.CreateBy).HasMaxLength(50);
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsAdmin).HasMaxLength(5);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.UpdateBy).HasMaxLength(50);
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.UserId).HasMaxLength(50);
            entity.Property(e => e.UserName).HasMaxLength(100);
        });

        modelBuilder.Entity<WorkOrder>(entity =>
        {
            entity.HasKey(e => e.Record).HasName("PK__WorkOrde__8DBE5B9E957A6AB5");

            entity.Property(e => e.CreateBy).HasMaxLength(50);
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerPoNumber).HasMaxLength(100);
            entity.Property(e => e.FoldingRequired).HasDefaultValue(false);
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.LeatherSupplier).HasMaxLength(255);
            entity.Property(e => e.Material).HasMaxLength(255);
            entity.Property(e => e.ProcessingRequired).HasDefaultValue(false);
            entity.Property(e => e.ProductName).HasMaxLength(255);
            entity.Property(e => e.PunchingRequired).HasDefaultValue(false);
            entity.Property(e => e.ShipDate).HasColumnType("datetime");
            entity.Property(e => e.UpdateBy).HasMaxLength(50);
            entity.Property(e => e.UpdateDate).HasColumnType("datetime");
            entity.Property(e => e.WorkOrderId).HasMaxLength(50);

            entity.HasOne(d => d.AssignedSalespersonRef).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.AssignedSalespersonRefId)
                .HasConstraintName("FK__WorkOrder__Assig__48CFD27E");

            entity.HasOne(d => d.CuttingDieRef).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.CuttingDieRefId)
                .HasConstraintName("FK__WorkOrder__Cutti__4316F928");

            entity.HasOne(d => d.MoldRef).WithMany(p => p.WorkOrders)
                .HasForeignKey(d => d.MoldRefId)
                .HasConstraintName("FK__WorkOrder__MoldR__4222D4EF");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

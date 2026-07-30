import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useCoupon, canDeleteCoupon } from "@/hooks/useCoupon";
import { useModal } from "@/hooks/useModal";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { CouponType, CouponStatus } from "@/types/coupon.types";
import type { GlobalSearchNavigateState } from "@/types/global-search.types";
import type { ColorVariant } from "@/types/common.types";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const TYPE_COLOR: Record<string, ColorVariant> = { flat: "blue", percent: "green" };
const STATUS_COLOR: Record<string, ColorVariant> = { active: "green", expired: "red", exhausted: "gray" };

const CouponsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { filteredCoupons, search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter, confirmDelete } = useCoupon();
  const { openModal } = useModal();

  useEffect(() => {
    const state = location.state as GlobalSearchNavigateState | null;
    if (!state?.couponSearch && !state?.openCoupon) return;

    if (state.couponSearch) setSearch(state.couponSearch);
    if (state.openCoupon) openModal("CouponCreateEdit", { coupon: state.openCoupon });

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, openModal, setSearch]);
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied",
        description: `Coupon code "${code}" copied to clipboard.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy the coupon code.",
      });
    }
  };

  const columns: DataTableOneColumn<typeof filteredCoupons[0]>[] = [
    {
      key: "code", header: "Code", render: (r) => (
        <div className="flex items-center gap-1">
          <span className=" font-bold">{r.code}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); copyCode(r.code); }}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ), sortable: true, sortValue: (r) => r.code,
    },
    { key: "type", header: "Type", render: (r) => <StatusBadge status={r.type} colorMap={TYPE_COLOR} /> },
    {
      key: "value", header: "Value", render: (r) => {
        if (r.type === "flat") return formatCurrency(r.value);
        if (r.type === "percent") return `${r.value}%`;
        return "—";
      },
    },
    { key: "minOrder", header: "Min Order", render: (r) => r.minOrder != null ? formatCurrency(r.minOrder) : "—" },
    { key: "uses", header: "Uses", render: (r) => <span className="text-muted-foreground">{r.usedCount} / {r.maxUses ?? "∞"}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.computedStatus} colorMap={STATUS_COLOR} /> },
    {
      key: "dates", header: "Validity", render: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.expiresAt ? formatDate(r.expiresAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions", header: "",hideable: false, render: (r) => (
        <div className="flex gap-1 justify-end">
          <PermissionGate moduleKey="coupons" operation="edit">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openModal("CouponCreateEdit", { coupon: r }); }}>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate moduleKey="coupons" operation="delete">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canDeleteCoupon(r)}
              title={
                canDeleteCoupon(r)
                  ? "Delete coupon"
                  : "Used coupons can only be deleted after they expire"
              }
              onClick={(e) => { e.stopPropagation(); confirmDelete(r); }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Coupons"
        subtitle={`${filteredCoupons.length} coupons`}
        actions={
          <PermissionGate moduleKey="coupons" operation="create">
            <Button size="sm" onClick={() => openModal("CouponCreateEdit", {})}><Plus className="mr-1 h-4 w-4" /> Add Coupon</Button>
          </PermissionGate>
        }
      />
      <div className="mt-4">
        <DataTableOne
          columns={columns}
          data={filteredCoupons}
          keyExtractor={(r) => r.id}
          emptyMessage="No coupons found"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search coupons..."
          filters={[
            {
              key: "status", label: "Status", value: statusFilter,
              options: [
                { label: "Active", value: "active" }, { label: "Expired", value: "expired" },
                { label: "Exhausted", value: "exhausted" },
              ],
              onChange: (v) => setStatusFilter(v as CouponStatus | "all"),
            },
            {
              key: "type", label: "Types", value: typeFilter,
              options: [
                { label: "Flat", value: "flat" }, { label: "Percent", value: "percent" },
              ],
              onChange: (v) => setTypeFilter(v as CouponType | "all"),
            },
          ]}
        />
      </div>
    </PageWrapper>
  );
};

export default CouponsPage;

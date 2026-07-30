import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import type { Coupon, CouponStatus, CouponType } from "@/types/coupon.types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/services/coupon-service";
import React from "react";

interface CouponWithStatus extends Coupon {
  computedStatus: CouponStatus;
}

const computeStatus = (c: Coupon): CouponStatus => {
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return "exhausted";
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return "expired";
  if (c.isActive) return "active";
  return "expired";
};

export const isCouponDateExpired = (c: Coupon): boolean =>
  Boolean(c.expiresAt && new Date(c.expiresAt) < new Date());

export const canDeleteCoupon = (c: Coupon): boolean =>
  isCouponDateExpired(c) || c.usedCount === 0;

const COUPONS_QK = ["coupons"] as const;

export const useCoupon = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<CouponType | "all">("all");
  const { notify } = useNotification();
  const { openModal } = useModal();

  const { data: coupons = [], isPending, isError, error } = useQuery({
    queryKey: COUPONS_QK,
    queryFn: fetchCoupons,
  });

  React.useEffect(() => {
    if (isError && error) notify(error instanceof Error ? error.message : "Failed to load coupons", "error");
  }, [isError, error, notify]);

  const couponsWithStatus: CouponWithStatus[] = useMemo(
    () => coupons.map((c) => ({ ...c, computedStatus: computeStatus(c) })),
    [coupons]
  );

  const filteredCoupons = useMemo(() => {
    return couponsWithStatus.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || c.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || c.computedStatus === statusFilter;
      const matchesType = typeFilter === "all" || c.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [couponsWithStatus, search, statusFilter, typeFilter]);

  const handleCreate = useCallback(
    async (input: Omit<Coupon, "id" | "createdAt" | "usedCount">) => {
      try {
        await createCoupon(input);
        await queryClient.invalidateQueries({ queryKey: COUPONS_QK });
        notify("Coupon created", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to create coupon", "error");
        throw err;
      }
    },
    [queryClient, notify]
  );

  const handleUpdate = useCallback(
    async (id: string, input: Partial<Omit<Coupon, "id" | "createdAt">>) => {
      try {
        await updateCoupon(id, input);
        await queryClient.invalidateQueries({ queryKey: COUPONS_QK });
        notify("Coupon updated", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to update coupon", "error");
        throw err;
      }
    },
    [queryClient, notify]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteCoupon(id);
        await queryClient.invalidateQueries({ queryKey: COUPONS_QK });
        notify("Coupon deleted", "success");
      } catch (err: unknown) {
        notify(err instanceof Error ? err.message : "Failed to delete coupon", "error");
      }
    },
    [queryClient, notify]
  );

  const confirmDelete = useCallback(
    (coupon: Coupon) => {
      if (!canDeleteCoupon(coupon)) {
        notify(
          "Cannot delete a coupon that has been used. Deactivate it instead.",
          "error",
        );
        return;
      }

      const expiredNote = isCouponDateExpired(coupon)
        ? " This expired coupon will be permanently removed."
        : "";

      openModal("ConfirmAction", {
        title: "Delete Coupon",
        description: `Are you sure you want to delete coupon "${coupon.code}"?${expiredNote}`,
        variant: "destructive",
        onConfirm: () => handleDelete(coupon.id),
      });
    },
    [openModal, handleDelete, notify]
  );

  return {
    coupons,
    filteredCoupons,
    isLoading: isPending,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    handleCreate,
    handleUpdate,
    handleDelete,
    confirmDelete,
  };
};

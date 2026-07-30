import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PRODUCTS_LIST_QK, fetchProducts } from "@/services/product-service";
import { ORDERS_QK, fetchOrders } from "@/services/order-service";
import { fetchReviews } from "@/services/review-service";
import { deleteLead, fetchLeads, updateLeadStatus } from "@/services/lead-service";
import { buildInventoryRecordsFromProducts } from "@/services/inventory-service";
import {
  loadReadNotificationIds,
  saveReadNotificationIds,
} from "@/lib/system-notifications-read";
import { useModal } from "@/hooks/useModal";
import type { ContactLead, LeadStatus } from "@/types/lead.types";
import type { ModalKey } from "@/types/modal.types";

export interface SystemNotification {
  id: string;
  type: "low_stock" | "pending_review" | "new_order" | "out_of_stock" | "new_lead";
  title: string;
  description: string;
  entityId: string;
  modalKey: ModalKey;
  modalPayload: Record<string, unknown>;
  createdAt: string;
  isRead: boolean;
}

const LEADS_NOTIFICATIONS_QK = ["admin", "leads", "notifications"] as const;

export function useSystemNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(loadReadNotificationIds);
  const { openModal } = useModal();

  const commitReadIds = useCallback((next: Set<string>) => {
    setReadIds(next);
    saveReadNotificationIds(next);
  }, []);

  const { data: products = [] } = useQuery({
    queryKey: PRODUCTS_LIST_QK,
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ORDERS_QK,
    queryFn: fetchOrders,
    staleTime: 30_000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"] as const,
    queryFn: fetchReviews,
    staleTime: 60_000,
  });

  const { data: newLeads = [] } = useQuery({
    queryKey: LEADS_NOTIFICATIONS_QK,
    queryFn: async () => {
      const data = await fetchLeads({ status: "new", limit: 20 });
      return data.leads;
    },
    staleTime: 30_000,
  });

  const buildLeadModalPayload = useCallback(
    (lead: ContactLead) => ({
      lead,
      onStatusChange: async (id: string, status: LeadStatus) => {
        await updateLeadStatus(id, status);
      },
      onDelete: () => {
        openModal("ConfirmAction", {
          title: "Delete Lead",
          description: `Delete inquiry from "${lead.name}"?`,
          variant: "destructive",
          confirmLabel: "Delete",
          onConfirm: async () => {
            await deleteLead(lead.id);
          },
        });
      },
    }),
    [openModal],
  );

  const notifications = useMemo(() => {
    const items: SystemNotification[] = [];
    const inventory = buildInventoryRecordsFromProducts(products);

    inventory.forEach((r) => {
      const desc = r.variantLabel ? `${r.productName ?? "Product"} (${r.variantLabel})` : (r.productName ?? "Product");

      if (r.quantity === 0) {
        items.push({
          id: `oos_${r.id}`,
          type: "out_of_stock",
          title: "Out of Stock",
          description: desc,
          entityId: r.id,
          modalKey: "InventoryAdjust",
          modalPayload: { inventory: r },
          createdAt: r.lastUpdatedAt,
          isRead: false,
        });
      } else if (r.quantity <= r.threshold) {
        items.push({
          id: `ls_${r.id}`,
          type: "low_stock",
          title: "Low Stock Alert",
          description: `${desc} — ${r.quantity} left (threshold: ${r.threshold})`,
          entityId: r.id,
          modalKey: "InventoryAdjust",
          modalPayload: { inventory: r },
          createdAt: r.lastUpdatedAt,
          isRead: false,
        });
      }
    });

    reviews.filter((r) => r.status === "pending").forEach((r) => {
      items.push({
        id: `pr_${r.id}`,
        type: "pending_review",
        title: "Pending Review",
        description: `${r.customerName} on ${r.productName}`,
        entityId: r.id,
        modalKey: "ReviewAction",
        modalPayload: { review: r },
        createdAt: r.createdAt,
        isRead: false,
      });
    });

    [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach((o) => {
        items.push({
          id: `no_${o.id}`,
          type: "new_order",
          title: "New Order",
          description: `${o.orderNumber} — ${o.total.toFixed(2)}`,
          entityId: o.id,
          modalKey: "OrderDetail",
          modalPayload: { order: o },
          createdAt: o.createdAt,
          isRead: false,
        });
      });

    newLeads.forEach((lead) => {
      items.push({
        id: `nl_${lead.id}`,
        type: "new_lead",
        title: "New Contact Inquiry",
        description: `${lead.name} — ${lead.subjectLabel}`,
        entityId: lead.id,
        modalKey: "LeadDetail",
        modalPayload: buildLeadModalPayload(lead),
        createdAt: lead.createdAt,
        isRead: false,
      });
    });

    return items;
  }, [products, orders, reviews, newLeads, buildLeadModalPayload]);

  const unreadNotifications = useMemo(() => {
    return notifications
      .map((n) => ({ ...n, isRead: readIds.has(n.id) }))
      .filter((n) => !n.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, readIds]);

  const unreadCount = unreadNotifications.length;

  const markAsRead = useCallback(
    (id: string) => {
      setReadIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        saveReadNotificationIds(next);
        return next;
      });
    },
    [],
  );

  const markAllAsRead = useCallback(() => {
    commitReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications, commitReadIds]);

  return { notifications: unreadNotifications, unreadCount, markAsRead, markAllAsRead };
};

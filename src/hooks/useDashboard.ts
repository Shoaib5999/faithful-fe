import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ORDERS_QK, fetchOrders } from "@/services/order-service";
import { PRODUCTS_LIST_QK, fetchProducts } from "@/services/product-service";
import { formatCurrency } from "@/lib/formatters";
import { formatDayLabel, isRevenueOrder, toLocalDateKey } from "@/services/analytics-service";
import { getCategoryDisplayLabel } from "@/constants/storefront.constants";
import type { TrendDirection } from "@/types/common.types";
import type { Order, InventoryRecord } from "@/types/commerce.types";
import { buildInventoryRecordsFromProducts } from "@/services/inventory-service";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalRevenueFormatted: string;
  productsTrend: TrendDirection;
  productsTrendValue: string;
  ordersTrend: TrendDirection;
  ordersTrendValue: string;
  customersTrend: TrendDirection;
  customersTrendValue: string;
  revenueTrend: TrendDirection;
  revenueTrendValue: string;
  recentOrders: Order[];
  lowStockItems: Array<InventoryRecord & { productName: string; variantName: string | null }>;
  salesTrendData: Array<{ date: string; label: string; revenue: number }>;
  salesTrendTotal: string;
  categoryBreakdown: Array<{ categorySlug: string; label: string; qty: number; percent: number }>;
}

function computeTrend(current: number, previous: number): { trend: TrendDirection; value: string } {
  if (previous === 0) return { trend: current > 0 ? "up" : "neutral", value: current > 0 ? "100%" : "0%" };
  const pct = ((current - previous) / previous) * 100;
  if (pct > 0) return { trend: "up", value: `${pct.toFixed(1)}%` };
  if (pct < 0) return { trend: "down", value: `${Math.abs(pct).toFixed(1)}%` };
  return { trend: "neutral", value: "0%" };
}

/** Distinct customers (user ids) who placed an order in [from, to). */
function uniqueBuyersInRange(orders: Order[], from: Date, to: Date): number {
  const set = new Set<string>();
  for (const o of orders) {
    const d = new Date(o.createdAt);
    if (d >= from && d < to) set.add(o.customerId);
  }
  return set.size;
}

export function useDashboard(): DashboardData {
  const { data: orders = [] } = useQuery({
    queryKey: ORDERS_QK,
    queryFn: fetchOrders,
  });

  const { data: products = [] } = useQuery({
    queryKey: PRODUCTS_LIST_QK,
    queryFn: fetchProducts,
  });

  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentOrders = orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
    const previousOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const currentRevenue = currentOrders
      .filter((o) => isRevenueOrder(o.status))
      .reduce((s, o) => s + o.total, 0);
    const previousRevenue = previousOrders
      .filter((o) => isRevenueOrder(o.status))
      .reduce((s, o) => s + o.total, 0);

    const currentBuyers = uniqueBuyersInRange(orders, thirtyDaysAgo, new Date(now.getTime() + 1));
    const previousBuyers = uniqueBuyersInRange(orders, sixtyDaysAgo, thirtyDaysAgo);

    const revTrend = computeTrend(currentRevenue, previousRevenue);
    const ordTrend = computeTrend(currentOrders.length, previousOrders.length);
    const custTrend = computeTrend(currentBuyers, previousBuyers);

    const totalRevenue = orders
      .filter((o) => isRevenueOrder(o.status))
      .reduce((s, o) => s + o.total, 0);
    const totalCustomerAccounts = new Set(orders.map((o) => o.customerId)).size;

    const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const lowStockRows = buildInventoryRecordsFromProducts(products).filter(
      (r) => r.quantity > 0 && r.quantity <= r.threshold
    );
    lowStockRows.sort((a, b) => a.quantity - b.quantity);
    const lowStockTop: Array<InventoryRecord & { productName: string; variantName: string | null }> = lowStockRows
      .slice(0, 8)
      .map((r) => ({
        ...r,
        productName: r.productName ?? "Product",
        variantName: r.variantLabel ?? null,
      }));

    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      revenueByDay[toLocalDateKey(d)] = 0;
    }
    orders
      .filter((o) => isRevenueOrder(o.status))
      .forEach((o) => {
      const key = toLocalDateKey(o.createdAt);
      if (key in revenueByDay) revenueByDay[key] += o.total;
    });
    const salesTrendData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      label: formatDayLabel(date),
      revenue,
    }));
    const salesTrendTotal = formatCurrency(salesTrendData.reduce((s, d) => s + d.revenue, 0));

    const activeProducts = products.filter((p) => p.status === "active").length;

    const qtyByCategory: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const slug = item.categorySlug ?? "other";
        qtyByCategory[slug] = (qtyByCategory[slug] ?? 0) + item.quantity;
      }
    }
    const totalQty = Object.values(qtyByCategory).reduce((s, n) => s + n, 0);
    const categoryBreakdown = Object.entries(qtyByCategory)
      .map(([categorySlug, qty]) => ({
        categorySlug,
        label: getCategoryDisplayLabel(categorySlug),
        qty,
        percent: totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);

    return {
      totalProducts: activeProducts,
      totalOrders: orders.length,
      totalCustomers: totalCustomerAccounts,
      totalRevenue,
      totalRevenueFormatted: formatCurrency(totalRevenue),
      productsTrend: "neutral" as TrendDirection,
      productsTrendValue: `${activeProducts}`,
      ordersTrend: ordTrend.trend,
      ordersTrendValue: ordTrend.value,
      customersTrend: custTrend.trend,
      customersTrendValue: custTrend.value,
      revenueTrend: revTrend.trend,
      revenueTrendValue: revTrend.value,
      recentOrders,
      lowStockItems: lowStockTop,
      salesTrendData,
      salesTrendTotal,
      categoryBreakdown,
    };
  }, [orders, products]);
}

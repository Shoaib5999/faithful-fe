import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ORDERS_QK, fetchOrders } from "@/services/order-service";
import { PRODUCTS_LIST_QK, fetchProducts } from "@/services/product-service";
import {
  filterByDateRange,
  formatDayLabel,
  isRevenueOrder,
  toLocalDateKey,
  topN,
  sumField,
} from "@/services/analytics-service";
import type { Order } from "@/types/commerce.types";

interface DateRange {
  from: Date | null;
  to: Date | null;
}

/** First order timestamp per customer (by createdAt ascending). */
function firstOrderDatesByCustomer(orders: Order[]): Map<string, string> {
  const sorted = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const map = new Map<string, string>();
  for (const o of sorted) {
    if (!map.has(o.customerId)) map.set(o.customerId, o.createdAt);
  }
  return map;
}

export const useAnalytics = (dateRange: DateRange) => {
  const ordersQuery = useQuery({
    queryKey: ORDERS_QK,
    queryFn: fetchOrders,
  });
  const productsQuery = useQuery({
    queryKey: PRODUCTS_LIST_QK,
    queryFn: fetchProducts,
  });

  const isLoading = ordersQuery.isFetching || productsQuery.isFetching;

  const metrics = useMemo(() => {
    const allOrders = ordersQuery.data ?? [];
    const allProducts = productsQuery.data ?? [];

    const orders = filterByDateRange(
      allOrders,
      (o: Order) => o.createdAt,
      dateRange,
    );
    const revenueOrders = orders.filter((o) => isRevenueOrder(o.status));

    const firstByCustomer = firstOrderDatesByCustomer(allOrders);
    const firstOrderRows = Array.from(firstByCustomer.entries()).map(
      ([customerId, createdAt]) => ({
        customerId,
        createdAt,
      }),
    );
    const newCustomersInRange = filterByDateRange(
      firstOrderRows,
      (r) => r.createdAt,
      dateRange,
    );

    const totalRevenue = sumField(revenueOrders, (o) => o.total);
    const totalOrders = orders.length;
    const newCustomers = newCustomersInRange.length;
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const revenueMap: Record<string, number> = {};
    revenueOrders.forEach((o) => {
      const day = toLocalDateKey(o.createdAt);
      revenueMap[day] = (revenueMap[day] || 0) + o.total;
    });
    const revenueByDay = Object.entries(revenueMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, label: formatDayLabel(date), amount }));

    const statusMap: Record<string, number> = {};
    orders.forEach((o) => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    const productRevMap: Record<string, { name: string; value: number }> = {};
    revenueOrders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.productId || item.productName || "unknown";
        if (!productRevMap[key]) {
          productRevMap[key] = {
            name: item.productName || "Unknown product",
            value: 0,
          };
        }
        productRevMap[key].value += item.totalPrice;
      });
    });
    const topProductsByRevenue = topN(Object.values(productRevMap), 10);

    const custGrowthMap: Record<string, number> = {};
    newCustomersInRange.forEach((c) => {
      const day = toLocalDateKey(c.createdAt);
      custGrowthMap[day] = (custGrowthMap[day] || 0) + 1;
    });
    const customerGrowthByDay = Object.entries(custGrowthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, label: formatDayLabel(date), count }));

    const COST_RATIO = 0.6;
    const inventoryValue = topN(
      allProducts
        .map((p) => {
          const qty = (p.variants ?? []).reduce((s, v) => s + v.stockQty, 0);
          const cost = p.price * COST_RATIO;
          return { name: p.name, value: Math.round(qty * cost) };
        })
        .filter((x) => x.value > 0),
      10,
    );

    const rangeDays =
      dateRange.from && dateRange.to
        ? Math.ceil(
            (dateRange.to.getTime() - dateRange.from.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 30;
    const prevFrom = dateRange.from
      ? new Date(dateRange.from.getTime() - rangeDays * 86400000)
      : null;
    const prevTo = dateRange.from ? new Date(dateRange.from.getTime()) : null;
    const prevOrders = filterByDateRange(allOrders, (o: Order) => o.createdAt, {
      from: prevFrom,
      to: prevTo,
    });
    const prevRevenue = sumField(
      prevOrders.filter((o) => isRevenueOrder(o.status)),
      (o) => o.total,
    );
    const revenueTrendValue =
      prevRevenue > 0
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
        : 0;
    const revenueTrend: "up" | "down" | "neutral" =
      revenueTrendValue > 0 ? "up" : revenueTrendValue < 0 ? "down" : "neutral";
    const ordersTrendValue =
      prevOrders.length > 0
        ? Math.round(
            ((totalOrders - prevOrders.length) / prevOrders.length) * 100,
          )
        : 0;
    const ordersTrend: "up" | "down" | "neutral" =
      ordersTrendValue > 0 ? "up" : ordersTrendValue < 0 ? "down" : "neutral";

    return {
      totalRevenue,
      totalOrders,
      newCustomers,
      averageOrderValue,
      revenueByDay,
      ordersByStatus,
      topProductsByRevenue,
      customerGrowthByDay,
      inventoryValue,
      revenueTrend,
      revenueTrendValue: `${Math.abs(revenueTrendValue)}%`,
      ordersTrend,
      ordersTrendValue: `${Math.abs(ordersTrendValue)}%`,
    };
  }, [ordersQuery.data, productsQuery.data, dateRange]);

  return { ...metrics, isLoading };
};

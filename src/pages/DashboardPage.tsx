import React from "react";
import { format } from "date-fns";

import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { useMasterData } from "@/hooks/useMasterData";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ROUTES } from "@/constants/routes.constants";
import type { ColorVariant } from "@/types/common.types";

const CATEGORY_DONUT_COLORS = [
  "hsl(4 78% 48%)",
  "hsl(4 78% 65%)",
  "hsl(24 78% 55%)",
  "hsl(38 80% 55%)",
  "hsl(0 0% 35%)",
  "hsl(0 0% 60%)",
];

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};



const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const { orderStatuses } = useMasterData();
  const navigate = useNavigate();
  const data = useDashboard();

  const statusColorMap = orderStatuses.reduce<Record<string, ColorVariant>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  const stats = [
    { label: "Total Revenue", value: data.totalRevenueFormatted, icon: DollarSign, trend: data.revenueTrend, trendValue: data.revenueTrendValue, trendLabel: "vs last 30 days", variant: "brand" as const, route: ROUTES.analytics },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingCart, trend: data.ordersTrend, trendValue: data.ordersTrendValue, trendLabel: "vs last 30 days", route: ROUTES.orders },
    { label: "Total Customers", value: data.totalCustomers, icon: Users, trend: data.customersTrend, trendValue: data.customersTrendValue, trendLabel: "vs last 30 days", route: ROUTES.customers },
    { label: "Total Products", value: data.totalProducts, icon: Package, trend: data.productsTrend, trendValue: data.productsTrendValue, trendLabel: "total", route: ROUTES.products },
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`${getGreeting()}, ${user?.name ?? "Admin"}`}
          subtitle={format(new Date(), "EEEE, MMMM d, yyyy")}
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <StatCard {...s} onClick={() => navigate(s.route)} />
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionCard
              title="Sales Overview"
              actions={<span className="text-base sm:text-lg font-bold text-foreground">{data.salesTrendTotal}</span>}
            >
              {data.salesTrendData.length === 0 ? (
                <EmptyState title="No sales data" description="Sales trend will appear once orders are placed." icon={TrendingUp} />
              ) : (
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.salesTrendData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatCurrency(v)} width={70} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} labelFormatter={(l: string) => l} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#salesGrad)" strokeWidth={2} animationDuration={800} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard title="Best Selling Categories">
              {data.categoryBreakdown.length === 0 ? (
                <EmptyState title="No sales yet" description="Category breakdown will appear once orders are placed." icon={Package} />
              ) : (
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        dataKey="qty"
                        nameKey="label"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                        animationDuration={800}
                      >
                        {data.categoryBreakdown.map((entry, index) => (
                          <Cell key={entry.categorySlug} fill={CATEGORY_DONUT_COLORS[index % CATEGORY_DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, _name, item) => [`${value} sold (${item.payload.percent}%)`, item.payload.label]} />
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionCard
              title="Recent Orders"
              actions={
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.orders)} className="h-7 text-xs">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              }
            >
              {data.recentOrders.length === 0 ? (
                <EmptyState title="No recent orders" description="Orders will appear here once placed." icon={ShoppingCart} />
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => openModal("OrderDetail", { order })}
                      className="flex items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-secondary/50 px-2 rounded-md"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className=" text-sm font-medium text-foreground truncate">{order.orderNumber}</span>
                        <span className="text-xs text-muted-foreground truncate">{order.customer.firstName} {order.customer.lastName} · {formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={order.status} colorMap={statusColorMap} />
                        <span className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(order.total)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard
              title="Low Stock Alerts"
              actions={
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.inventory)} className="h-7 text-xs">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              }
            >
              {data.lowStockItems.length === 0 ? (
                <EmptyState title="No low stock items" description="All products are above threshold." icon={AlertTriangle} />
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {data.lowStockItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openModal("InventoryAdjust", { inventory: item })}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-all hover:bg-secondary hover:border-primary/40"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{item.productName}</span>
                        {item.variantName && <span className="text-xs text-muted-foreground">{item.variantName}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-bold ${item.quantity <= item.threshold / 2 ? "text-destructive" : "text-warning"}`}>
                          {item.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {item.threshold}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;

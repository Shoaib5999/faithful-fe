import React, { useState } from "react";
import { subDays } from "date-fns";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMasterData } from "@/hooks/useMasterData";
import { formatCurrency } from "@/lib/formatters";
import { STATUS_VARIANT_HEX } from "@/lib/status-colors";
import type { ColorVariant } from "@/types/common.types";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const COLOR_MAP = STATUS_VARIANT_HEX;

const AnalyticsPage: React.FC = () => {
  const now = new Date();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | null>(
    {
      from: subDays(now, 30),
      to: now,
    },
  );

  const range = { from: dateRange?.from ?? null, to: dateRange?.to ?? null };
  const { isLoading, ...data } = useAnalytics(range);
  const { orderStatuses } = useMasterData();

  const statusColorLookup = orderStatuses.reduce<Record<string, string>>(
    (acc, s) => {
      acc[s.code] = COLOR_MAP[s.color] ?? "#6b7280";
      return acc;
    },
    {},
  );

  return (
    <PageWrapper>
      <PageHeader
        title="Analytics"
        actions={
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select date range"
          />
        }
      />

      {isLoading ? (
        <div className="mt-4">
          <SkeletonLoader variant="statcard" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6 mt-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            icon={DollarSign}
            trend={data.revenueTrend}
            trendValue={data.revenueTrendValue}
            trendLabel="vs previous period"
            variant="brand"
          />
          <StatCard
            label="Total Orders"
            value={data.totalOrders}
            icon={ShoppingCart}
            trend={data.ordersTrend}
            trendValue={data.ordersTrendValue}
            trendLabel="vs previous period"
          />
          <StatCard
            label="New Customers"
            value={data.newCustomers}
            icon={Users}
            trend="neutral"
            trendValue="—"
            trendLabel="First order in range"
          />
          <StatCard
            label="Avg. Order Value"
            value={formatCurrency(data.averageOrderValue)}
            icon={TrendingUp}
            trend="neutral"
            trendValue="—"
            trendLabel=""
          />
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4"
            >
              <Skeleton className="mb-4 h-5 w-40" />
              <Skeleton className="h-[280px] w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SectionCard title="Revenue Over Time">
            {data.revenueByDay.length === 0 ? (
              <EmptyState
                title="No data"
                description="No revenue data for this period"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.revenueByDay}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <RTooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Orders by Status">
            {data.ordersByStatus.length === 0 ? (
              <EmptyState
                title="No data"
                description="No orders for this period"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {data.ordersByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={statusColorLookup[entry.status] ?? "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Top 10 Products by Revenue">
            {data.topProductsByRevenue.length === 0 ? (
              <EmptyState title="No data" description="No product data" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topProductsByRevenue} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs"
                    width={120}
                    tickFormatter={(v) =>
                      v.length > 20 ? `${v.slice(0, 20)}…` : v
                    }
                  />
                  <RTooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Customer Growth">
            {data.customerGrowthByDay.length === 0 ? (
              <EmptyState
                title="No data"
                description="No first-time buyers in this period"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.customerGrowthByDay}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RTooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Inventory Value (Top 10)">
            {data.inventoryValue.length === 0 ? (
              <EmptyState title="No data" description="No inventory data" />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between py-2 px-3 border-b border-border">
                  <span className="text-sm font-medium text-muted-foreground">
                    Product
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Value
                  </span>
                </div>
                {data.inventoryValue.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-2 px-3 border-b border-border/50"
                  >
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </PageWrapper>
  );
};

export default AnalyticsPage;

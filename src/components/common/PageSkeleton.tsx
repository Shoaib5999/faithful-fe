import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/layout/PageWrapper";

type SkeletonVariant = "dashboard" | "table" | "cards" | "settings" | "editor";

interface PageSkeletonProps {
  variant?: SkeletonVariant;
}

const StatCardSkeleton = () => (
  <div className="rounded-xl border bg-card p-6 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);

const FilterBarSkeleton = () => (
  <div className="flex items-center gap-3 flex-wrap">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-10 w-36" />
  </div>
);

const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="rounded-lg border bg-card">
    <div className="border-b px-4 py-3 flex gap-6">
      {[120, 160, 100, 80, 60].map((w, i) => (
        <Skeleton key={i} className="h-4" style={{ width: w }} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="border-b last:border-0 px-4 py-3 flex gap-6 items-center">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[160px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-6 w-[60px] rounded-full" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="rounded-xl border bg-card p-6 space-y-4">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-[200px] w-full rounded-lg" />
  </div>
);

const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border bg-card overflow-hidden">
        <Skeleton className="h-40 w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-6">
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-10 w-28 rounded-md" />
  </div>
);

const DashboardSkeleton = () => (
  <>
    <HeaderSkeleton />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
      <div className="lg:col-span-3"><ChartSkeleton /></div>
      <div className="lg:col-span-2"><ChartSkeleton /></div>
    </div>
    <TableSkeleton rows={5} />
  </>
);

const TablePageSkeleton = () => (
  <>
    <HeaderSkeleton />
    <div className="mb-4"><FilterBarSkeleton /></div>
    <TableSkeleton />
  </>
);

const CardsPageSkeleton = () => (
  <>
    <HeaderSkeleton />
    <CardGridSkeleton />
  </>
);

const SettingsSkeleton = () => (
  <>
    <HeaderSkeleton />
    <div className="flex gap-2 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-md" />
      ))}
    </div>
    <TableSkeleton rows={4} />
  </>
);

const EditorSkeleton = () => (
  <>
    <HeaderSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  </>
);

const variants: Record<SkeletonVariant, React.FC> = {
  dashboard: DashboardSkeleton,
  table: TablePageSkeleton,
  cards: CardsPageSkeleton,
  settings: SettingsSkeleton,
  editor: EditorSkeleton,
};

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = "table" }) => {
  const VariantComponent = variants[variant];
  return (
    <PageWrapper>
      <VariantComponent />
    </PageWrapper>
  );
};

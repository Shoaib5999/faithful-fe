import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkeletonVariant } from "@/types/component.types";

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  rows?: number;
}

const TableSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
  <Card>
    <CardHeader>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-[25%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[15%]" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-[25%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[15%]" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const CardSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-5 w-[60%]" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const StatCardSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-[50%]" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-8 w-[40%]" />
        <Skeleton className="mt-3 h-4 w-[60%]" />
      </Card>
    ))}
  </div>
);

const FormSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-[30%]" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

const ListSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  rows = 5,
}) => {
  switch (variant) {
    case "table":
      return <TableSkeleton rows={rows} />;
    case "card":
      return <CardSkeleton />;
    case "statcard":
      return <StatCardSkeleton />;
    case "form":
      return <FormSkeleton rows={rows} />;
    case "list":
      return <ListSkeleton rows={rows} />;
  }
};

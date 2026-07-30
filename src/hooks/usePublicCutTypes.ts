import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicCutTypes,
  PUBLIC_CUT_TYPES_QK,
} from "@/services/cut-type-service";
import type { CutType } from "@/types/cut-type.types";

export const usePublicCutTypes = () => {
  const query = useQuery({
    queryKey: PUBLIC_CUT_TYPES_QK,
    queryFn: fetchPublicCutTypes,
    staleTime: 5 * 60 * 1000,
  });

  const types = query.data ?? [];
  const bySlug = new Map<string, CutType>(
    types.map((type) => [type.slug.toLowerCase(), type]),
  );
  const byName = new Map<string, CutType>(
    types.map((type) => [type.name.toLowerCase(), type]),
  );

  const resolveType = (value: string): CutType | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return bySlug.get(trimmed.toLowerCase()) ?? byName.get(trimmed.toLowerCase());
  };

  const resolveTypeLabel = (value: string): string =>
    resolveType(value)?.name ??
    value
      .trim()
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const resolveTypeImageUrl = (value: string): string | null =>
    resolveType(value)?.imageUrl ?? null;

  return {
    types,
    isLoading: query.isLoading,
    resolveType,
    resolveTypeLabel,
    resolveTypeImageUrl,
  };
};

import { MultiSelector } from "@/components/common/MultiSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FRESHNESS_TAG_PRESETS } from "@/constants/product-detail.constants";
import { buildCutTypeOptions } from "@/lib/cut-type-options";
import { EMPTY_STOREFRONT_META } from "@/lib/product-storefront-meta";
import type { ProductStorefrontMeta } from "@/types/product-storefront-meta";
import { fetchCutTypes, CUT_TYPES_QK } from "@/services/cut-type-service";

import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type ProductStorefrontFieldsProps = {
  meta: ProductStorefrontMeta;
  onChange: (meta: ProductStorefrontMeta) => void;
  cutTypes: string[];
  onCutTypesChange: (value: string[]) => void;
};

const togglePresetTag = (current: string[], tag: string): string[] => {
  const normalized = tag.trim();
  if (!normalized) return current;
  return current.includes(normalized)
    ? current.filter((item) => item !== normalized)
    : [...current, normalized];
};

const PresetChipRow = ({
  presets,
  selected,
  onToggle,
}: {
  presets: readonly string[];
  selected: string[];
  onToggle: (tag: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {presets.map((preset) => {
      const active = selected.includes(preset);
      return (
        <button
          key={preset}
          type="button"
          onClick={() => onToggle(preset)}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
            active
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40",
          )}
        >
          {preset}
        </button>
      );
    })}
  </div>
);

export const ProductStorefrontFields: React.FC<ProductStorefrontFieldsProps> = ({
  meta,
  onChange,
  cutTypes,
  onCutTypesChange,
}) => {
  const { data: cutTypeRecords = [] } = useQuery({
    queryKey: CUT_TYPES_QK,
    queryFn: fetchCutTypes,
  });

  const cutTypeOptions = buildCutTypeOptions(cutTypeRecords);

  const set = (patch: Partial<ProductStorefrontMeta>) =>
    onChange({ ...EMPTY_STOREFRONT_META, ...meta, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-muted-foreground">
        These fields power the public product page. Cut types are managed in Settings.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Cut types</Label>
          <MultiSelector
            options={cutTypeOptions}
            selected={cutTypes}
            onChange={onCutTypesChange}
            placeholder="Select one or more types"
            searchPlaceholder="Search types…"
          />
          <p className="text-xs text-muted-foreground">
            e.g. Curry Cut, Boneless, Whole.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cut info</Label>
          <Input
            value={meta.cutInfo ?? ""}
            onChange={(e) => set({ cutInfo: e.target.value })}
            placeholder="e.g. Boneless, skinless breast"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Origin / source</Label>
        <Input
          value={meta.origin ?? ""}
          onChange={(e) => set({ origin: e.target.value })}
          placeholder="e.g. Farm-sourced, Maharashtra"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Freshness tags</Label>
        <PresetChipRow
          presets={FRESHNESS_TAG_PRESETS}
          selected={meta.freshnessTags ?? []}
          onToggle={(tag) => set({ freshnessTags: togglePresetTag(meta.freshnessTags ?? [], tag) })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Storage instructions</Label>
        <Textarea
          rows={3}
          value={meta.storageInstructions ?? ""}
          onChange={(e) => set({ storageInstructions: e.target.value })}
          placeholder="Keep refrigerated at or below 4°C..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Cooking tips</Label>
        <Textarea
          rows={3}
          value={meta.cookingTips ?? ""}
          onChange={(e) => set({ cookingTips: e.target.value })}
          placeholder="Cook thoroughly to an internal temperature of..."
        />
      </div>
    </div>
  );
};

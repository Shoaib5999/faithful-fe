import { Check, ChevronDown } from "lucide-react";
import { storePanelClass } from "@/components/storefront/storefront-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  COLLECTION_SORT_OPTIONS,
  type CollectionSortId,
} from "@/constants/storefront.constants";
import { cn } from "@/lib/utils";

type CollectionSortMenuProps = {
  value: CollectionSortId;
  onChange: (value: CollectionSortId) => void;
};

export function CollectionSortMenu({ value, onChange }: CollectionSortMenuProps) {
  const label =
    COLLECTION_SORT_OPTIONS.find((opt) => opt.id === value)?.label ?? "Sort products";

  // modal={false} — Radix default locks scroll + adds body padding (navbar jump, right gap)
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Sort products"
          className={cn(
            storePanelClass,
            "flex h-10 min-w-[220px] items-center justify-between gap-2 px-3.5 py-2 font-store-body text-sm text-[var(--store-ink)] outline-none transition-[border-color,box-shadow] hover:border-[var(--store-red)]/50 focus-visible:border-[var(--store-red)] data-[state=open]:border-[var(--store-red)] data-[state=open]:shadow-[0_0_0_3px_rgba(184,149,74,0.12)]",
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--store-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(
          storePanelClass,
          "z-[100] min-w-[220px] p-1 font-store-body text-[var(--store-ink)] shadow-[var(--store-shadow-md)]",
          "animate-none data-[state=closed]:animate-none data-[state=open]:animate-none",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100",
        )}
      >
        {COLLECTION_SORT_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="relative cursor-pointer rounded-md py-2 pl-8 pr-3 focus:bg-[var(--store-cream)] focus:text-[var(--store-ink)]"
          >
            <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
              {value === opt.id ? <Check className="h-4 w-4" /> : null}
            </span>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

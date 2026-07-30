import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const CONTACT_SUBJECT_OPTIONS = [
  { id: "general", label: "General inquiry" },
  { id: "order", label: "Order support" },
  { id: "wholesale", label: "Wholesale" },
] as const;

export type ContactSubjectId = (typeof CONTACT_SUBJECT_OPTIONS)[number]["id"];

type ContactSubjectMenuProps = {
  value: ContactSubjectId;
  onChange: (value: ContactSubjectId) => void;
};

export function ContactSubjectMenu({ value, onChange }: ContactSubjectMenuProps) {
  const label =
    CONTACT_SUBJECT_OPTIONS.find((opt) => opt.id === value)?.label ?? "Select subject";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Subject"
          className="mt-2 flex h-11 w-full items-center justify-between gap-2 rounded-md border border-black/15 bg-white px-4 py-2 font-store-body text-sm text-[#1a1a1a] outline-none transition-colors hover:border-[#b8954a] focus-visible:border-[#b8954a] data-[state=open]:border-[#b8954a]"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          "z-[100] min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border border-black/15 bg-white p-1 font-store-body text-[#1a1a1a] shadow-md",
          "animate-none data-[state=closed]:animate-none data-[state=open]:animate-none",
        )}
      >
        {CONTACT_SUBJECT_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="relative cursor-pointer rounded-md py-2 pl-8 pr-3 focus:bg-[#f5f1ea] focus:text-[#1a1a1a]"
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

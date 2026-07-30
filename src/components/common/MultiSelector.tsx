import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common.types";

interface MultiSelectorProps {
  options: SelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  maxSelected?: number;
  /** Custom toggle when selected state is not 1:1 with option values (e.g. "ALL" sentinel). */
  resolveToggle?: (value: string, prev: string[]) => string[];
  isOptionSelected?: (value: string, selected: string[]) => boolean;
}

export const MultiSelector: React.FC<MultiSelectorProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  disabled = false,
  maxSelected,
  resolveToggle,
  isOptionSelected,
}) => {
  const [open, setOpen] = useState(false);

  const checkSelected = (value: string) =>
    isOptionSelected ? isOptionSelected(value, selected) : selected.includes(value);

  const isMaxReached = maxSelected !== undefined && selected.length >= maxSelected;

  const toggleOption = (value: string) => {
    if (resolveToggle) {
      onChange(resolveToggle(value, selected));
      return;
    }

    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (!isMaxReached) {
      onChange([...selected, value]);
    }
  };

  const removeItem = (value: string) => {
    if (resolveToggle) {
      onChange(resolveToggle(value, selected));
      return;
    }
    onChange(selected.filter((v) => v !== value));
  };

  const displayLabels = (() => {
    const matched = options.filter((o) => selected.includes(o.value));
    if (matched.length > 0) return matched;
    if (isOptionSelected) {
      return options.filter((o) => isOptionSelected(o.value, selected));
    }
    return matched;
  })();

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between gap-2 font-normal min-h-10 h-auto py-2 px-3",
            selected.length === 0 && displayLabels.length === 0 && "text-muted-foreground",
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
            {displayLabels.length === 0 && placeholder}
            {displayLabels.length > 0 && displayLabels.length <= 3 &&
              displayLabels.map((item) => (
                <Badge
                  key={item.value}
                  variant="secondary"
                  className="h-6 shrink-0 gap-0.5 px-2 text-xs font-normal"
                >
                  <span className="truncate">{item.label}</span>
                  <button
                    type="button"
                    className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.value);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            {displayLabels.length > 3 && (
              <Badge variant="secondary" className="h-6 text-xs font-normal">
                {displayLabels.length} selected
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 self-start">
            {(selected.length > 0 || displayLabels.length > 0) && (
              <button
                type="button"
                className="rounded-sm p-1 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                <X className="h-3.5 w-3.5 opacity-60" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList
            className="max-h-[200px] overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="overflow-visible p-1">
              {options.map((option) => {
                const isSelected = checkSelected(option.value);
                const isDisabled = !isSelected && isMaxReached;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggleOption(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      "rounded-md my-0.5 px-2 py-2",
                      isSelected && "bg-muted aria-selected:bg-muted",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-2 shrink-0"
                      tabIndex={-1}
                    />
                    <span className={cn("truncate", isDisabled && "opacity-50")}>
                      {option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

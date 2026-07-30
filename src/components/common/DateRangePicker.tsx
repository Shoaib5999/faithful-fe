import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangeValue {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value: DateRangeValue | null;
  onChange: (value: DateRangeValue | null) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  align = "start",
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(value ? { from: value.from, to: value.to } : undefined);
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    if (draft?.from) {
      onChange({ from: draft.from, to: draft.to });
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const displayValue =
    value?.from && value?.to
      ? `${format(value.from, "MMM d, yyyy")} – ${format(value.to, "MMM d, yyyy")}`
      : value?.from
        ? format(value.from, "MMM d, yyyy")
        : null;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !displayValue && "text-muted-foreground"
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {displayValue ?? placeholder}
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex flex-col gap-0 sm:flex-row">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!draft?.from}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

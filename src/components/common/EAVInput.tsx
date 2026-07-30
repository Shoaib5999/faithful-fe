import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NumberInput } from "./NumberInput";
import { SearchSelector } from "./SearchSelector";
import { MultiSelector } from "./MultiSelector";
import type { AttributeWithValue, AttributeValuePair } from "@/types/component.types";

interface EAVInputProps {
  attributes: AttributeWithValue[];
  onChange: (values: AttributeValuePair[]) => void;
  showErrors?: boolean;
}

export const EAVInput: React.FC<EAVInputProps> = ({
  attributes,
  onChange,
  showErrors = false,
}) => {
  const handleChange = (
    attrId: string,
    newValue: string | number | boolean | string[] | Date | null
  ) => {
    const updated: AttributeValuePair[] = attributes.map((attr) => ({
      attributeId: attr.id,
      value: attr.id === attrId ? newValue : attr.value,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {attributes.map((attr) => {
        const hasError = showErrors && attr.isRequired && (attr.value === null || attr.value === "" || attr.value === undefined);

        return (
          <div key={attr.id} className="space-y-1.5">
            <Label className="text-sm font-medium">
              {attr.name}
              {attr.isRequired && <span className="ml-0.5 text-destructive">*</span>}
            </Label>

            {attr.type === "text" && (
              <Input
                value={(attr.value as string) ?? ""}
                onChange={(e) => handleChange(attr.id, e.target.value)}
              />
            )}

            {attr.type === "number" && (
              <NumberInput
                value={(attr.value as number) ?? 0}
                onChange={(v) => handleChange(attr.id, v)}
              />
            )}

            {attr.type === "select" && (
              <SearchSelector
                options={(attr.options ?? []).map((o) => ({ label: o, value: o }))}
                value={(attr.value as string) ?? null}
                onChange={(v) => handleChange(attr.id, v)}
              />
            )}

            {attr.type === "multiselect" && (
              <MultiSelector
                options={(attr.options ?? []).map((o) => ({ label: o, value: o }))}
                selected={(attr.value as string[]) ?? []}
                onChange={(v) => handleChange(attr.id, v)}
              />
            )}

            {attr.type === "boolean" && (
              <Switch
                checked={(attr.value as boolean) ?? false}
                onCheckedChange={(v) => handleChange(attr.id, v)}
              />
            )}

            {attr.type === "date" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !attr.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {attr.value instanceof Date
                      ? format(attr.value, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={attr.value instanceof Date ? attr.value : undefined}
                    onSelect={(d) => handleChange(attr.id, d ?? null)}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}

            {hasError && (
              <span className="text-xs text-destructive">
                {attr.name} is required
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

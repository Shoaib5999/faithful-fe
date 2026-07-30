import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PRESETS = [
  "#16a34a",
  "#eab308",
  "#ef4444",
  "#3b82f6",
  "#6b7280",
  "#f97316",
  "#a855f7",
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
  disabled?: boolean;
}

const isValidHexColor = (hex: string): boolean => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presets,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const colorPresets = presets ?? DEFAULT_PRESETS;

  const handleInputBlur = () => {
    if (isValidHexColor(inputValue)) {
      onChange(inputValue);
    } else {
      setInputValue(value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 font-normal"
        >
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="start">
        <div className="grid grid-cols-7 gap-1.5">
          {colorPresets.map((color) => (
            <Button
              key={color}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md p-0"
              style={{ backgroundColor: color }}
              onClick={() => {
                onChange(color);
                setInputValue(color);
              }}
            >
              {color.toLowerCase() === value.toLowerCase() && (
                <Check className="h-3.5 w-3.5 text-white" />
              )}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-8 w-8 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: isValidHexColor(inputValue) ? inputValue : value }}
          />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputBlur();
            }}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

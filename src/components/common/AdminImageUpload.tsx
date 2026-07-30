import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Loader2, Link2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";

type AdminImageUploadProps = {
  label?: string;
  value: string | null;
  onChange: (url: string | null, storageKey?: string | null) => void;
  onUpload: (file: File) => Promise<{ url: string; storageKey: string }>;
  accept?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
  allowUrl?: boolean;
  urlPlaceholder?: string;
};

const isValidImageUrl = (raw: string): boolean => {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const AdminImageUpload: React.FC<AdminImageUploadProps> = ({
  label = "Image",
  value,
  onChange,
  onUpload,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  hint,
  className,
  disabled = false,
  allowUrl = false,
  urlPlaceholder = "https://example.com/note.jpg",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const result = await onUpload(file);
      onChange(result.url, result.storageKey);
      setUrlInput("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null, null);
    setUrlInput("");
    setError(null);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!isValidImageUrl(trimmed)) {
      setError("Enter a valid http(s) image URL");
      return;
    }
    setError(null);
    onChange(trimmed, null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label>{label}</Label>
      {value ? (
        <div className="relative inline-block w-fit">
          <img
            src={value}
            alt=""
            className="h-28 w-28 rounded-md border border-border object-cover"
          />
          {!disabled && (
            <button
              type="button"
              className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1 shadow-sm"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={cn(
            "flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors",
            !disabled && "hover:bg-muted/50",
            (disabled || isUploading) && "pointer-events-none opacity-60",
          )}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-[10px]">Upload</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={handleSelect}
          />
        </label>
      )}
      {!value && !isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Browse from computer
        </Button>
      )}
      {allowUrl && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-normal text-muted-foreground">Or paste image URL</Label>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={urlPlaceholder}
              disabled={disabled || isUploading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={disabled || isUploading || !urlInput.trim()}
              onClick={handleApplyUrl}
            >
              <Link2 className="mr-1.5 h-4 w-4" />
              Use URL
            </Button>
          </div>
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <InlineAlert type="error" message={error} />}
    </div>
  );
};

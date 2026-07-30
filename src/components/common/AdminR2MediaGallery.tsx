import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";
import type { BannerImage } from "@/types/cms.types";
import {
  deleteUploadAsset,
  listAllUploadAssets,
  uploadBannerImages,
} from "@/services/upload-service";
import { mergeBannerImages } from "@/lib/banner-utils";

type AdminR2MediaGalleryProps = {
  label?: string;
  folder?: string;
  images: BannerImage[];
  onChange: (images: BannerImage[]) => void;
  hint?: string;
  disabled?: boolean;
};

export const AdminR2MediaGallery: React.FC<AdminR2MediaGalleryProps> = ({
  label = "Banner images",
  folder = "banners",
  images,
  onChange,
  hint = "Stored in R2 under banners/. Delete removes the file from storage.",
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshFromR2 = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const resources = await listAllUploadAssets(folder);
      const fromR2: BannerImage[] = resources.map((r) => ({
        url: r.url,
        storageKey: r.storageKey,
      }));
      onChange(mergeBannerImages(images, fromR2));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = "";
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await uploadBannerImages(Array.from(files));
      const next: BannerImage[] = uploaded.map((item) => ({
        url: item.url,
        storageKey: item.storageKey,
      }));
      onChange(mergeBannerImages(images, next));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (storageKey: string) => {
    setDeletingKey(storageKey);
    setError(null);
    try {
      await deleteUploadAsset(storageKey);
      onChange(images.filter((img) => img.storageKey !== storageKey));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={disabled || isRefreshing}
          onClick={() => void refreshFromR2()}
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Load from R2
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No images yet. Upload or load from R2.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.storageKey}
              className="group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted"
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  aria-label="Delete image"
                  className="absolute right-1.5 top-1.5 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-md"
                  disabled={deletingKey === img.storageKey}
                  onClick={() => void handleDelete(img.storageKey)}
                >
                  {deletingKey === img.storageKey ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <label
        className={cn(
          "inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors",
          !disabled && "hover:bg-muted/50",
          (disabled || isUploading) && "pointer-events-none opacity-60",
        )}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{isUploading ? "Uploading…" : "Upload images"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={disabled || isUploading}
          onChange={handleUpload}
        />
      </label>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <InlineAlert type="error" message={error} />}
    </div>
  );
};

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cropImageToFile } from "@/lib/image-crop";

type ImageCropperDialogProps = {
  open: boolean;
  imageSrc: string | null;
  fileName: string;
  aspectRatio: number;
  aspectLabel?: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

export function ImageCropperDialog({
  open,
  imageSrc,
  fileName,
  aspectRatio,
  aspectLabel,
  onCancel,
  onConfirm,
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels, fileName);
      reset();
      onConfirm(file);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop image{aspectLabel ? ` — ${aspectLabel}` : ""}</DialogTitle>
        </DialogHeader>

        {imageSrc && (
          <div className="relative h-80 w-full overflow-hidden rounded-md bg-muted">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Zoom"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Drag to reposition, scroll or use the slider to zoom. The frame shows exactly what will
          be uploaded.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={processing || !croppedAreaPixels}>
            {processing ? "Applying…" : "Apply crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

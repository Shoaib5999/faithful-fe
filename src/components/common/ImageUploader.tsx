import React, { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortableItem } from "./SortableItem";
import { DragHandle } from "./DragHandle";
import type { UploadedImage } from "@/types/component.types";

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  multiple?: boolean;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  multiple = true,
  maxImages,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isMaxReached = maxImages !== undefined && images.length >= maxImages;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxImages !== undefined ? maxImages - images.length : files.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    const promises = filesToProcess.map(
      (file) =>
        new Promise<UploadedImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: crypto?.randomUUID()||Math.random().toString(36).substring(2, 15),
              url: reader.result as string,
              altText: file.name,
              isPrimary: images.length === 0 && !images.some((img) => img.isPrimary),
              sortOrder: images.length,
            });
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises).then((newImages) => {
      const hasPrimary = images.some((img) => img.isPrimary);
      const updated = newImages.map((img, idx) => ({
        ...img,
        isPrimary: !hasPrimary && idx === 0,
        sortOrder: images.length + idx,
      }));
      onChange([...images, ...updated]);
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const setPrimary = (id: string) => {
    onChange(images.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const removeImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered.map((img, idx) => ({ ...img, sortOrder: idx })));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    const reordered = [...images];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onChange(reordered.map((img, idx) => ({ ...img, sortOrder: idx })));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isMaxReached}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isMaxReached
          ? `Maximum ${maxImages} images reached`
          : "Upload Images"}
      </Button>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {images.map((image) => (
                <SortableItem key={image.id} id={image.id}>
                  {({ listeners, attributes }) => (
                    <div
                      className={cn(
                        "group relative overflow-hidden rounded-lg border bg-card",
                        image.isPrimary && "border-primary border-2"
                      )}
                    >
                      <AspectRatio ratio={1}>
                        <img
                          src={image.url}
                          alt={image.altText}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPrimary(image.id)}
                          >
                            <Star className={cn("h-4 w-4", image.isPrimary && "fill-primary text-primary")} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeImage(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <DragHandle listeners={listeners} attributes={attributes} />
                        </div>
                      </AspectRatio>
                      {image.isPrimary && (
                        <Badge className="absolute left-1 top-1 text-[10px]" variant="default">
                          Primary
                        </Badge>
                      )}
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

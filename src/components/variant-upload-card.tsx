import { useRef, useState, type DragEvent } from "react";
import { ImageUp, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DraftVariant } from "@/lib/types";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 4096;

type UploadError =
  | "Upload a PNG or JPG image."
  | "Image must be 10 MB or smaller."
  | "Image dimensions must not exceed 4096 × 4096 px.";

function validateFile(file: File): UploadError | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Upload a PNG or JPG image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be 10 MB or smaller.";
  }
  return null;
}

function validateDimensions(
  width: number,
  height: number,
): "Image dimensions must not exceed 4096 × 4096 px." | null {
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return "Image dimensions must not exceed 4096 × 4096 px.";
  }
  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export interface VariantUploadCardProps {
  variant: DraftVariant;
  index: number;
  canRemove: boolean;
  error?: string | undefined;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onScreenshotChange: (dataUrl: string) => void;
  onScreenshotRemove: () => void;
  onRemoveVariant?: () => void;
}

export function VariantUploadCard({
  variant,
  index,
  canRemove,
  error: externalError,
  onNameChange,
  onDescriptionChange,
  onScreenshotChange,
  onScreenshotRemove,
  onRemoveVariant,
}: VariantUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<UploadError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const displayError = externalError ?? internalError;

  async function processFile(file: File) {
    setInternalError(null);

    const fileError = validateFile(file);
    if (fileError) {
      setInternalError(fileError);
      return;
    }

    setIsLoading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { width, height } = await getImageDimensions(dataUrl);
      const dimError = validateDimensions(width, height);
      if (dimError) {
        setInternalError(dimError);
        setIsLoading(false);
        return;
      }
      onScreenshotChange(dataUrl);
    } catch {
      setInternalError("Upload a PNG or JPG image.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    e.target.value = "";
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
  }

  const inputId = `variant-name-${variant.id}`;
  const descId = `variant-desc-${variant.id}`;
  const fileInputId = `variant-file-${variant.id}`;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-card">
      {/* Header: name + remove */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Label htmlFor={inputId} className="sr-only">
            Variant {index + 1} name
          </Label>
          <Input
            id={inputId}
            value={variant.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={`Variant ${String.fromCharCode(65 + index)}`}
            className="border-0 px-0 text-base font-semibold text-foreground focus-visible:ring-0"
          />
        </div>
        {canRemove && onRemoveVariant && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemoveVariant}
            aria-label={`Remove ${variant.name} from experiment`}
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Upload area or preview */}
      <div className="mt-4">
        {variant.screenshotUrl ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-md border border-border bg-surface">
              <img
                src={variant.screenshotUrl}
                alt={`${variant.name} screenshot`}
                className="max-h-80 w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openFilePicker}>
                <RotateCcw className="size-3.5" />
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onScreenshotRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label={`Upload screenshot for ${variant.name}`}
            onClick={openFilePicker}
            onKeyDown={handleKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-10 text-center transition-colors",
              isDragging
                ? "border-primary bg-accent"
                : "border-border-strong bg-surface hover:border-primary/50",
            )}
          >
            <ImageUp className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {isLoading ? "Loading…" : "Drag & drop a screenshot or click to upload"}
            </span>
            <span className="text-xs text-muted-foreground">PNG or JPG · max 10 MB</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileInputChange}
          className="sr-only"
          aria-label={`File input for ${variant.name} screenshot`}
        />

        {displayError && (
          <p role="alert" className="mt-2 text-xs font-medium text-destructive">
            {displayError}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mt-4">
        <Label htmlFor={descId} className="mb-1.5 block text-sm font-medium">
          Description
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">Optional</span>
        </Label>
        <Textarea
          id={descId}
          rows={2}
          value={variant.description ?? ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g. Current design"
        />
      </div>
    </div>
  );
}

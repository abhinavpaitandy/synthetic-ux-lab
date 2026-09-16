import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Pill } from "@/components/status-badge";
import { TargetOverlayPreview } from "@/components/target-overlay-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isTargetReviewed, type BoundingBox, type DraftVariant } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  unreviewed: "Needs review",
  confirmed: "Confirmed",
  adjusted: "Adjusted",
  "low-confidence": "Low-confidence detection",
};

const STATUS_TONE: Record<string, "neutral" | "success" | "info" | "warning"> = {
  unreviewed: "neutral",
  confirmed: "success",
  adjusted: "info",
  "low-confidence": "warning",
};

const MIN_PERCENT = 2;

export interface TargetReviewCardProps {
  variant: DraftVariant;
  onConfirm: () => void;
  onAdjust: (box: BoundingBox) => void;
}

export function TargetReviewCard({ variant, onConfirm, onAdjust }: TargetReviewCardProps) {
  const target = variant.detectedTarget!;
  const [adjustMode, setAdjustMode] = useState(false);
  const [draftBox, setDraftBox] = useState<BoundingBox>(target.boundingBox);
  const [savedBox, setSavedBox] = useState<BoundingBox>(target.boundingBox);

  const reviewed = isTargetReviewed(target);
  const isLowConfidence = target.status === "low-confidence";

  function enterAdjustMode() {
    setSavedBox(target.boundingBox);
    setDraftBox(target.boundingBox);
    setAdjustMode(true);
  }

  function cancelAdjust() {
    setDraftBox(savedBox);
    setAdjustMode(false);
  }

  function saveAdjust() {
    onAdjust(draftBox);
    setAdjustMode(false);
  }

  const [drawError, setDrawError] = useState(false);

  function handleBoxChange(box: BoundingBox) {
    setDraftBox(box);
    setDrawError(false);
  }

  function handleDrawEnd() {
    // Drawing completed — keep draftBox as-is, user clicks Save
  }

  function handleDrawCancel() {
    setDraftBox(savedBox);
    setDrawError(true);
  }

  function handlePercentChange(field: keyof BoundingBox, value: number) {
    const clamped = Math.max(0, Math.min(100, value));
    const normalized = clamped / 100;
    const next: BoundingBox = { ...draftBox, [field]: normalized };

    // Validate: x + width <= 1, y + height <= 1
    if (next.x + next.width > 1) next.x = Math.max(0, 1 - next.width);
    if (next.y + next.height > 1) next.y = Math.max(0, 1 - next.height);

    setDraftBox(next);
  }

  const percentValues = {
    x: Math.round(draftBox.x * 100),
    y: Math.round(draftBox.y * 100),
    width: Math.round(draftBox.width * 100),
    height: Math.round(draftBox.height * 100),
  };

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-card">
      {/* Variant name */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{variant.name}</h3>
        <Pill tone={STATUS_TONE[target.status]}>{STATUS_LABELS[target.status]}</Pill>
      </div>

      {/* Screenshot with overlay */}
      <div className="mt-4">
        <TargetOverlayPreview
          screenshotUrl={variant.screenshotUrl!}
          boundingBox={adjustMode ? draftBox : target.boundingBox}
          adjustMode={adjustMode}
          onBoxChange={handleBoxChange}
          onDrawEnd={handleDrawEnd}
          onDrawCancel={handleDrawCancel}
          alt={`${variant.name} screenshot with detected target overlay`}
        />
      </div>

      {/* Low-confidence warning */}
      {isLowConfidence && !adjustMode && (
        <p className="mt-3 text-xs font-medium text-warning-foreground">
          Low-confidence detection — please review this target.
        </p>
      )}

      {/* Target info */}
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground">Detected target</span>
          <span className="text-right text-sm font-medium text-foreground">{target.label}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs text-muted-foreground">Target detection confidence</span>
          <span className="tabular text-sm font-medium text-foreground">
            {Math.round(target.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Adjust mode: numeric inputs */}
      {adjustMode && (
        <div className="mt-4 space-y-3 rounded-md border border-border bg-surface p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Fine-tune the target position (percentages)
          </p>
          <div className="grid grid-cols-4 gap-2">
            <PercentInput
              idPrefix={`target-${variant.id}`}
              label="X"
              value={percentValues.x}
              onChange={(v) => handlePercentChange("x", v)}
            />
            <PercentInput
              idPrefix={`target-${variant.id}`}
              label="Y"
              value={percentValues.y}
              onChange={(v) => handlePercentChange("y", v)}
            />
            <PercentInput
              idPrefix={`target-${variant.id}`}
              label="Width"
              value={percentValues.width}
              onChange={(v) => handlePercentChange("width", v)}
            />
            <PercentInput
              idPrefix={`target-${variant.id}`}
              label="Height"
              value={percentValues.height}
              onChange={(v) => handlePercentChange("height", v)}
            />
          </div>
          {drawError ? (
            <p role="alert" className="text-xs text-destructive">
              Target area is too small. Draw a larger area.
            </p>
          ) : percentValues.width < MIN_PERCENT || percentValues.height < MIN_PERCENT ? (
            <p role="alert" className="text-xs text-destructive">
              Target area is too small. Increase width and height.
            </p>
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {!adjustMode ? (
          <>
            {!reviewed || target.status === "low-confidence" ? (
              <Button size="sm" onClick={onConfirm} disabled={target.status === "confirmed"}>
                <Check className="size-3.5" />
                Confirm
              </Button>
            ) : null}
            {target.status === "confirmed" && (
              <Button size="sm" variant="outline" disabled>
                <Check className="size-3.5" />
                Confirmed
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={enterAdjustMode}>
              <Pencil className="size-3.5" />
              Adjust
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              onClick={saveAdjust}
              disabled={percentValues.width < MIN_PERCENT || percentValues.height < MIN_PERCENT}
            >
              <Check className="size-3.5" />
              Save Adjustment
            </Button>
            <Button size="sm" variant="outline" onClick={cancelAdjust}>
              <X className="size-3.5" />
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function PercentInput({
  idPrefix,
  label,
  value,
  onChange,
}: {
  idPrefix: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const fieldKey = label.toLowerCase();
  const inputId = `${idPrefix}-${fieldKey}`;
  return (
    <div>
      <Label htmlFor={inputId} className="mb-1 block text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={inputId}
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tabular h-8 text-xs"
      />
    </div>
  );
}

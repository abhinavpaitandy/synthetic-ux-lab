import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";
import type { BoundingBox } from "@/lib/types";

const MIN_SIZE = 0.02;

export interface TargetOverlayPreviewProps {
  screenshotUrl: string;
  boundingBox: BoundingBox;
  /** When true, user can draw a replacement rectangle */
  adjustMode: boolean;
  /** Live bounding box during drawing — controlled by parent */
  onBoxChange: (box: BoundingBox) => void;
  /** Called when drawing completes (pointer up) */
  onDrawEnd: () => void;
  alt: string;
}

export function TargetOverlayPreview({
  screenshotUrl,
  boundingBox,
  adjustMode,
  onBoxChange,
  onDrawEnd,
  alt,
}: TargetOverlayPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawBox, setDrawBox] = useState<BoundingBox | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function getRelativeCoords(e: ReactPointerEvent<HTMLDivElement>): { x: number; y: number } {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!adjustMode) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const point = getRelativeCoords(e);
    setDrawStart(point);
    setDrawBox({ x: point.x, y: point.y, width: 0, height: 0 });
    setIsDrawing(true);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!adjustMode || !isDrawing || !drawStart) return;
    e.preventDefault();
    const point = getRelativeCoords(e);
    const x = Math.min(drawStart.x, point.x);
    const y = Math.min(drawStart.y, point.y);
    const width = Math.abs(point.x - drawStart.x);
    const height = Math.abs(point.y - drawStart.y);
    const box: BoundingBox = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      width: Math.max(0, Math.min(1 - x, width)),
      height: Math.max(0, Math.min(1 - y, height)),
    };
    setDrawBox(box);
    onBoxChange(box);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!adjustMode || !isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    setDrawStart(null);

    if (drawBox && drawBox.width >= MIN_SIZE && drawBox.height >= MIN_SIZE) {
      onDrawEnd();
    } else {
      setDrawBox(null);
    }
  }

  const displayBox = isDrawing && drawBox ? drawBox : boundingBox;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-md border border-border bg-surface"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: adjustMode ? "none" : "auto" }}
    >
      <img
        src={screenshotUrl}
        alt={alt}
        className={cn(
          "block w-full select-none",
          adjustMode ? "cursor-crosshair" : "cursor-default",
        )}
        draggable={false}
      />
      {/* Target overlay rectangle */}
      <div
        className={cn(
          "pointer-events-none absolute border-2",
          adjustMode
            ? "border-primary bg-primary/15"
            : displayBox === boundingBox && boundingBox === drawBox
              ? "border-primary bg-primary/15"
              : "border-primary bg-primary/10",
        )}
        style={{
          left: `${displayBox.x * 100}%`,
          top: `${displayBox.y * 100}%`,
          width: `${displayBox.width * 100}%`,
          height: `${displayBox.height * 100}%`,
        }}
      >
        <span className="absolute -top-5 left-0 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          Target
        </span>
      </div>
      {adjustMode && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-foreground/80 px-2 py-1 text-[10px] text-background">
          Draw a rectangle to set the target area
        </div>
      )}
    </div>
  );
}

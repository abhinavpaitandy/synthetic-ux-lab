import type { DetectedTarget, DraftVariant } from "./types";

/**
 * Deterministic mock target generation for the prototype phase.
 *
 * Produces the same DetectedTarget for the same variant index on every call.
 * Does NOT analyse actual uploaded pixels.
 */

const MOCK_BOXES: { x: number; y: number; width: number; height: number }[] = [
  { x: 0.12, y: 0.48, width: 0.76, height: 0.12 },
  { x: 0.1, y: 0.42, width: 0.8, height: 0.14 },
  { x: 0.14, y: 0.55, width: 0.72, height: 0.11 },
];

const MOCK_CONFIDENCE: number[] = [0.82, 0.94, 0.64];

/**
 * Derives a target label from the success event.
 *
 * Strategy: take the first few meaningful words from the success event,
 * stripping common trailing verbs like "is selected" / "is clicked".
 * Falls back to "Expected action" if the success event is empty.
 */
export function deriveTargetLabel(successEvent: string): string {
  if (!successEvent.trim()) return "Expected action";

  const lower = successEvent.trim();
  const trailing = /\s+(is\s+)?(selected|clicked|pressed|tapped|completed|submitted|confirmed)$/i;
  const cleaned = lower.replace(trailing, "").trim();

  if (!cleaned) return "Expected action";

  const words = cleaned.split(/\s+/);
  return words.slice(0, 4).join(" ");
}

export function generateMockTarget(
  variant: DraftVariant,
  index: number,
  successEvent: string,
): DetectedTarget {
  const safeIndex = index >= 0 && index < MOCK_BOXES.length ? index : 0;
  const box = MOCK_BOXES[safeIndex]!;
  const confidence = MOCK_CONFIDENCE[safeIndex]!;

  return {
    label: deriveTargetLabel(successEvent),
    boundingBox: box,
    confidence,
    status: confidence < 0.7 ? "low-confidence" : "unreviewed",
  };
}

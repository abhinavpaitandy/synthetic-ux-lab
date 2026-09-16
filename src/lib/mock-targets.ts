import type { DetectedTarget, BoundingBox } from "./types";

/**
 * Deterministic mock target generation for the prototype phase.
 *
 * Produces the same DetectedTarget for the same variant index on every call.
 * Does NOT analyse actual uploaded pixels.
 */

const MOCK_BOXES: BoundingBox[] = [
  { x: 0.12, y: 0.48, width: 0.76, height: 0.12 },
  { x: 0.1, y: 0.42, width: 0.8, height: 0.14 },
  { x: 0.14, y: 0.55, width: 0.72, height: 0.11 },
];

const MOCK_CONFIDENCE: number[] = [0.82, 0.94, 0.64];

/**
 * Derives a target label from the success event.
 *
 * Strategy: strip trailing punctuation (`.`, `!`, `?`) and common action
 * verbs like "is selected" / "clicked" / "tapped", then take the first
 * few meaningful words. Falls back to "Expected action" if empty.
 */
export function deriveTargetLabel(successEvent: string): string {
  if (!successEvent.trim()) return "Expected action";

  const text = successEvent.trim();

  // Strip trailing punctuation
  const withoutPunctuation = text.replace(/[.!?]+$/, "").trim();
  if (!withoutPunctuation) return "Expected action";

  // Strip common action-verb endings
  const trailing = /\s+(is\s+)?(selected|clicked|pressed|tapped|completed|submitted|confirmed)$/i;
  const cleaned = withoutPunctuation.replace(trailing, "").trim();
  if (!cleaned) return "Expected action";

  const words = cleaned.split(/\s+/);
  return words.slice(0, 4).join(" ");
}

export function generateMockTarget(index: number, successEvent: string): DetectedTarget {
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

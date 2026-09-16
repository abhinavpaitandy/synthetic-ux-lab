/**
 * Mock data layer for Synthetic UX Lab.
 *
 * Re-exports the clean domain types from types.ts and provides static mock
 * experiments that carry BOTH the new Snapshot model fields and legacy fields
 * (simulationSize, stage, owner, successCriteria, VariantMetrics, etc.) so the
 * current Dashboard, Results, and MCP tools keep rendering without changes.
 *
 * When screens are migrated in later tasks, they will switch to importing the
 * clean types directly from types.ts and the legacy fields can be removed.
 */

import type {
  Experiment as CleanExperiment,
  ExperimentType,
  ExperimentStatus,
  EvidenceConfidence,
  SnapshotVariantMetrics,
  SnapshotExperimentResults,
  BehaviouralCohortResult,
  ObservedIssue,
  ClickPoint,
  DetectedTarget,
  DeviceType,
  PilotSize,
  BehaviourDiversity,
} from "./types";

export type {
  ExperimentType,
  EvidenceConfidence,
  SnapshotVariantMetrics,
  SnapshotExperimentResults,
  BehaviouralCohortResult,
  ObservedIssue,
  ClickPoint,
  DetectedTarget,
  DeviceType,
  PilotSize,
  BehaviourDiversity,
} from "./types";

// ─── Legacy aliases (kept for backwards compatibility) ───────────

export type Confidence = "high" | "medium" | "low";
export type SimulationStage = "pilot" | "test";

/**
 * Legacy flow-test metrics. These belong to the future Flow Test capability,
 * NOT the Snapshot / Decision Test MVP. Retained temporarily so the current
 * Results screen keeps rendering.
 */
export interface VariantMetrics {
  taskSuccess: number;
  errorFreeSessions: number;
  interactionEfficiency: number;
  correctFirstAction: number;
  backtracking: number;
  abandonment: number;
}

export interface UsabilityIssue {
  id: string;
  variantId: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

export interface BehaviouralSegment {
  id: string;
  name: string;
  share: number;
  summary: string;
  bestVariantId: string;
}

// ─── Extended Variant with both new and legacy fields ─────────────

export interface Variant {
  id: string;
  name: string;
  description: string;
  source: string;
  /** New: screenshot URL for snapshot experiments */
  screenshotUrl?: string;
  /** New: AI-detected interaction target */
  detectedTarget?: DetectedTarget;
  /** New: whether the researcher confirmed the detected target */
  targetConfirmed?: boolean;
  /** Legacy: flow-test metrics (future capability) */
  metrics?: VariantMetrics;
}

// ─── Extended Experiment with both new and legacy fields ──────────

export interface Experiment extends Omit<CleanExperiment, "variants"> {
  /** Legacy: used by Dashboard and Results until migrated */
  simulationSize: number;
  /** Legacy: used by Dashboard and Results until migrated */
  stage: SimulationStage;
  /** Legacy: used by Dashboard and Results until migrated */
  owner: string;
  /** Legacy: used by Results ContextCard until migrated */
  successCriteria: string;
  /** Override variants to use the extended Variant type */
  variants: Variant[];
  /**
   * Legacy results shape. New code should use `snapshotResults` instead.
   * Kept so the current Results screen and MCP tools keep working.
   */
  results?: {
    winnerVariantId: string;
    confidence: Confidence;
    rationale: string;
    recommendation: string;
    issues: UsabilityIssue[];
    segments: BehaviouralSegment[];
  };
  /** New: clean snapshot results */
  snapshotResults?: SnapshotExperimentResults;
}

// ─── Constants ────────────────────────────────────────────────────

export const PILOT_SIZES = [100, 500, 1000] as const;
export const TEST_SIZES = [10000, 100000, 1000000, 10000000] as const;

export const EXPERIMENT_TYPES: {
  value: ExperimentType;
  label: string;
  enabled: boolean;
}[] = [
  { value: "snapshot", label: "Snapshot / Decision Test", enabled: true },
  { value: "flow", label: "Flow Test", enabled: false },
];

/**
 * Legacy metric definitions for the current Results screen.
 * These are Flow Test metrics, not Snapshot MVP metrics.
 */
export const METRIC_DEFS: {
  key: keyof VariantMetrics;
  label: string;
  unit: string;
  lowerIsBetter?: boolean;
  help: string;
}[] = [
  {
    key: "taskSuccess",
    label: "Task success",
    unit: "%",
    help: "Simulated sessions that completed the defined task.",
  },
  {
    key: "errorFreeSessions",
    label: "Error-free sessions",
    unit: "%",
    help: "Sessions completed without a recovery or validation error.",
  },
  {
    key: "interactionEfficiency",
    label: "Interaction efficiency",
    unit: "idx",
    help: "Index of steps taken versus the optimal path (100 = optimal).",
  },
  {
    key: "correctFirstAction",
    label: "Correct first action",
    unit: "%",
    help: "Discoverability: first interaction was on the intended control.",
  },
  {
    key: "backtracking",
    label: "Backtracking",
    unit: "%",
    lowerIsBetter: true,
    help: "Sessions that reversed a step or returned to a prior screen.",
  },
  {
    key: "abandonment",
    label: "Abandonment",
    unit: "%",
    lowerIsBetter: true,
    help: "Sessions that stopped before reaching the success criteria.",
  },
];

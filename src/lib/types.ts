/**
 * Domain model for the Synthetic UX Lab MVP.
 *
 * All types in this file are the clean data contract that new screens
 * (Setup, Variants, Targets, Simulation, Results v2, Admin) will depend on.
 * The old mock-data.ts re-exports compatibility aliases so the current
 * Dashboard and Results screens keep rendering until they are migrated.
 *
 * Coordinate convention: all bounding-box and click-point values use
 * NORMALIZED coordinates in the range 0–1, relative to the screenshot's
 * width and height. This makes overlays resolution-independent.
 */

// ─── Experiment type ───────────────────────────────────────────────

export type ExperimentType = "snapshot" | "flow";

// ─── Status ───────────────────────────────────────────────────────

export type ExperimentStatus = "draft" | "running" | "complete";

// ─── Device ───────────────────────────────────────────────────────

export type DeviceType = "mobile" | "desktop";

// ─── Pilot scale ──────────────────────────────────────────────────

export type PilotSize = 100 | 500 | 1000;

// ─── Behaviour diversity ──────────────────────────────────────────

export type BehaviourDiversity = "low" | "medium" | "high";

// ─── Evidence confidence ──────────────────────────────────────────

export type EvidenceConfidence = "high" | "medium" | "low" | "inconclusive";

// ─── Detected target ──────────────────────────────────────────────

export type TargetStatus = "unreviewed" | "confirmed" | "adjusted" | "low-confidence";

export interface BoundingBox {
  /** Normalized 0–1, relative to screenshot width */
  x: number;
  /** Normalized 0–1, relative to screenshot height */
  y: number;
  /** Normalized 0–1, relative to screenshot width */
  width: number;
  /** Normalized 0–1, relative to screenshot height */
  height: number;
}

export interface DetectedTarget {
  label: string;
  boundingBox: BoundingBox;
  /** 0–1 confidence score from the detection model */
  confidence: number;
  /**
   * Single source of truth for target review state.
   * Do not maintain a separate boolean — use `isTargetReviewed()` to check.
   */
  status: TargetStatus;
}

/** Returns true when the researcher has reviewed (confirmed or adjusted) the target. */
export function isTargetReviewed(target: DetectedTarget): boolean {
  return target.status === "confirmed" || target.status === "adjusted";
}

// ─── Variant ──────────────────────────────────────────────────────

export interface Variant {
  id: string;
  name: string;
  description?: string;
  screenshotUrl?: string;
  detectedTarget?: DetectedTarget;
}

export interface DraftVariant {
  id: string;
  name: string;
  description?: string | undefined;
  screenshotUrl?: string | undefined;
  detectedTarget?: DetectedTarget | undefined;
}

// ─── Snapshot metrics ─────────────────────────────────────────────

export interface SnapshotVariantMetrics {
  /** % of sessions where the first action was on the intended control */
  correctFirstAction: number;
  /** % of sessions that selected the correct target element */
  correctTargetSelection: number;
  /** % of sessions that interacted with the wrong element (lower is better) */
  confusionRate: number;
  /** % of sessions that took no action within the decision window (lower is better) */
  noActionRate: number;
  /** Average agent certainty 0–100 (informational, not a winning metric) */
  averageAgentCertainty: number;
}

export interface SnapshotMetricDef {
  key: keyof SnapshotVariantMetrics;
  label: string;
  unit: string;
  lowerIsBetter?: boolean;
  help: string;
  /** "informational" metrics are shown but never used to pick a winner */
  role: "decision" | "informational";
}

export const SNAPSHOT_METRIC_DEFS: SnapshotMetricDef[] = [
  {
    key: "correctFirstAction",
    label: "Correct first action",
    unit: "%",
    help: "Discoverability: first interaction was on the intended control.",
    role: "decision",
  },
  {
    key: "correctTargetSelection",
    label: "Correct target selection",
    unit: "%",
    help: "Sessions that selected the correct target element.",
    role: "decision",
  },
  {
    key: "confusionRate",
    label: "Confusion rate",
    unit: "%",
    lowerIsBetter: true,
    help: "Sessions that interacted with the wrong element.",
    role: "decision",
  },
  {
    key: "noActionRate",
    label: "No-action rate",
    unit: "%",
    lowerIsBetter: true,
    help: "Sessions that took no action within the decision window.",
    role: "decision",
  },
  {
    key: "averageAgentCertainty",
    label: "Agent certainty",
    unit: "%",
    help: "Average simulated agent confidence in its choice (informational).",
    role: "informational",
  },
];

// ─── Behavioural cohorts ──────────────────────────────────────────

export interface BehaviouralCohortResult {
  id: string;
  name: string;
  /** % of simulated population */
  share: number;
  /** variantId → score 0–100 */
  variantScores: Record<string, number>;
  summary?: string;
}

// ─── Observed issues ──────────────────────────────────────────────

export interface ObservedIssue {
  id: string;
  variantId?: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  /** % of sessions affected (optional) */
  affectedShare?: number;
}

// ─── Synthetic click data ─────────────────────────────────────────

export interface ClickPoint {
  /** Normalized 0–1, relative to screenshot width */
  x: number;
  /** Normalized 0–1, relative to screenshot height */
  y: number;
  correct: boolean;
  cohortId?: string;
}

// ─── Snapshot experiment results ──────────────────────────────────

export interface SnapshotExperimentResults {
  /** Optional — may be absent when there is no clear winner */
  predictedWinnerVariantId?: string;
  evidenceConfidence: EvidenceConfidence;
  primaryDifference?: string;
  recommendation: string;
  /** variantId → metrics */
  variantMetrics: Record<string, SnapshotVariantMetrics>;
  behaviouralCohorts: BehaviouralCohortResult[];
  observedIssues: ObservedIssue[];
  /** variantId → click points */
  clickPoints: Record<string, ClickPoint[]>;
  rationale?: string;
}

// ─── Experiment ───────────────────────────────────────────────────

export interface Experiment {
  id: string;
  name: string;
  type: ExperimentType;
  status: ExperimentStatus;
  persona: string;
  task: string;
  successEvent: string;
  hypothesis?: string;
  device: DeviceType;
  variants: Variant[];
  pilotSize: PilotSize;
  behaviourDiversity: BehaviourDiversity;
  createdAt: string;
  updatedAt: string;
  results?: SnapshotExperimentResults;
}

// ─── Experiment draft ─────────────────────────────────────────────

export interface ExperimentDraft {
  name: string;
  persona: string;
  task: string;
  successEvent: string;
  hypothesis?: string;
  device: DeviceType;
  variants: DraftVariant[];
  pilotSize: PilotSize;
  behaviourDiversity: BehaviourDiversity;
}

// ─── Admin settings ───────────────────────────────────────────────

export interface GeneralSettings {
  defaultDevice: DeviceType;
  defaultPilotSize: PilotSize;
  defaultBehaviourDiversity: BehaviourDiversity;
  minVariants: number;
  maxVariants: number;
  maxUploadSizeMb: number;
  supportedImageTypes: string[];
  maxImageWidth: number;
  maxImageHeight: number;
}

export interface AISettings {
  provider: "openrouter" | "groq" | "mock";
  modelId: string;
  visionCapable: boolean;
  temperature: number;
  /** Never store the actual key — just whether one is on file */
  apiKeyConfigured: boolean;
}

export interface SimulationSettings {
  batchSize: number;
  concurrency: number;
  maxRetries: number;
  timeoutSeconds: number;
  retryOnTimeout: boolean;
  retryOnRateLimit: boolean;
  retryOnInvalidJson: boolean;
}

export type BehaviourDimensionKey =
  | "digitalFamiliarity"
  | "attentionSpan"
  | "patience"
  | "interactionStyle"
  | "urgency"
  | "riskTolerance"
  | "readingDepth"
  | "explorationTendency"
  | "goalCommitment";

export interface BehaviourDimension {
  key: BehaviourDimensionKey;
  label: string;
  description: string;
}

export interface CohortTemplate {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  /** weight 0–100; enabled templates should sum to 100 */
  weight: number;
}

export interface PopulationSettings {
  dimensions: BehaviourDimension[];
  cohortTemplates: CohortTemplate[];
}

export interface EvaluationSettings {
  minSimulationsForWinner: number;
  statisticalSignificanceThreshold: number;
  minWinningMarginPp: number;
  /** Which snapshot metrics are active */
  activeSnapshotMetrics: (keyof SnapshotVariantMetrics)[];
  /** Metrics marked informational are shown but not used to pick a winner */
  informationalMetrics: (keyof SnapshotVariantMetrics)[];
}

export interface FeatureFlags {
  snapshotTesting: boolean;
  flowTesting: boolean;
  htmlUrlVariants: boolean;
  interactivePrototypeTesting: boolean;
  testMode: boolean;
  statsigIntegration: boolean;
  syntheticHeatmaps: boolean;
  aiTargetDetection: boolean;
  manualTargetAdjustment: boolean;
  reportAgent: boolean;
}

export interface AdminSettings {
  configVersion: number;
  lastUpdated: string;
  general: GeneralSettings;
  ai: AISettings;
  simulation: SimulationSettings;
  population: PopulationSettings;
  evaluation: EvaluationSettings;
  features: FeatureFlags;
}

/**
 * Patch model for partial nested updates.
 * Each section is individually optional and its fields are partial,
 * so callers can update a single field without supplying the whole section.
 */
export interface AdminSettingsPatch {
  general?: Partial<GeneralSettings>;
  ai?: Partial<AISettings>;
  simulation?: Partial<SimulationSettings>;
  population?: Partial<PopulationSettings>;
  evaluation?: Partial<EvaluationSettings>;
  features?: Partial<FeatureFlags>;
}

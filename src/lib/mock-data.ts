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

// ─── Mock experiments ─────────────────────────────────────────────
//
// Five experiments covering: complete (high), complete (medium),
// complete (inconclusive), running, draft.

// 1. Completed — High evidence, 3 variants, winner = B
const checkoutExperiment: Experiment = {
  id: "exp-1042",
  name: "Checkout — one-page vs. stepped flow",
  type: "snapshot",
  status: "complete",
  persona:
    "First-time buyer on mobile, moderate digital confidence, shopping during a work break and easily distracted.",
  task: "Purchase a single in-stock item using a saved address and a new payment card.",
  successEvent: "Order confirmation reached with no validation error on the payment step.",
  hypothesis:
    "A single-page checkout with inline validation will reduce confusion and no-action rates compared to a stepped flow.",
  device: "mobile",
  pilotSize: 1000,
  behaviourDiversity: "high",
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-27T14:20:00Z",
  // Legacy
  simulationSize: 1000,
  stage: "pilot",
  owner: "Nadia Okafor",
  successCriteria:
    "Order confirmation reached in under 6 steps with no validation error on the payment step.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Current production checkout — three separate steps with a progress bar.",
      source: "https://shop.internal/checkout",
      screenshotUrl: "mock://checkout-stepped.png",
      detectedTarget: {
        label: "Continue to payment",
        boundingBox: { x: 0.35, y: 0.72, width: 0.3, height: 0.06 },
        confidence: 0.92,
        status: "confirmed",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 71.4,
        errorFreeSessions: 63.2,
        interactionEfficiency: 68,
        correctFirstAction: 71,
        backtracking: 24.6,
        abandonment: 18.2,
      },
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Single-page checkout with inline validation and a persistent order summary.",
      source: "checkout-single-page-v3.png",
      screenshotUrl: "mock://checkout-single-page.png",
      detectedTarget: {
        label: "Place order",
        boundingBox: { x: 0.3, y: 0.85, width: 0.4, height: 0.07 },
        confidence: 0.96,
        status: "confirmed",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 86.1,
        errorFreeSessions: 81.7,
        interactionEfficiency: 84,
        correctFirstAction: 91,
        backtracking: 11.3,
        abandonment: 8.7,
      },
    },
    {
      id: "v-c",
      name: "Variant C",
      description: "Accordion checkout with a sticky pay button and deferred address entry.",
      source: "checkout-accordion-v1.png",
      screenshotUrl: "mock://checkout-accordion.png",
      detectedTarget: {
        label: "Pay now",
        boundingBox: { x: 0.28, y: 0.9, width: 0.44, height: 0.06 },
        confidence: 0.88,
        status: "confirmed",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 78.5,
        errorFreeSessions: 70.9,
        interactionEfficiency: 75,
        correctFirstAction: 79,
        backtracking: 17.8,
        abandonment: 13.4,
      },
    },
  ],
  // Legacy results
  results: {
    winnerVariantId: "v-b",
    confidence: "high",
    rationale:
      "Variant B removed the step transitions where simulated sessions most often lost context. With the order summary persistently visible, synthetic users re-checked totals in place instead of navigating backwards, which cut backtracking by roughly half against Variant A. Inline validation resolved card-entry errors before submission, lifting error-free sessions to 81.7%. Variant C recovered some of that benefit, but deferring address entry pushed a second decision point late in the flow and slowed the last third of the journey.",
    recommendation: "Take Variant B into human usability validation.",
    issues: [
      {
        id: "i-1",
        variantId: "v-a",
        severity: "high",
        title: "Progress bar does not signal remaining effort",
        detail:
          "Simulated sessions frequently paused at step 2, then reversed to step 1 to confirm details they could no longer see.",
      },
      {
        id: "i-2",
        variantId: "v-a",
        severity: "medium",
        title: "Card errors surface only after submission",
        detail:
          "Post-submit validation produced repeated retry loops, concentrated in the low-familiarity segment.",
      },
      {
        id: "i-3",
        variantId: "v-c",
        severity: "medium",
        title: "Sticky pay button competes with unfinished sections",
        detail:
          "The always-visible primary action drew early clicks while required fields were still collapsed.",
      },
      {
        id: "i-4",
        variantId: "v-b",
        severity: "low",
        title: "Promo code field attracts exploratory detours",
        detail:
          "A small share of hurried sessions opened the promo field, found nothing to enter, and stalled briefly.",
      },
      {
        id: "i-5",
        variantId: "v-c",
        severity: "low",
        title: "Deferred address entry reads as optional",
        detail:
          "Collapsed address section was skipped on first pass in about one in seven simulated sessions.",
      },
    ],
    segments: [
      {
        id: "s-1",
        name: "Hurried users",
        share: 31,
        summary:
          "Scan for the primary action and commit quickly. Punished by any step that hides the total.",
        bestVariantId: "v-b",
      },
      {
        id: "s-2",
        name: "Cautious users",
        share: 26,
        summary:
          "Re-read summaries before committing. Benefit most from a persistent order summary.",
        bestVariantId: "v-b",
      },
      {
        id: "s-3",
        name: "Experienced users",
        share: 24,
        summary:
          "Complete all variants successfully; differences show up mainly in interaction efficiency.",
        bestVariantId: "v-b",
      },
      {
        id: "s-4",
        name: "Low-familiarity users",
        share: 19,
        summary:
          "Most sensitive to late-surfacing errors. Largest gap between Variant A and Variant B.",
        bestVariantId: "v-b",
      },
    ],
  },
  // New snapshot results
  snapshotResults: {
    predictedWinnerVariantId: "v-b",
    evidenceConfidence: "high",
    primaryDifference:
      "Variant B's inline validation and persistent order summary cut confusion by 13pp and no-action by 6pp versus Variant A.",
    recommendation: "Take Variant B into human usability validation.",
    variantMetrics: {
      "v-a": {
        correctFirstAction: 71,
        correctTargetSelection: 75,
        confusionRate: 18,
        noActionRate: 8,
        averageAgentCertainty: 74,
      },
      "v-b": {
        correctFirstAction: 91,
        correctTargetSelection: 94,
        confusionRate: 5,
        noActionRate: 2,
        averageAgentCertainty: 89,
      },
      "v-c": {
        correctFirstAction: 79,
        correctTargetSelection: 82,
        confusionRate: 13,
        noActionRate: 5,
        averageAgentCertainty: 78,
      },
    },
    behaviouralCohorts: [
      {
        id: "c-1",
        name: "Hurried",
        share: 31,
        variantScores: { "v-a": 62, "v-b": 90, "v-c": 74 },
        summary: "Scan for the primary action and commit quickly.",
      },
      {
        id: "c-2",
        name: "Cautious",
        share: 26,
        variantScores: { "v-a": 70, "v-b": 93, "v-c": 78 },
        summary: "Re-read summaries before committing.",
      },
      {
        id: "c-3",
        name: "Experienced",
        share: 24,
        variantScores: { "v-a": 78, "v-b": 92, "v-c": 82 },
        summary: "Complete all variants; differences in efficiency.",
      },
      {
        id: "c-4",
        name: "Low familiarity",
        share: 19,
        variantScores: { "v-a": 55, "v-b": 87, "v-c": 68 },
        summary: "Most sensitive to late-surfacing errors.",
      },
    ],
    observedIssues: [
      {
        id: "oi-1",
        variantId: "v-a",
        severity: "high",
        title: "Progress bar does not signal remaining effort",
        description:
          "Simulated sessions frequently paused at step 2, then reversed to step 1 to confirm details they could no longer see.",
        affectedShare: 24,
      },
      {
        id: "oi-2",
        variantId: "v-a",
        severity: "medium",
        title: "Card errors surface only after submission",
        description:
          "Post-submit validation produced repeated retry loops, concentrated in the low-familiarity cohort.",
        affectedShare: 18,
      },
      {
        id: "oi-3",
        variantId: "v-c",
        severity: "medium",
        title: "Sticky pay button competes with unfinished sections",
        description:
          "The always-visible primary action drew early clicks while required fields were still collapsed.",
        affectedShare: 15,
      },
    ],
    clickPoints: {
      "v-a": [
        { x: 0.38, y: 0.74, correct: true, cohortId: "c-1" },
        { x: 0.12, y: 0.3, correct: false, cohortId: "c-4" },
        { x: 0.5, y: 0.5, correct: false, cohortId: "c-2" },
        { x: 0.4, y: 0.73, correct: true, cohortId: "c-3" },
        { x: 0.2, y: 0.15, correct: false, cohortId: "c-4" },
        { x: 0.37, y: 0.75, correct: true, cohortId: "c-1" },
      ],
      "v-b": [
        { x: 0.45, y: 0.87, correct: true, cohortId: "c-1" },
        { x: 0.42, y: 0.86, correct: true, cohortId: "c-2" },
        { x: 0.48, y: 0.88, correct: true, cohortId: "c-3" },
        { x: 0.44, y: 0.86, correct: true, cohortId: "c-4" },
        { x: 0.15, y: 0.4, correct: false, cohortId: "c-1" },
      ],
      "v-c": [
        { x: 0.4, y: 0.91, correct: true, cohortId: "c-3" },
        { x: 0.38, y: 0.9, correct: true, cohortId: "c-1" },
        { x: 0.2, y: 0.5, correct: false, cohortId: "c-4" },
        { x: 0.42, y: 0.92, correct: true, cohortId: "c-2" },
        { x: 0.1, y: 0.25, correct: false, cohortId: "c-4" },
      ],
    },
    rationale:
      "Variant B's single-page layout with inline validation reduced confusion by 13pp and no-action by 6pp versus Variant A. The persistent order summary let synthetic users verify totals in place rather than navigating back.",
  },
};

// 2. Completed — Medium evidence, 2 variants
const navigationExperiment: Experiment = {
  id: "exp-1031",
  name: "Reporting navigation — sidebar vs. top tabs",
  type: "snapshot",
  status: "complete",
  persona:
    "Internal analyst who visits the reporting area weekly and knows the metric names but not the page structure.",
  task: "Locate the retention cohort report and export it as CSV.",
  successEvent: "Export triggered on the correct report on the first attempt.",
  hypothesis:
    "A persistent sidebar will outperform top tabs for discoverability of secondary reports.",
  device: "desktop",
  pilotSize: 100,
  behaviourDiversity: "medium",
  createdAt: "2026-08-15T09:00:00Z",
  updatedAt: "2026-08-21T16:42:00Z",
  // Legacy
  simulationSize: 100,
  stage: "pilot",
  owner: "Nadia Okafor",
  successCriteria: "Export triggered within 90 simulated seconds.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Persistent left sidebar with grouped report categories.",
      source: "reporting-sidebar.png",
      screenshotUrl: "mock://reporting-sidebar.png",
      detectedTarget: {
        label: "Retention cohort",
        boundingBox: { x: 0.05, y: 0.4, width: 0.18, height: 0.04 },
        confidence: 0.91,
        status: "confirmed",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 82.0,
        errorFreeSessions: 77.5,
        interactionEfficiency: 79,
        correctFirstAction: 74.0,
        backtracking: 14.5,
        abandonment: 9.5,
      },
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Top tab bar with an overflow menu for secondary reports.",
      source: "reporting-tabs.png",
      screenshotUrl: "mock://reporting-tabs.png",
      detectedTarget: {
        label: "More reports",
        boundingBox: { x: 0.72, y: 0.08, width: 0.12, height: 0.04 },
        confidence: 0.79,
        status: "adjusted",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 69.0,
        errorFreeSessions: 64.0,
        interactionEfficiency: 66,
        correctFirstAction: 52.0,
        backtracking: 27.0,
        abandonment: 16.0,
      },
    },
  ],
  // Legacy results
  results: {
    winnerVariantId: "v-a",
    confidence: "medium",
    rationale:
      "The sidebar kept every report category visible, so simulated sessions selected the correct group on the first attempt far more often. In Variant B the cohort report sat behind an overflow menu, and sessions that missed it on the first scan tended to sweep the tab bar repeatedly before recovering. Confidence is medium because the pilot ran at 100 simulations and the two variants overlap on error-free sessions.",
    recommendation:
      "Re-run Variant A and B at 1,000 simulations before scheduling human validation.",
    issues: [
      {
        id: "i-1",
        variantId: "v-b",
        severity: "high",
        title: "Overflow menu hides a high-intent report",
        detail: "Cohort report was reached on the first attempt in only 52% of sessions.",
      },
      {
        id: "i-2",
        variantId: "v-b",
        severity: "medium",
        title: "Tab labels are ambiguous at a glance",
        detail: "'Insights' and 'Analysis' drew near-equal first clicks for the same task.",
      },
      {
        id: "i-3",
        variantId: "v-a",
        severity: "low",
        title: "Export control sits below the fold",
        detail: "A minority of sessions scrolled past the export action before finding it.",
      },
    ],
    segments: [
      {
        id: "s-1",
        name: "Hurried users",
        share: 34,
        summary: "Rely on first-glance labels; most affected by the overflow menu.",
        bestVariantId: "v-a",
      },
      {
        id: "s-2",
        name: "Experienced users",
        share: 38,
        summary: "Succeed on both variants but take a longer path in Variant B.",
        bestVariantId: "v-a",
      },
      {
        id: "s-3",
        name: "Low-familiarity users",
        share: 28,
        summary: "Highest abandonment on Variant B after two failed scans of the tab bar.",
        bestVariantId: "v-a",
      },
    ],
  },
  // New snapshot results
  snapshotResults: {
    predictedWinnerVariantId: "v-a",
    evidenceConfidence: "medium",
    primaryDifference:
      "Variant A's sidebar kept the cohort report visible, lifting correct target selection by 22pp over Variant B's overflow menu.",
    recommendation:
      "Re-run Variant A and B at 1,000 simulations before scheduling human validation.",
    variantMetrics: {
      "v-a": {
        correctFirstAction: 74,
        correctTargetSelection: 78,
        confusionRate: 12,
        noActionRate: 6,
        averageAgentCertainty: 81,
      },
      "v-b": {
        correctFirstAction: 52,
        correctTargetSelection: 56,
        confusionRate: 28,
        noActionRate: 14,
        averageAgentCertainty: 63,
      },
    },
    behaviouralCohorts: [
      {
        id: "c-1",
        name: "Hurried",
        share: 34,
        variantScores: { "v-a": 80, "v-b": 48 },
        summary: "Rely on first-glance labels; most affected by the overflow menu.",
      },
      {
        id: "c-2",
        name: "Experienced",
        share: 38,
        variantScores: { "v-a": 85, "v-b": 70 },
        summary: "Succeed on both but take a longer path in Variant B.",
      },
      {
        id: "c-3",
        name: "Low familiarity",
        share: 28,
        variantScores: { "v-a": 72, "v-b": 40 },
        summary: "Highest abandonment on Variant B after two failed scans.",
      },
    ],
    observedIssues: [
      {
        id: "oi-1",
        variantId: "v-b",
        severity: "high",
        title: "Overflow menu hides a high-intent report",
        description: "Cohort report was reached on the first attempt in only 52% of sessions.",
        affectedShare: 48,
      },
      {
        id: "oi-2",
        variantId: "v-b",
        severity: "medium",
        title: "Tab labels are ambiguous at a glance",
        description: "'Insights' and 'Analysis' drew near-equal first clicks for the same task.",
        affectedShare: 22,
      },
    ],
    clickPoints: {
      "v-a": [
        { x: 0.08, y: 0.42, correct: true, cohortId: "c-1" },
        { x: 0.07, y: 0.41, correct: true, cohortId: "c-2" },
        { x: 0.09, y: 0.43, correct: true, cohortId: "c-3" },
        { x: 0.5, y: 0.15, correct: false, cohortId: "c-1" },
      ],
      "v-b": [
        { x: 0.75, y: 0.09, correct: true, cohortId: "c-2" },
        { x: 0.3, y: 0.08, correct: false, cohortId: "c-1" },
        { x: 0.45, y: 0.08, correct: false, cohortId: "c-3" },
        { x: 0.76, y: 0.1, correct: true, cohortId: "c-2" },
      ],
    },
    rationale:
      "The sidebar kept every report category visible, so simulated sessions selected the correct group on the first attempt far more often. Confidence is medium because the pilot ran at only 100 simulations.",
  },
};

// 3. Completed — Inconclusive, 2 variants, no clear winner
const pricingExperiment: Experiment = {
  id: "exp-1044",
  name: "Plan selection — comparison table vs. cards",
  type: "snapshot",
  status: "complete",
  persona:
    "Team admin comparing plans for a five-person team, price sensitive and checking specific feature limits.",
  task: "Select the plan that includes SSO for a five-seat team.",
  successEvent: "Correct plan selected on the first commitment, with no return to the plan list.",
  hypothesis:
    "A guided recommender will outperform a comparison table by reducing decision complexity.",
  device: "desktop",
  pilotSize: 500,
  behaviourDiversity: "medium",
  createdAt: "2026-08-25T12:00:00Z",
  updatedAt: "2026-08-28T18:11:00Z",
  // Legacy
  simulationSize: 500,
  stage: "pilot",
  owner: "Ines Halvorsen",
  successCriteria:
    "Correct plan selected on the first commitment, with no return to the plan list.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Dense feature comparison table.",
      source: "plans-table.png",
      screenshotUrl: "mock://plans-table.png",
      detectedTarget: {
        label: "Select Business plan",
        boundingBox: { x: 0.55, y: 0.6, width: 0.15, height: 0.05 },
        confidence: 0.85,
        status: "confirmed",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 81.0,
        errorFreeSessions: 78.0,
        interactionEfficiency: 80,
        correctFirstAction: 81,
        backtracking: 10.0,
        abandonment: 7.0,
      },
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Three plan cards with a feature drawer.",
      source: "plans-cards.png",
      screenshotUrl: "mock://plans-cards.png",
      detectedTarget: {
        label: "Business card — Get started",
        boundingBox: { x: 0.4, y: 0.7, width: 0.2, height: 0.06 },
        confidence: 0.83,
        status: "confirmed",
      },
      targetConfirmed: true,
      metrics: {
        taskSuccess: 82.0,
        errorFreeSessions: 79.0,
        interactionEfficiency: 81,
        correctFirstAction: 82,
        backtracking: 9.5,
        abandonment: 6.5,
      },
    },
  ],
  // Legacy results — note: no winner (inconclusive)
  results: {
    winnerVariantId: "v-b",
    confidence: "low",
    rationale:
      "Both variants performed nearly identically across all metrics. The difference in correct first action (81% vs 82%) is within the expected simulation noise at this pilot scale. No clear winner can be recommended at this confidence level.",
    recommendation:
      "No clear winner. Consider refining the task or testing with a larger simulation scale before committing to either variant.",
    issues: [
      {
        id: "i-1",
        variantId: "v-a",
        severity: "low",
        title: "SSO feature requires scrolling in the table",
        detail: "Some sessions needed to scroll to find the SSO row, adding a small delay.",
      },
    ],
    segments: [
      {
        id: "s-1",
        name: "Price sensitive",
        share: 45,
        summary: "Compare all plans carefully before committing. Perform similarly on both.",
        bestVariantId: "v-b",
      },
      {
        id: "s-2",
        name: "Feature focused",
        share: 35,
        summary: "Scan for SSO specifically. Slightly faster on the table layout.",
        bestVariantId: "v-a",
      },
      {
        id: "s-3",
        name: "Quick deciders",
        share: 20,
        summary: "Commit to the first plausible plan. No meaningful difference between variants.",
        bestVariantId: "v-b",
      },
    ],
  },
  // New snapshot results — inconclusive, no predicted winner
  snapshotResults: {
    predictedWinnerVariantId: undefined,
    evidenceConfidence: "inconclusive",
    primaryDifference:
      "The variants differ by only 1pp on correct first action (81% vs 82%), well within simulation noise at this scale.",
    recommendation:
      "No clear winner. Consider refining the task or testing with a larger simulation scale before committing to either variant.",
    variantMetrics: {
      "v-a": {
        correctFirstAction: 81,
        correctTargetSelection: 83,
        confusionRate: 9,
        noActionRate: 4,
        averageAgentCertainty: 80,
      },
      "v-b": {
        correctFirstAction: 82,
        correctTargetSelection: 84,
        confusionRate: 8,
        noActionRate: 3,
        averageAgentCertainty: 81,
      },
    },
    behaviouralCohorts: [
      {
        id: "c-1",
        name: "Price sensitive",
        share: 45,
        variantScores: { "v-a": 80, "v-b": 82 },
        summary: "Compare all plans carefully. Perform similarly on both.",
      },
      {
        id: "c-2",
        name: "Feature focused",
        share: 35,
        variantScores: { "v-a": 83, "v-b": 81 },
        summary: "Scan for SSO specifically. Slightly faster on the table layout.",
      },
      {
        id: "c-3",
        name: "Quick deciders",
        share: 20,
        variantScores: { "v-a": 79, "v-b": 83 },
        summary: "Commit to the first plausible plan. No meaningful difference.",
      },
    ],
    observedIssues: [
      {
        id: "oi-1",
        variantId: "v-a",
        severity: "low",
        title: "SSO feature requires scrolling in the table",
        description: "Some sessions needed to scroll to find the SSO row, adding a small delay.",
        affectedShare: 12,
      },
    ],
    clickPoints: {
      "v-a": [
        { x: 0.58, y: 0.62, correct: true, cohortId: "c-1" },
        { x: 0.56, y: 0.61, correct: true, cohortId: "c-2" },
        { x: 0.57, y: 0.63, correct: true, cohortId: "c-3" },
        { x: 0.2, y: 0.3, correct: false, cohortId: "c-1" },
      ],
      "v-b": [
        { x: 0.42, y: 0.72, correct: true, cohortId: "c-1" },
        { x: 0.44, y: 0.71, correct: true, cohortId: "c-3" },
        { x: 0.41, y: 0.73, correct: true, cohortId: "c-2" },
        { x: 0.15, y: 0.2, correct: false, cohortId: "c-1" },
      ],
    },
    rationale:
      "Both variants performed nearly identically. The 1pp difference in correct first action is within expected simulation noise at a 500-session pilot scale.",
  },
};

// 4. Running experiment — no results yet
const onboardingExperiment: Experiment = {
  id: "exp-1038",
  name: "Onboarding — guided setup vs. blank workspace",
  type: "snapshot",
  status: "running",
  persona:
    "Operations lead evaluating the product during a trial, familiar with similar tools but short on time.",
  task: "Create a first workspace and invite two teammates within the first session.",
  successEvent: "Workspace created and at least one invite sent without leaving the flow.",
  hypothesis:
    "A guided wizard will reduce no-action rates compared to a blank workspace with a checklist.",
  device: "desktop",
  pilotSize: 500,
  behaviourDiversity: "medium",
  createdAt: "2026-08-26T08:00:00Z",
  updatedAt: "2026-08-28T09:05:00Z",
  // Legacy
  simulationSize: 500,
  stage: "pilot",
  owner: "Tomás Ferreira",
  successCriteria: "Workspace created and at least one invite sent without leaving the flow.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Guided four-step setup wizard.",
      source: "onboarding-wizard.png",
      screenshotUrl: "mock://onboarding-wizard.png",
      detectedTarget: {
        label: "Create workspace",
        boundingBox: { x: 0.35, y: 0.55, width: 0.3, height: 0.06 },
        confidence: 0.9,
        status: "confirmed",
      },
      targetConfirmed: true,
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Blank workspace with a contextual checklist panel.",
      source: "onboarding-checklist.png",
      screenshotUrl: "mock://onboarding-checklist.png",
      detectedTarget: {
        label: "New workspace",
        boundingBox: { x: 0.6, y: 0.15, width: 0.15, height: 0.04 },
        confidence: 0.86,
        status: "confirmed",
      },
      targetConfirmed: true,
    },
  ],
};

// 5. Draft experiment — no results, minimal data
const signupDraftExperiment: Experiment = {
  id: "exp-1045",
  name: "Signup — single form vs. progressive disclosure",
  type: "snapshot",
  status: "draft",
  persona:
    "Prospective user arriving from a product comparison site, moderately technical and evaluating two competing tools.",
  task: "Create an account and reach the product dashboard.",
  successEvent: "Dashboard reached on the first attempt without abandoning the signup form.",
  device: "mobile",
  pilotSize: 500,
  behaviourDiversity: "medium",
  createdAt: "2026-09-16T10:00:00Z",
  updatedAt: "2026-09-16T10:00:00Z",
  // Legacy
  simulationSize: 500,
  stage: "pilot",
  owner: "Ines Halvorsen",
  successCriteria: "Dashboard reached on the first attempt without abandoning the signup form.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Single-page signup form with all fields visible.",
      source: "signup-single-form.png",
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Progressive disclosure: email first, then profile, then verification.",
      source: "signup-progressive.png",
    },
  ],
};

const EXPERIMENTS: Experiment[] = [
  pricingExperiment,
  onboardingExperiment,
  checkoutExperiment,
  navigationExperiment,
  signupDraftExperiment,
];

/** Swap these for real data fetching later. */
export function listExperiments(): Experiment[] {
  return [...EXPERIMENTS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.id === id);
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

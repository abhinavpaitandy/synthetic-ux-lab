/**
 * Adapter layer that converts between mock-data's extended Experiment
 * (which carries legacy fields + snapshotResults) and the clean
 * Experiment type from types.ts.
 *
 * Also provides deterministic prototype result generation from the
 * current in-memory experiment draft — no API, no backend, no
 * localStorage, no mutation of the draft.
 */

import type { Experiment as MockExperiment } from "./mock-data";
import type {
  BehaviourDiversity,
  ClickPoint,
  Experiment,
  ExperimentDraft,
  EvidenceConfidence,
  SnapshotExperimentResults,
  SnapshotVariantMetrics,
  Variant,
} from "./types";
import { isTargetReviewed } from "./types";

// ─── Clean adapter ───────────────────────────────────────────────

export function toCleanSnapshotExperiment(mock: MockExperiment): Experiment {
  const base: Experiment = {
    id: mock.id,
    name: mock.name,
    type: mock.type,
    status: mock.status,
    persona: mock.persona,
    task: mock.task,
    successEvent: mock.successEvent,
    device: mock.device,
    variants: mock.variants.map(toCleanVariant),
    pilotSize: mock.pilotSize,
    behaviourDiversity: mock.behaviourDiversity,
    createdAt: mock.createdAt,
    updatedAt: mock.updatedAt,
  };
  if (mock.hypothesis) base.hypothesis = mock.hypothesis;
  if (mock.snapshotResults) base.results = mock.snapshotResults;
  return base;
}

function toCleanVariant(v: MockExperiment["variants"][number]): Variant {
  const base: Variant = {
    id: v.id,
    name: v.name,
    description: v.description,
  };
  if (v.screenshotUrl) base.screenshotUrl = v.screenshotUrl;
  if (v.detectedTarget) base.detectedTarget = v.detectedTarget;
  return base;
}

// ─── Prototype draft validation ──────────────────────────────────

export function isPrototypeDraftReady(draft: ExperimentDraft): boolean {
  if (!draft.name.trim()) return false;
  if (!draft.persona.trim()) return false;
  if (!draft.task.trim()) return false;
  if (!draft.successEvent.trim()) return false;
  if (draft.variants.length < 2) return false;
  return draft.variants.every(
    (v) => v.screenshotUrl && v.detectedTarget && isTargetReviewed(v.detectedTarget),
  );
}

// ─── Prototype result generation ─────────────────────────────────

/**
 * Deterministic prototype metrics. For two-variant experiments, the
 * first two entries (A and B) are used. No separate scaled set.
 */
const PROTOTYPE_METRICS: SnapshotVariantMetrics[] = [
  {
    correctFirstAction: 71,
    correctTargetSelection: 75,
    confusionRate: 18,
    noActionRate: 8,
    averageAgentCertainty: 74,
  },
  {
    correctFirstAction: 91,
    correctTargetSelection: 94,
    confusionRate: 5,
    noActionRate: 2,
    averageAgentCertainty: 89,
  },
  {
    correctFirstAction: 79,
    correctTargetSelection: 82,
    confusionRate: 13,
    noActionRate: 5,
    averageAgentCertainty: 78,
  },
];

/**
 * Prototype-only mapping. Real experiment evidence will be determined
 * statistically and must not depend on pilot size alone.
 */
const PROTOTYPE_EVIDENCE: Record<number, EvidenceConfidence> = {
  100: "medium",
  500: "high",
  1000: "high",
};

const COHORT_SETS: Record<
  BehaviourDiversity,
  { id: string; name: string; share: number; summary: string }[]
> = {
  low: [
    { id: "pc-1", name: "Cautious", share: 34, summary: "Re-read labels before selecting." },
    {
      id: "pc-2",
      name: "Experienced",
      share: 40,
      summary: "Identify target by label regardless of layout.",
    },
    {
      id: "pc-3",
      name: "Hurried",
      share: 26,
      summary: "Scan for the most visually prominent option.",
    },
  ],
  medium: [
    {
      id: "pc-1",
      name: "Hurried",
      share: 26,
      summary: "Scan for the most visually prominent option and commit quickly.",
    },
    { id: "pc-2", name: "Cautious", share: 24, summary: "Re-read all labels before selecting." },
    {
      id: "pc-3",
      name: "Experienced",
      share: 20,
      summary: "Identify target by label regardless of layout.",
    },
    {
      id: "pc-4",
      name: "Low familiarity",
      share: 16,
      summary: "Most sensitive to label ambiguity.",
    },
    {
      id: "pc-5",
      name: "Exploratory",
      share: 14,
      summary: "Explore multiple options before committing.",
    },
  ],
  high: [
    {
      id: "pc-1",
      name: "Hurried",
      share: 22,
      summary: "Scan for the most visually prominent option.",
    },
    { id: "pc-2", name: "Cautious", share: 20, summary: "Re-read all labels before selecting." },
    {
      id: "pc-3",
      name: "Experienced",
      share: 18,
      summary: "Identify target by label regardless of layout.",
    },
    {
      id: "pc-4",
      name: "Low familiarity",
      share: 14,
      summary: "Most sensitive to label ambiguity.",
    },
    {
      id: "pc-5",
      name: "Low attention",
      share: 14,
      summary: "Easily distracted by non-target elements.",
    },
    {
      id: "pc-6",
      name: "Exploratory",
      share: 12,
      summary: "Explore multiple options before committing.",
    },
  ],
};

function buildCohorts(
  diversity: BehaviourDiversity,
  variantIds: string[],
): SnapshotExperimentResults["behaviouralCohorts"] {
  const baseSet = COHORT_SETS[diversity];
  return baseSet.map((c) => {
    const variantScores: Record<string, number> = {};
    variantIds.forEach((vid, i) => {
      const base = 60 + i * 12;
      variantScores[vid] = Math.min(95, base + (c.name === "Experienced" ? 8 : 0));
    });
    return { ...c, variantScores };
  });
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function buildClickPoints(
  variantIds: string[],
  targets: { x: number; y: number; width: number; height: number }[],
): Record<string, ClickPoint[]> {
  const points: Record<string, ClickPoint[]> = {};
  variantIds.forEach((vid, i) => {
    const t = targets[i] ?? { x: 0.5, y: 0.5, width: 0.12, height: 0.06 };
    const cx = t.x;
    const cy = t.y;
    const halfW = t.width / 2;
    const halfH = t.height / 2;

    const correct: ClickPoint[] = [
      {
        x: clamp01(cx - halfW * 0.4),
        y: clamp01(cy - halfH * 0.3),
        correct: true,
        cohortId: "pc-1",
      },
      {
        x: clamp01(cx + halfW * 0.3),
        y: clamp01(cy - halfH * 0.2),
        correct: true,
        cohortId: "pc-2",
      },
      {
        x: clamp01(cx - halfW * 0.2),
        y: clamp01(cy + halfH * 0.4),
        correct: true,
        cohortId: "pc-3",
      },
      {
        x: clamp01(cx + halfW * 0.45),
        y: clamp01(cy + halfH * 0.1),
        correct: true,
        cohortId: "pc-1",
      },
    ];

    const incorrect: ClickPoint[] = [
      { x: clamp01(0.12), y: clamp01(0.22), correct: false, cohortId: "pc-4" },
      { x: clamp01(0.85), y: clamp01(0.18), correct: false, cohortId: "pc-5" },
    ];

    points[vid] = [...correct, ...incorrect];
  });
  return points;
}

function buildIssues(variantIds: string[]): SnapshotExperimentResults["observedIssues"] {
  const issues: SnapshotExperimentResults["observedIssues"] = [];
  if (variantIds.length >= 2 && variantIds[0]) {
    issues.push({
      id: "pi-1",
      variantId: variantIds[0],
      severity: "medium",
      title: "Target element has low visual prominence",
      description:
        "Without visual emphasis, the target was not the first choice for a meaningful share of sessions.",
      affectedShare: 22,
    });
  }
  if (variantIds.length >= 3 && variantIds[2]) {
    issues.push({
      id: "pi-2",
      variantId: variantIds[2],
      severity: "low",
      title: "Competing labels create mild ambiguity",
      description:
        "Secondary labels near the target drew some early clicks away from the intended control.",
      affectedShare: 12,
    });
  }
  return issues;
}

export function buildPrototypeSnapshotExperiment(draft: ExperimentDraft): Experiment {
  const variantIds = draft.variants.map((v) => v.id);

  const variantMetrics: Record<string, SnapshotVariantMetrics> = {};
  variantIds.forEach((vid, i) => {
    const metrics = PROTOTYPE_METRICS[i] ?? PROTOTYPE_METRICS[PROTOTYPE_METRICS.length - 1];
    if (metrics) variantMetrics[vid] = metrics;
  });

  const winnerId = variantIds[Math.min(1, variantIds.length - 1)];

  const evidenceConfidence = PROTOTYPE_EVIDENCE[draft.pilotSize] ?? "medium";

  const targets = draft.variants.map((v) => {
    const bb = v.detectedTarget?.boundingBox;
    return bb
      ? { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2, width: bb.width, height: bb.height }
      : { x: 0.5, y: 0.5, width: 0.12, height: 0.06 };
  });

  const cohorts = buildCohorts(draft.behaviourDiversity, variantIds);
  const clickPoints = buildClickPoints(variantIds, targets);
  const observedIssues = buildIssues(variantIds);

  const results: SnapshotExperimentResults = {
    evidenceConfidence,
    primaryDifference: `${draft.variants[Math.min(1, variantIds.length - 1)]?.name ?? "Variant B"} showed higher correct first-action and target selection rates with lower confusion and no-action.`,
    recommendation: `Take ${draft.variants[Math.min(1, variantIds.length - 1)]?.name ?? "Variant B"} into human usability validation.`,
    variantMetrics,
    behaviouralCohorts: cohorts,
    observedIssues,
    clickPoints,
    rationale: `The winning variant made the target element more discoverable, reducing confusion and no-action rates. This is a simulated pre-test result — confirm with real users.`,
  };
  if (winnerId) results.predictedWinnerVariantId = winnerId;

  const now = new Date().toISOString();

  const exp: Experiment = {
    id: "prototype-current",
    name: draft.name,
    type: "snapshot",
    status: "complete",
    persona: draft.persona,
    task: draft.task,
    successEvent: draft.successEvent,
    device: draft.device,
    variants: draft.variants.map((v) => {
      const base: Variant = { id: v.id, name: v.name, description: v.description ?? "" };
      if (v.screenshotUrl) base.screenshotUrl = v.screenshotUrl;
      if (v.detectedTarget) base.detectedTarget = v.detectedTarget;
      return base;
    }),
    pilotSize: draft.pilotSize,
    behaviourDiversity: draft.behaviourDiversity,
    createdAt: now,
    updatedAt: now,
    results,
  };
  if (draft.hypothesis) exp.hypothesis = draft.hypothesis;
  return exp;
}

/**
 * Mock data layer for Synthetic UX Lab.
 *
 * Everything here is static, in-memory sample data. When a real backend or
 * simulation engine is added later, replace the functions at the bottom of
 * this file with API calls — the UI only consumes those functions.
 */

export type ExperimentStatus = "draft" | "running" | "complete";
export type Confidence = "high" | "medium" | "low";
export type SimulationStage = "pilot" | "test";

export interface VariantMetrics {
  taskSuccess: number; // %
  errorFreeSessions: number; // %
  interactionEfficiency: number; // 0-100 index
  correctFirstAction: number; // %
  backtracking: number; // % (lower is better)
  abandonment: number; // % (lower is better)
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  source: string;
  metrics?: VariantMetrics;
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
  share: number; // % of simulated population
  summary: string;
  bestVariantId: string;
}

export interface Experiment {
  id: string;
  name: string;
  status: ExperimentStatus;
  stage: SimulationStage;
  simulationSize: number;
  updatedAt: string;
  owner: string;
  persona: string;
  task: string;
  successCriteria: string;
  variants: Variant[];
  results?: {
    winnerVariantId: string;
    confidence: Confidence;
    rationale: string;
    recommendation: string;
    issues: UsabilityIssue[];
    segments: BehaviouralSegment[];
  };
}

export const PILOT_SIZES = [100, 500, 1000] as const;
export const TEST_SIZES = [10000, 100000, 1000000, 10000000] as const;

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

const checkoutExperiment: Experiment = {
  id: "exp-1042",
  name: "Checkout — one-page vs. stepped flow",
  status: "complete",
  stage: "pilot",
  simulationSize: 1000,
  updatedAt: "2026-08-27T14:20:00Z",
  owner: "Nadia Okafor",
  persona:
    "First-time buyer on desktop, moderate digital confidence, shopping during a work break and easily distracted.",
  task: "Purchase a single in-stock item using a saved address and a new payment card.",
  successCriteria:
    "Order confirmation reached in under 6 steps with no validation error on the payment step.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Current production checkout — three separate steps with a progress bar.",
      source: "https://shop.internal/checkout",
      metrics: {
        taskSuccess: 71.4,
        errorFreeSessions: 63.2,
        interactionEfficiency: 68,
        correctFirstAction: 58.9,
        backtracking: 24.6,
        abandonment: 18.2,
      },
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Single-page checkout with inline validation and a persistent order summary.",
      source: "checkout-single-page-v3.png",
      metrics: {
        taskSuccess: 86.1,
        errorFreeSessions: 81.7,
        interactionEfficiency: 84,
        correctFirstAction: 79.4,
        backtracking: 11.3,
        abandonment: 8.7,
      },
    },
    {
      id: "v-c",
      name: "Variant C",
      description: "Accordion checkout with a sticky pay button and deferred address entry.",
      source: "checkout-accordion-v1.png",
      metrics: {
        taskSuccess: 78.5,
        errorFreeSessions: 70.9,
        interactionEfficiency: 75,
        correctFirstAction: 66.2,
        backtracking: 17.8,
        abandonment: 13.4,
      },
    },
  ],
  results: {
    winnerVariantId: "v-b",
    confidence: "high",
    rationale:
      "Variant B removed the step transitions where simulated sessions most often lost context. With the order summary persistently visible, synthetic users re-checked totals in place instead of navigating backwards, which cut backtracking by roughly half against Variant A. Inline validation resolved card-entry errors before submission, lifting error-free sessions to 81.7%. Variant C recovered some of that benefit, but deferring address entry pushed a second decision point late in the flow and slowed the last third of the journey.",
    recommendation: "Take Variant B into human validation with 6–8 moderated sessions.",
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
};

const onboardingExperiment: Experiment = {
  id: "exp-1038",
  name: "Onboarding — guided setup vs. blank workspace",
  status: "running",
  stage: "pilot",
  simulationSize: 500,
  updatedAt: "2026-08-28T09:05:00Z",
  owner: "Tomás Ferreira",
  persona:
    "Operations lead evaluating the product during a trial, familiar with similar tools but short on time.",
  task: "Create a first workspace and invite two teammates within the first session.",
  successCriteria: "Workspace created and at least one invite sent without leaving the flow.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Guided four-step setup wizard.",
      source: "onboarding-wizard.png",
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Blank workspace with a contextual checklist panel.",
      source: "onboarding-checklist.png",
    },
  ],
};

const navigationExperiment: Experiment = {
  id: "exp-1031",
  name: "Reporting navigation — sidebar vs. top tabs",
  status: "complete",
  stage: "pilot",
  simulationSize: 100,
  updatedAt: "2026-08-21T16:42:00Z",
  owner: "Nadia Okafor",
  persona:
    "Internal analyst who visits the reporting area weekly and knows the metric names but not the page structure.",
  task: "Locate the retention cohort report and export it as CSV.",
  successCriteria: "Export triggered within 90 simulated seconds.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Persistent left sidebar with grouped report categories.",
      source: "reporting-sidebar.png",
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
};

const pricingExperiment: Experiment = {
  id: "exp-1044",
  name: "Plan selection — comparison table vs. cards",
  status: "draft",
  stage: "pilot",
  simulationSize: 500,
  updatedAt: "2026-08-28T18:11:00Z",
  owner: "Ines Halvorsen",
  persona:
    "Team admin comparing plans for a five-person team, price sensitive and checking specific feature limits.",
  task: "Select the plan that includes SSO for a five-seat team.",
  successCriteria: "Correct plan selected on the first commitment, with no return to the plan list.",
  variants: [
    {
      id: "v-a",
      name: "Variant A",
      description: "Dense feature comparison table.",
      source: "plans-table.png",
    },
    {
      id: "v-b",
      name: "Variant B",
      description: "Three plan cards with a feature drawer.",
      source: "plans-cards.png",
    },
    {
      id: "v-c",
      name: "Variant C",
      description: "Guided recommender with two qualifying questions.",
      source: "plans-recommender.png",
    },
  ],
};

const EXPERIMENTS: Experiment[] = [
  pricingExperiment,
  onboardingExperiment,
  checkoutExperiment,
  navigationExperiment,
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

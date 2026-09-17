import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Play } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Pill } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useDraft } from "@/lib/draft-store";
import { isTargetReviewed, type BehaviourDiversity, type PilotSize } from "@/lib/types";

const TITLE = "Simulation Setup — Synthetic UX Lab";
const DESCRIPTION = "Review the experiment and configure the synthetic pilot.";

export const Route = createFileRoute("/experiments/new/simulation")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimulationSetupPage,
});

const PILOT_OPTIONS: { value: PilotSize; label: string; description: string }[] = [
  { value: 100, label: "100", description: "Quick directional check" },
  { value: 500, label: "500", description: "Recommended for most pre-tests" },
  { value: 1000, label: "1,000", description: "Broader synthetic coverage" },
];

const DIVERSITY_OPTIONS: {
  value: BehaviourDiversity;
  label: string;
  description: string;
}[] = [
  { value: "low", label: "Low", description: "Variation stays close to the primary persona." },
  {
    value: "medium",
    label: "Medium",
    description: "Moderate behavioural variation around the primary persona.",
  },
  {
    value: "high",
    label: "High",
    description: "Broader variation while remaining compatible with the persona.",
  },
];

const COHORT_PREVIEW: Record<BehaviourDiversity, string[]> = {
  low: ["Cautious", "Experienced", "Hurried"],
  medium: ["Hurried", "Cautious", "Experienced", "Low familiarity", "Exploratory"],
  high: [
    "Hurried",
    "Cautious",
    "Experienced",
    "Low familiarity",
    "Low attention",
    "Exploratory",
  ],
};

const RUN_PHASES = [
  "Preparing synthetic population…",
  "Simulating first-action decisions…",
  "Aggregating results…",
];

const PHASE_DURATION = 280;

function SimulationSetupPage() {
  const navigate = useNavigate();
  const { draft, setPilotSize, setBehaviourDiversity } = useDraft();
  const [isRunning, setIsRunning] = useState(false);
  const [runPhase, setRunPhase] = useState(0);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    };
  }, []);

  const variants = draft.variants;

  const hasScreenshots = variants.every((v) => v.screenshotUrl);
  const hasTargets = variants.every((v) => v.detectedTarget);
  const allReviewed =
    hasTargets && variants.every((v) => v.detectedTarget && isTargetReviewed(v.detectedTarget));
  const hasCoreData = draft.name && draft.persona && draft.task && draft.successEvent;
  const hasMinVariants = variants.length >= 2;

  const missingScreenshots = !hasScreenshots;
  const missingTargets = !hasTargets || !allReviewed;
  const incomplete = !hasCoreData || !hasMinVariants || missingScreenshots || missingTargets;

  const totalObservations = draft.pilotSize * variants.length;
  const pilotLabel = draft.pilotSize.toLocaleString();
  const diversityLabel =
    draft.behaviourDiversity.charAt(0).toUpperCase() + draft.behaviourDiversity.slice(1);

  function handleRun() {
    setIsRunning(true);
    setRunPhase(0);

    RUN_PHASES.forEach((_, i) => {
      phaseTimer.current = setTimeout(
        () => {
          if (i < RUN_PHASES.length - 1) {
            setRunPhase(i + 1);
          } else {
            setIsRunning(false);
            // Prototype only:
            // Results v2 will replace this fixed mock experiment with
            // results generated from the current experiment draft.
            navigate({ to: "/experiments/$experimentId", params: { experimentId: "exp-1042" } });
          }
        },
        (i + 1) * PHASE_DURATION,
      );
    });
  }

  // ─── Missing data guards ──────────────────────────────────────

  if (incomplete) {
    const missingTargetsOnly = hasScreenshots && (!hasTargets || !allReviewed);
    const title = missingTargetsOnly ? "Targets need review" : "Complete earlier steps first";
    const description = missingTargetsOnly
      ? "Confirm or adjust every detected target before configuring the simulation."
      : "Add experiment details, upload screenshots, and analyse variants before setting up the simulation.";
    const backTo = missingTargetsOnly ? "/experiments/new/targets" : "/experiments/new/variants";
    const backLabel = missingTargetsOnly ? "Back to Target Review" : "Back to Variants";

    return (
      <>
        <PageHeader
          eyebrow="New Experiment · Step 4 of 5"
          title="Simulation Setup"
          description={DESCRIPTION}
        />
        <PageBody>
          <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
            <Button asChild className="mt-5">
              <Link to={backTo}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  // ─── Normal simulation setup ──────────────────────────────────

  return (
    <>
      <PageHeader
        eyebrow="New Experiment · Step 4 of 5"
        title="Simulation Setup"
        description={DESCRIPTION}
        actions={
          <Button variant="outline" asChild>
            <Link to="/experiments/new/targets">
              <ArrowLeft className="size-4" />
              Back to Target Review
            </Link>
          </Button>
        }
      />

      <PageBody>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {/* Experiment summary */}
            <div className="rounded-lg border border-border bg-surface px-5 py-4">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                <SummaryRow label="Experiment" value={draft.name} />
                <SummaryRow
                  label="Device"
                  value={draft.device === "mobile" ? "Mobile" : "Desktop"}
                />
                <SummaryRow label="Persona" value={draft.persona} truncate />
                <SummaryRow label="Variants" value={String(variants.length)} />
                <SummaryRow label="Task" value={draft.task} />
                <SummaryRow label="Success event" value={draft.successEvent} />
              </dl>
            </div>

            {/* Reviewed variants */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Reviewed variants</h2>
              <div className="mt-3 space-y-2">
                {variants.map((variant) => {
                  const target = variant.detectedTarget!;
                  const tone =
                    target.status === "confirmed"
                      ? "success"
                      : target.status === "adjusted"
                        ? "info"
                        : "neutral";
                  const statusLabel =
                    target.status === "confirmed"
                      ? "Confirmed"
                      : target.status === "adjusted"
                        ? "Adjusted"
                        : "Needs review";
                  return (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-2.5"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground">
                          {variant.name}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          Target: {target.label}
                        </span>
                      </div>
                      <Pill tone={tone}>{statusLabel}</Pill>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pilot size */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Pilot size</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose how many synthetic sessions to run for each variant.
              </p>
              <RadioGroup
                value={String(draft.pilotSize)}
                onValueChange={(val) => setPilotSize(Number(val) as PilotSize)}
                className="mt-4 grid gap-3 sm:grid-cols-3"
              >
                {PILOT_OPTIONS.map((opt) => (
                  <PilotRadioCard
                    key={opt.value}
                    value={String(opt.value)}
                    label={opt.label}
                    description={opt.description}
                    checked={draft.pilotSize === opt.value}
                  />
                ))}
              </RadioGroup>
              <p className="mt-3 text-xs text-muted-foreground">
                Synthetic session count reflects simulated behavioural exploration. It is not
                equivalent to a human research sample size.
              </p>
            </div>

            {/* Behaviour diversity */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Behaviour diversity</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Control how varied the synthetic agents' interaction patterns are.
              </p>
              <RadioGroup
                value={draft.behaviourDiversity}
                onValueChange={(val) => setBehaviourDiversity(val as BehaviourDiversity)}
                className="mt-4 grid gap-3 sm:grid-cols-3"
              >
                {DIVERSITY_OPTIONS.map((opt) => (
                  <PilotRadioCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    description={opt.description}
                    checked={draft.behaviourDiversity === opt.value}
                  />
                ))}
              </RadioGroup>
            </div>

            {/* Synthetic population preview */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Synthetic population</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The pilot will vary behavioural traits around your primary persona.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {COHORT_PREVIEW[draft.behaviourDiversity].map((cohort) => (
                  <Pill key={cohort} tone="neutral">
                    {cohort}
                  </Pill>
                ))}
              </div>
            </div>

            {/* Simulation estimate */}
            <div className="rounded-lg border border-border bg-surface px-5 py-4">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
                <SummaryRow label="Pilot" value={`${pilotLabel} synthetic sessions per variant`} />
                <SummaryRow label="Variants" value={String(variants.length)} />
                <SummaryRow
                  label="Total simulated observations"
                  value={totalObservations.toLocaleString()}
                />
              </dl>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link to="/experiments/new/targets">
                  <ArrowLeft className="size-4" />
                  Back to Target Review
                </Link>
              </Button>
              <Button onClick={handleRun} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span aria-live="polite">{RUN_PHASES[runPhase]}</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Run {pilotLabel} Simulations
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Summary panel */}
          <aside className="hidden xl:block xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <AsideRow label="Experiment" value={draft.name} />
                <AsideRow label="Variants" value={String(variants.length)} />
                <AsideRow label="Pilot" value={`${pilotLabel} / variant`} />
                <AsideRow label="Diversity" value={diversityLabel} />
                <AsideRow label="Total observations" value={totalObservations.toLocaleString()} />
                <AsideRow label="Next" value="View results" />
              </dl>
            </div>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function PilotRadioCard({
  value,
  label,
  description,
  checked,
}: {
  value: string;
  label: string;
  description: string;
  checked: boolean;
}) {
  const inputId = `radio-${value}`;
  return (
    <Label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer flex-col gap-0.5 rounded-md border px-4 py-3 transition-colors",
        checked ? "border-primary bg-accent" : "border-border bg-surface hover:border-primary/50",
      )}
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem id={inputId} value={value} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </Label>
  );
}

function SummaryRow({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-sm text-foreground",
          truncate && "line-clamp-2 overflow-hidden text-ellipsis",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function AsideRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

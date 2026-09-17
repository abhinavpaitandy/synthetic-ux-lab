import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Sparkles,
  TriangleAlert,
  Target,
  MousePointerClick,
  PlusCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { ExperimentStepper } from "@/components/experiment-stepper";
import { EvidenceBadge, Pill, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getExperiment } from "@/lib/mock-data";
import {
  buildPrototypeSnapshotExperiment,
  isPrototypeDraftReady,
  toCleanSnapshotExperiment,
} from "@/lib/snapshot-results";
import {
  SNAPSHOT_METRIC_DEFS,
  type Experiment,
  type SnapshotExperimentResults,
} from "@/lib/types";
import { useDraft } from "@/lib/draft-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/experiments/$experimentId")({
  head: ({ params }) => {
    const isPrototype = params.experimentId === "prototype-current";
    const title = isPrototype
      ? "Prototype result — Synthetic UX Lab"
      : "Experiment — Synthetic UX Lab";
    const description =
      "Snapshot results comparing interface variants on first-action discoverability and target selection.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(isPrototype ? [{ name: "robots", content: "noindex" }] : []),
      ],
    };
  },
  component: ResultsPage,
});

function ResultsPage() {
  const { experimentId } = Route.useParams();
  const isPrototype = experimentId === "prototype-current";
  const draftCtx = useDraft();

  let experiment: Experiment | null = null;
  let prototypeExpired = false;

  if (isPrototype) {
    if (isPrototypeDraftReady(draftCtx.draft)) {
      experiment = buildPrototypeSnapshotExperiment(draftCtx.draft);
    } else {
      prototypeExpired = true;
    }
  } else {
    const mock = getExperiment(experimentId);
    if (mock) {
      experiment = toCleanSnapshotExperiment(mock);
    }
  }

  if (prototypeExpired) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Prototype result · Snapshot Test"
          title="Prototype result is no longer available"
          description="This prototype result exists only for the current experiment session. Start a new experiment to run it again."
        />
        <PageBody>
          <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              Prototype result is no longer available
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              This prototype result exists only for the current experiment session. Start a new
              experiment to run it again.
            </p>
            <Button asChild className="mt-5">
              <Link to="/experiments/new">
                <PlusCircle className="size-4" />
                New Experiment
              </Link>
            </Button>
          </div>
        </PageBody>
      </AppShell>
    );
  }

  if (!experiment) {
    return (
      <AppShell>
        <PageHeader title="Experiment not found" description="This experiment ID does not exist." />
        <PageBody>
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to experiments
            </Link>
          </Button>
        </PageBody>
      </AppShell>
    );
  }

  const isComplete = experiment.status === "complete" && experiment.results;
  const eyebrow = isPrototype
    ? "Prototype result · Snapshot Test"
    : `Snapshot Test · ${formatDate(experiment.updatedAt)}`;

  return (
    <AppShell>
      <PageHeader
        eyebrow={eyebrow}
        title={experiment.name}
        description={experiment.task}
        actions={
          <>
            <StatusBadge status={experiment.status} />
            <Pill tone="info">
              <Camera className="size-3" />
              Snapshot
            </Pill>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="size-4" />
                All experiments
              </Link>
            </Button>
          </>
        }
      />

      <PageBody>
        <ExperimentStepper
          currentStep={5}
          experimentId={experiment.id}
          readOnly={!isPrototype}
          className="mb-6"
        />
        {isComplete ? (
          <SnapshotResults experiment={experiment} results={experiment.results!} />
        ) : (
          <PendingState experiment={experiment} />
        )}
      </PageBody>
    </AppShell>
  );
}

// ─── Pending state ───────────────────────────────────────────────

function PendingState({ experiment }: { experiment: Experiment }) {
  const running = experiment.status === "running";
  return (
    <div className="space-y-6">
      <ContextCard experiment={experiment} />
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
        <h2 className="text-base font-semibold text-foreground">
          {running ? "Simulation in progress" : "Draft — not yet run"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {running
            ? `Running ${experiment.pilotSize.toLocaleString()} synthetic sessions across ${experiment.variants.length} variants. Results appear here when the pilot completes.`
            : "Finish the setup and run a pilot to generate comparative results for this experiment."
        </p>
        <div className="mx-auto mt-6 max-w-sm space-y-2">
          {experiment.variants.map((v, i) => (
            <div
              key={v.id}
              className="h-2 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                className={cn("h-full rounded-full bg-primary/70", running && "animate-pulse")}
                style={{ width: running ? `${72 - i * 18}%` : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Context card ────────────────────────────────────────────────

function ContextCard({ experiment }: { experiment: Experiment }) {
  const diversityLabel =
    experiment.behaviourDiversity.charAt(0).toUpperCase() +
    experiment.behaviourDiversity.slice(1);

  const fields = [
    { label: "Persona", value: experiment.persona },
    { label: "Task", value: experiment.task },
    { label: "Success event", value: experiment.successEvent },
    {
      label: "Device",
      value: experiment.device === "mobile" ? "Mobile" : "Desktop",
    },
    {
      label: "Pilot",
      value: `${experiment.pilotSize.toLocaleString()} synthetic sessions / variant`,
    },
    { label: "Behaviour diversity", value: diversityLabel },
    { label: "Variants", value: String(experiment.variants.length) },
  ];

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="label-caps">{f.label}</div>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{f.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        Synthetic session count reflects simulated behavioural exploration. It is not equivalent to
        a human research sample size.
      </p>
    </section>
  );
}

// ─── Snapshot results ────────────────────────────────────────────

function SnapshotResults({
  experiment,
  results,
}: {
  experiment: Experiment;
  results: SnapshotExperimentResults;
}) {
  const winnerId = results.predictedWinnerVariantId;
  const winner = experiment.variants.find((v) => v.id === winnerId);
  const variants = experiment.variants;
  const totalObservations = experiment.pilotSize * variants.length;

  const chartData = SNAPSHOT_METRIC_DEFS.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    variants.forEach((v) => {
      const metrics = results.variantMetrics[v.id];
      if (metrics) row[v.name] = metrics[m.key];
    });
    return row;
  });

  const chartColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"];

  return (
    <div className="space-y-8">
      {/* Headline */}
      <section className="grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
        <div className="bg-accent px-5 py-5">
          <div className="label-caps text-accent-foreground/70">Predicted winner</div>
          {winner ? (
            <>
              <div className="mt-1.5 text-2xl font-semibold text-accent-foreground">
                {winner.name}
              </div>
              {winner.description ? (
                <p className="mt-1 text-xs text-accent-foreground/80">{winner.description}</p>
              ) : null}
            </>
          ) : (
            <div className="mt-1.5 text-lg font-semibold text-accent-foreground">
              No clear winner
            </div>
          )}
        </div>
        <div className="bg-card px-5 py-5">
          <div className="label-caps">Evidence confidence</div>
          <div className="mt-2">
            <EvidenceBadge confidence={results.evidenceConfidence} />
          </div>
        </div>
        <div className="bg-card px-5 py-5">
          <div className="label-caps">Total simulated observations</div>
          <div className="tabular mt-1.5 text-2xl font-semibold text-foreground">
            {totalObservations.toLocaleString()}
          </div>
        </div>
        <div className="bg-card px-5 py-5">
          <div className="label-caps">Pilot size</div>
          <div className="tabular mt-1.5 text-2xl font-semibold text-foreground">
            {experiment.pilotSize.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">per variant</p>
        </div>
      </section>

      <ContextCard experiment={experiment} />

      {/* Metric comparison table */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Variant comparison</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Aggregated across {totalObservations.toLocaleString()} simulated observations.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Metric</TableHead>
              {variants.map((v) => (
                <TableHead key={v.id} className="text-right">
                  {v.name}
                  {v.id === winnerId ? (
                    <span className="ml-1.5 text-primary" title="Predicted winner">
                      ★
                    </span>
                  ) : null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SNAPSHOT_METRIC_DEFS.map((m) => {
              const values = variants
                .map((v) => results.variantMetrics[v.id]?.[m.key])
                .filter((v): v is number => typeof v === "number");
              const best = m.lowerIsBetter ? Math.min(...values) : Math.max(...values);
              return (
                <TableRow key={m.key}>
                  <TableCell className="pl-5">
                    <div className="font-medium text-foreground">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.help}</div>
                    {m.role === "informational" ? (
                      <Pill tone="neutral" className="mt-1">
                        Informational
                      </Pill>
                    ) : null}
                  </TableCell>
                  {variants.map((v) => {
                    const value = results.variantMetrics[v.id]?.[m.key];
                    if (typeof value !== "number") return <TableCell key={v.id} />;
                    return (
                      <TableCell key={v.id} className="tabular text-right">
                        <span
                          className={cn(
                            "text-sm",
                            value === best ? "font-semibold text-foreground" : "text-foreground/70",
                          )}
                        >
                          {value}
                          <span className="ml-0.5 text-xs text-muted-foreground">{m.unit}</span>
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {/* Chart */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Comparison chart</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Confusion rate and no-action rate are inverse metrics — lower is better.
        </p>
        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval={0}
                height={56}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              {variants.map((v, i) => (
                <Bar
                  key={v.id}
                  dataKey={v.name}
                  fill={chartColors[i % chartColors.length]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={26}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Rationale + observed issues */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Why this variant performed better
            </h2>
          </div>
          {results.primaryDifference ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              {results.primaryDifference}
            </p>
          ) : null}
          {results.rationale ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{results.rationale}</p>
          ) : null}
          <p className="mt-4 text-[11px] text-muted-foreground">
            Generated summary based on simulated behaviour. Treat as a hypothesis to test with real
            users.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-warning" />
            <h2 className="text-sm font-semibold text-foreground">Observed issues</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {results.observedIssues.map((issue) => {
              const variantName =
                experiment.variants.find((v) => v.id === issue.variantId)?.name ?? "—";
              return (
                <li key={issue.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill
                      tone={
                        issue.severity === "high"
                          ? "warning"
                          : issue.severity === "medium"
                            ? "info"
                            : "neutral"
                      }
                    >
                      {issue.severity}
                    </Pill>
                    <span className="text-xs text-muted-foreground">{variantName}</span>
                    {typeof issue.affectedShare === "number" ? (
                      <span className="text-xs text-muted-foreground">
                        · {issue.affectedShare}% affected
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-foreground">{issue.title}</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {issue.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Behavioural cohorts */}
      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Behavioural cohorts</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Synthetic population varied around the primary persona.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {results.behaviouralCohorts.map((cohort) => {
            const scores = variants.map((v) => cohort.variantScores[v.id] ?? 0);
            const bestIdx = scores.indexOf(Math.max(...scores));
            const bestVariant = variants[bestIdx];
            return (
              <div key={cohort.id} className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground">{cohort.name}</span>
                  <span className="tabular text-sm text-muted-foreground">{cohort.share}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${cohort.share}%` }}
                  />
                </div>
                {cohort.summary ? (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {cohort.summary}
                  </p>
                ) : null}
                {bestVariant ? (
                  <div className="mt-3">
                    <Pill tone="accent">Prefers {bestVariant.name}</Pill>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Click map preview */}
      {Object.keys(results.clickPoints).length > 0 ? (
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <MousePointerClick className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Simulated click distribution</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Synthetic first-click locations overlaid on each variant screenshot.
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => {
              const points = results.clickPoints[variant.id] ?? [];
              const target = variant.detectedTarget;
              return (
                <div key={variant.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{variant.name}</span>
                    {target ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Target className="size-3" />
                        {target.label}
                      </span>
                    ) : null}
                  </div>
                  <ClickMapPreview
                    screenshotUrl={variant.screenshotUrl}
                    target={target?.boundingBox}
                    points={points}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Recommendation */}
      <section className="rounded-lg border border-primary/25 bg-accent p-6">
        <div className="label-caps text-accent-foreground/70">Recommendation</div>
        <p className="mt-2 text-lg font-semibold text-accent-foreground">
          {results.recommendation}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-accent-foreground/80">
          Synthetic pre-testing narrows the field. Confirm the outcome with real participants before
          shipping — simulated sessions are not a replacement for usability research.
        </p>
      </section>
    </div>
  );
}

// ─── Click map preview ───────────────────────────────────────────

function ClickMapPreview({
  screenshotUrl,
  target,
  points,
}: {
  screenshotUrl: string | undefined;
  target: { x: number; y: number; width: number; height: number } | undefined;
  points: { x: number; y: number; correct: boolean }[];
}) {
  if (!screenshotUrl) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-md border border-border bg-surface text-xs text-muted-foreground">
        No screenshot
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-surface">
      <img
        src={screenshotUrl}
        alt="Variant screenshot"
        className="absolute inset-0 size-full object-cover"
        draggable={false}
      />
      {/* Target bounding box */}
      {target ? (
        <div
          className="pointer-events-none absolute border-2 border-primary/70"
          style={{
            left: `${target.x * 100}%`,
            top: `${target.y * 100}%`,
            width: `${target.width * 100}%`,
            height: `${target.height * 100}%`,
          }}
        />
      ) : null}
      {/* Click points */}
      {points.map((pt, i) => (
        <div
          key={i}
          className={cn(
            "pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/50",
            pt.correct ? "bg-success" : "bg-destructive",
          )}
          style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%` }}
        />
      ))}
    </div>
  );
}

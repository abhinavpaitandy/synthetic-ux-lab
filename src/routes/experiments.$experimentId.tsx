import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, TriangleAlert } from "lucide-react";
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
import { ConfidenceBadge, Pill, StageBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  METRIC_DEFS,
  formatCount,
  formatDate,
  getExperiment,
  type Experiment,
  type VariantMetrics,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/experiments/$experimentId")({
  loader: ({ params }) => ({ experiment: getExperiment(params.experimentId) ?? null }),
  head: ({ loaderData }) => {
    const name = loaderData?.experiment?.name ?? "Experiment";
    const title = `${name} — Synthetic UX Lab`;
    const description =
      "Synthetic simulation results comparing interface variants on task success, efficiency and abandonment.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData?.experiment ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: ResultsPage,
});

function ResultsPage() {
  const { experiment } = Route.useLoaderData();

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

  return (
    <AppShell>
      <PageHeader
        eyebrow={`${experiment.id} · ${experiment.owner} · updated ${formatDate(experiment.updatedAt)}`}
        title={experiment.name}
        description={experiment.task}
        actions={
          <>
            <StatusBadge status={experiment.status} />
            <StageBadge stage={experiment.stage} />
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
        {experiment.results ? (
          <Results experiment={experiment} />
        ) : (
          <PendingState experiment={experiment} />
        )}
      </PageBody>
    </AppShell>
  );
}

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
            ? `Running ${formatCount(experiment.simulationSize)} synthetic sessions across ${experiment.variants.length} variants. Results appear here when the pilot completes.`
            : "Finish the setup and run a pilot to generate comparative results for this experiment."}
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

function ContextCard({ experiment }: { experiment: Experiment }) {
  return (
    <section className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
      {[
        { label: "Primary persona", value: experiment.persona },
        { label: "User task", value: experiment.task },
        { label: "Success criteria", value: experiment.successCriteria },
      ].map((f) => (
        <div key={f.label} className="bg-card px-5 py-4">
          <div className="label-caps">{f.label}</div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{f.value}</p>
        </div>
      ))}
    </section>
  );
}

function Results({ experiment }: { experiment: Experiment }) {
  const results = experiment.results!;
  const winner = experiment.variants.find((v) => v.id === results.winnerVariantId)!;
  const variants = experiment.variants.filter((v) => v.metrics);

  const chartData = METRIC_DEFS.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    variants.forEach((v) => {
      row[v.name] = v.metrics![m.key];
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
          <div className="mt-1.5 text-2xl font-semibold text-accent-foreground">{winner.name}</div>
          <p className="mt-1 text-xs text-accent-foreground/80">{winner.description}</p>
        </div>
        <div className="bg-card px-5 py-5">
          <div className="label-caps">Confidence</div>
          <div className="mt-2">
            <ConfidenceBadge confidence={results.confidence} />
          </div>
        </div>
        <div className="bg-card px-5 py-5">
          <div className="label-caps">Total synthetic simulations</div>
          <div className="tabular mt-1.5 text-2xl font-semibold text-foreground">
            {formatCount(experiment.simulationSize)}
          </div>
        </div>
        <div className="bg-card px-5 py-5">
          <div className="label-caps">Run stage</div>
          <div className="mt-2">
            <StageBadge stage={experiment.stage} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {experiment.stage === "pilot"
              ? "Directional signal — validate with humans."
              : "Large-population run."}
          </p>
        </div>
      </section>

      <ContextCard experiment={experiment} />

      {/* Metric comparison */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Variant comparison</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Aggregated across {formatCount(experiment.simulationSize)} synthetic sessions.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Metric</TableHead>
              {variants.map((v) => (
                <TableHead key={v.id} className="text-right">
                  {v.name}
                  {v.id === winner.id ? (
                    <span className="ml-1.5 text-primary" title="Predicted winner">
                      ★
                    </span>
                  ) : null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {METRIC_DEFS.map((m) => {
              const values = variants.map((v) => v.metrics![m.key]);
              const best = m.lowerIsBetter ? Math.min(...values) : Math.max(...values);
              return (
                <TableRow key={m.key}>
                  <TableCell className="pl-5">
                    <div className="font-medium text-foreground">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.help}</div>
                  </TableCell>
                  {variants.map((v) => {
                    const value = v.metrics![m.key];
                    return (
                      <TableCell key={v.id} className="tabular text-right">
                        <span
                          className={cn(
                            "text-sm",
                            value === best ? "font-semibold text-foreground" : "text-foreground/70",
                          )}
                        >
                          {value.toFixed(1)}
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
          Backtracking and abandonment are inverse metrics — lower is better.
        </p>
        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval={0}
                height={48}
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

      {/* Explanation + issues */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Why this variant performed better</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">{results.rationale}</p>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Generated summary based on simulated behaviour. Treat as a hypothesis to test with real
            users.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-warning" />
            <h2 className="text-sm font-semibold text-foreground">Observed usability issues</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {results.issues.map((issue) => {
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
                            ? "neutral"
                            : "neutral"
                      }
                    >
                      {issue.severity}
                    </Pill>
                    <span className="text-xs text-muted-foreground">{variantName}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-foreground">{issue.title}</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {issue.detail}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Segments */}
      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Behavioural segments</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Synthetic population split by simulated behaviour profile.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {results.segments.map((seg) => {
            const best = experiment.variants.find((v) => v.id === seg.bestVariantId);
            return (
              <div key={seg.id} className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground">{seg.name}</span>
                  <span className="tabular text-sm text-muted-foreground">{seg.share}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${seg.share}%` }} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{seg.summary}</p>
                {best ? (
                  <div className="mt-3">
                    <Pill tone="accent">Prefers {best.name}</Pill>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendation */}
      <section className="rounded-lg border border-primary/25 bg-accent p-6">
        <div className="label-caps text-accent-foreground/70">Recommendation</div>
        <p className="mt-2 text-lg font-semibold text-accent-foreground">
          {results.recommendation}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-accent-foreground/80">
          Synthetic pre-testing narrows the field. Confirm the outcome with real participants before
          shipping — simulated users are not a replacement for usability research.
        </p>
      </section>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";

import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { StatusBadge, Pill } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount, formatDate, listExperiments } from "@/lib/mock-data";

const TITLE = "Experiments — Synthetic UX Lab";
const DESCRIPTION =
  "Simulate user journeys across competing designs to identify likely usability problems and promising variants before human validation.";

export const Route = createFileRoute("/")({
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
  component: ExperimentsPage,
});

function ExperimentsPage() {
  const experiments = listExperiments();

  const summary = [
    { label: "Experiments", value: String(experiments.length) },
    {
      label: "Running",
      value: String(experiments.filter((e) => e.status === "running").length),
    },
    {
      label: "Simulations this month",
      value: formatCount(experiments.reduce((sum, e) => sum + e.simulationSize, 0)),
    },
    {
      label: "Results ready",
      value: String(experiments.filter((e) => e.results).length),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Synthetic UX Pre-Testing"
        title="Experiments"
        description={DESCRIPTION}
        actions={
          <Button asChild>
            <Link to="/experiments/new">
              <Plus className="size-4" />
              New experiment
            </Link>
          </Button>
        }
      />

      <PageBody>
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="bg-card px-5 py-4">
              <div className="label-caps">{s.label}</div>
              <div className="tabular mt-1.5 text-2xl font-semibold text-foreground">{s.value}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent experiments</h2>
            <span className="text-xs text-muted-foreground">Mock data</span>
          </div>

          {experiments.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Experiment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Variants</TableHead>
                  <TableHead className="text-right">Simulation size</TableHead>
                  <TableHead>Predicted winner</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments.map((exp) => {
                  const winner = exp.results
                    ? exp.variants.find((v) => v.id === exp.results!.winnerVariantId)
                    : undefined;
                  return (
                    <TableRow key={exp.id} className="group">
                      <TableCell className="pl-5">
                        <Link
                          to="/experiments/$experimentId"
                          params={{ experimentId: exp.id }}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {exp.name}
                        </Link>
                        <div className="tabular mt-0.5 text-xs text-muted-foreground">
                          {exp.id} · {exp.owner}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={exp.status} />
                      </TableCell>
                      <TableCell className="tabular text-right">{exp.variants.length}</TableCell>
                      <TableCell className="tabular text-right">
                        <span className="text-foreground">{formatCount(exp.simulationSize)}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground capitalize">
                          {exp.stage}
                        </span>
                      </TableCell>
                      <TableCell>
                        {winner ? (
                          <Pill tone="accent">{winner.name}</Pill>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular text-right text-sm text-muted-foreground">
                        {formatDate(exp.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/experiments/$experimentId"
                          params={{ experimentId: exp.id }}
                          aria-label={`Open ${exp.name}`}
                          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <ArrowRight className="size-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Synthetic simulations are a pre-testing signal. Use them to prioritise which variants and
          usability risks deserve human validation — not as a substitute for real users or
          usability research.
        </p>
      </PageBody>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <h3 className="text-sm font-semibold text-foreground">No experiments yet</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        Create your first experiment to compare two or three interface variants with synthetic user
        simulations.
      </p>
      <Button asChild className="mt-5">
        <Link to="/experiments/new">
          <Plus className="size-4" />
          New experiment
        </Link>
      </Button>
    </div>
  );
}

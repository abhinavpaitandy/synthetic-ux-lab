import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImageUp, Info, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageBody, PageHeader } from "@/components/app-shell";
import { Pill } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PILOT_SIZES, TEST_SIZES, formatCount, type SimulationStage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TITLE = "New experiment — Synthetic UX Lab";
const DESCRIPTION =
  "Define the persona, task and success criteria, add two or three UI variants, and choose a pilot simulation scale.";

export const Route = createFileRoute("/experiments/new")({
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
  component: NewExperimentPage,
});

interface DraftVariant {
  key: string;
  name: string;
  source: string;
  file: string;
}

const VARIANT_NAMES = ["Variant A", "Variant B", "Variant C"];

function NewExperimentPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [task, setTask] = useState("");
  const [criteria, setCriteria] = useState("");
  const [variants, setVariants] = useState<DraftVariant[]>([
    { key: "a", name: "Variant A", source: "", file: "" },
    { key: "b", name: "Variant B", source: "", file: "" },
  ]);
  const [stage, setStage] = useState<SimulationStage>("pilot");
  const [size, setSize] = useState<number>(500);
  const [running, setRunning] = useState(false);

  function updateVariant(key: string, patch: Partial<DraftVariant>) {
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    if (variants.length >= 3) return;
    const key = ["a", "b", "c"][variants.length];
    setVariants((vs) => [...vs, { key, name: VARIANT_NAMES[vs.length], source: "", file: "" }]);
  }

  function removeVariant(key: string) {
    if (variants.length <= 2) return;
    setVariants((vs) =>
      vs.filter((v) => v.key !== key).map((v, i) => ({ ...v, name: VARIANT_NAMES[i] })),
    );
  }

  function runSimulation() {
    if (!name.trim() || !persona.trim() || !task.trim()) {
      toast.error("Add an experiment name, persona and task before running.");
      return;
    }
    setRunning(true);
    // Placeholder: no simulation engine yet. Route to a completed mock result.
    setTimeout(() => {
      toast.success(`Pilot queued — ${formatCount(size)} synthetic sessions`);
      navigate({ to: "/experiments/$experimentId", params: { experimentId: "exp-1042" } });
    }, 1100);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Synthetic UX Pre-Testing"
        title="New experiment"
        description={DESCRIPTION}
        actions={
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        }
      />

      <PageBody>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Section step="01" title="Experiment" hint="Naming and ownership.">
              <Field label="Experiment name" htmlFor="exp-name">
                <Input
                  id="exp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Checkout — one-page vs. stepped flow"
                />
              </Field>
            </Section>

            <Section
              step="02"
              title="User context"
              hint="What the synthetic population is modelled on."
            >
              <Field label="Primary persona description" htmlFor="persona">
                <Textarea
                  id="persona"
                  rows={3}
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="First-time buyer on desktop, moderate digital confidence, easily distracted."
                />
              </Field>
              <Field label="User task / use case" htmlFor="task">
                <Textarea
                  id="task"
                  rows={2}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Purchase a single in-stock item using a saved address and a new card."
                />
              </Field>
              <Field label="Success criteria" htmlFor="criteria">
                <Textarea
                  id="criteria"
                  rows={2}
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  placeholder="Order confirmation reached in under 6 steps with no validation error."
                />
              </Field>
            </Section>

            <Section
              step="03"
              title="UI variants"
              hint="Compare two or three competing designs."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  disabled={variants.length >= 3}
                >
                  <Plus className="size-4" />
                  Add variant
                </Button>
              }
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {variants.map((v) => (
                  <div
                    key={v.key}
                    className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{v.name}</span>
                      {variants.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => removeVariant(v.key)}
                          aria-label={`Remove ${v.name}`}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>

                    <label
                      className="mt-3 flex cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong bg-card px-3 py-6 text-center"
                      title="Upload processing is not wired up in this prototype"
                    >
                      <ImageUp className="size-5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Upload screenshot</span>
                      <span className="text-[11px] text-muted-foreground">
                        PNG or JPG · placeholder only
                      </span>
                    </label>

                    <div className="mt-3">
                      <Label
                        htmlFor={`src-${v.key}`}
                        className="label-caps mb-1.5 block normal-case"
                      >
                        URL or HTML
                      </Label>
                      <Input
                        id={`src-${v.key}`}
                        value={v.source}
                        onChange={(e) => updateVariant(v.key, { source: e.target.value })}
                        placeholder="https://… or paste HTML"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section step="04" title="Simulation scale" hint="Start with a pilot run.">
              <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
                {(["pilot", "test"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStage(s);
                      setSize(s === "pilot" ? 500 : 10000);
                    }}
                    className={cn(
                      "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                      stage === s
                        ? "bg-card text-foreground shadow-card"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s === "pilot" ? "Pilot" : "Test"}
                  </button>
                ))}
              </div>

              {stage === "test" ? (
                <div className="mt-4 flex items-start gap-2.5 rounded-md border border-warning/35 bg-warning/10 px-4 py-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-warning" />
                  <p className="text-xs leading-relaxed text-foreground">
                    <span className="font-semibold">Advanced capability — not yet available.</span>{" "}
                    Test-scale runs are shown here for planning. Large-population simulation will be
                    enabled in a later release.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(stage === "pilot" ? PILOT_SIZES : TEST_SIZES).map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={stage === "test"}
                    onClick={() => setSize(n)}
                    className={cn(
                      "rounded-md border px-4 py-3 text-left transition-colors",
                      size === n && stage === "pilot"
                        ? "border-primary bg-accent"
                        : "border-border bg-card hover:border-border-strong",
                      stage === "test" && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <div className="tabular text-lg font-semibold text-foreground">
                      {formatCount(n)}
                    </div>
                    <div className="text-xs text-muted-foreground">simulations</div>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <aside className="xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground">Run summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Experiment" value={name || "Untitled experiment"} />
                <SummaryRow label="Variants" value={variants.map((v) => v.name).join(", ")} />
                <SummaryRow
                  label="Stage"
                  value={
                    <Pill tone={stage === "pilot" ? "accent" : "warning"}>
                      {stage === "pilot" ? "Pilot" : "Test (future)"}
                    </Pill>
                  }
                />
                <SummaryRow label="Population" value={`${formatCount(size)} synthetic sessions`} />
              </dl>

              <Button
                className="mt-5 w-full"
                onClick={runSimulation}
                disabled={running || stage === "test"}
              >
                <Play className="size-4" />
                {running ? "Queuing simulation…" : "Run simulation"}
              </Button>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Prototype: no simulation engine is connected. Running opens a sample result set.
              </p>
            </div>
          </aside>
        </div>
      </PageBody>
    </AppShell>
  );
}

function Section({
  step,
  title,
  hint,
  action,
  children,
}: {
  step: string;
  title: string;
  hint: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="tabular text-xs font-semibold text-muted-foreground">{step}</span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

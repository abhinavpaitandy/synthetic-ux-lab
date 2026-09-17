import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDraft } from "@/lib/draft-store";
import type { DeviceType } from "@/lib/types";

const TITLE = "Experiment Setup — Synthetic UX Lab";
const DESCRIPTION =
  "Define who the user is, what they're trying to do, and what action counts as success.";

export const Route = createFileRoute("/experiments/new/")({
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
  component: SetupPage,
});

type FieldKey = "name" | "persona" | "task" | "successEvent";

const ERROR_MESSAGES: Record<FieldKey, string> = {
  name: "Enter an experiment name.",
  persona: "Describe the primary persona.",
  task: "Describe the user task.",
  successEvent: "Define the success event.",
};

function SetupPage() {
  const navigate = useNavigate();
  const { draft, updateExperimentDetails } = useDraft();
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const firstInvalidRef = useRef<HTMLElement | null>(null);

  function validate(): boolean {
    const next: Partial<Record<FieldKey, string>> = {};
    (["name", "persona", "task", "successEvent"] as const).forEach((key) => {
      if (!draft[key].trim()) {
        next[key] = ERROR_MESSAGES[key];
      }
    });
    setErrors(next);

    if (Object.keys(next).length > 0) {
      const firstKey = (Object.keys(next) as FieldKey[])[0];
      const el = document.getElementById(`field-${firstKey}`);
      firstInvalidRef.current = el;
      el?.focus();
      return false;
    }
    return true;
  }

  function handleContinue() {
    if (!validate()) return;
    navigate({ to: "/experiments/new/variants" });
  }

  function clearError(key: FieldKey) {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="New Experiment · Step 1 of 5"
        title="Experiment Setup"
        description={DESCRIPTION}
        actions={
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to Experiments
            </Link>
          </Button>
        }
      />

      <PageBody>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {/* Test type context */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="label-caps">Test type</div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  Snapshot / Decision Test
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Tests one screen and one decision point across competing UI variants.
                </p>
              </div>
            </div>

            {/* Primary form */}
            <section className="rounded-lg border border-border bg-card p-6 shadow-card">
              <div className="space-y-5">
                {/* Experiment name */}
                <FormField id="field-name" label="Experiment name" required error={errors.name}>
                  <Input
                    id="field-name"
                    value={draft.name}
                    onChange={(e) => {
                      updateExperimentDetails({ name: e.target.value });
                      clearError("name");
                    }}
                    placeholder="e.g. Delivery option discoverability"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "error-name" : "help-name"}
                  />
                  <FieldHelp id="help-name">
                    Use a short name that describes the decision you are testing.
                  </FieldHelp>
                  {errors.name && <FieldError id="error-name">{errors.name}</FieldError>}
                </FormField>

                {/* Primary persona */}
                <FormField
                  id="field-persona"
                  label="Primary persona"
                  required
                  error={errors.persona}
                >
                  <Textarea
                    id="field-persona"
                    rows={3}
                    value={draft.persona}
                    onChange={(e) => {
                      updateExperimentDetails({ persona: e.target.value });
                      clearError("persona");
                    }}
                    placeholder="Frequent online fashion shopper. Digitally confident and values speed and convenience."
                    aria-invalid={!!errors.persona}
                    aria-describedby={errors.persona ? "error-persona" : "help-persona"}
                  />
                  <FieldHelp id="help-persona">
                    Describe the primary user context. Behavioural variations will be generated
                    around this persona later.
                  </FieldHelp>
                  {errors.persona && <FieldError id="error-persona">{errors.persona}</FieldError>}
                </FormField>

                {/* User task */}
                <FormField id="field-task" label="User task / intent" required error={errors.task}>
                  <Textarea
                    id="field-task"
                    rows={2}
                    value={draft.task}
                    onChange={(e) => {
                      updateExperimentDetails({ task: e.target.value });
                      clearError("task");
                    }}
                    placeholder="Choose the fastest available delivery option."
                    aria-invalid={!!errors.task}
                    aria-describedby={errors.task ? "error-task" : "help-task"}
                  />
                  <FieldHelp id="help-task">
                    Describe one clear goal the user should accomplish from this screen.
                  </FieldHelp>
                  {errors.task && <FieldError id="error-task">{errors.task}</FieldError>}
                </FormField>

                {/* Success event */}
                <FormField
                  id="field-successEvent"
                  label="Success event"
                  required
                  error={errors.successEvent}
                >
                  <Textarea
                    id="field-successEvent"
                    rows={2}
                    value={draft.successEvent}
                    onChange={(e) => {
                      updateExperimentDetails({ successEvent: e.target.value });
                      clearError("successEvent");
                    }}
                    placeholder="Express Delivery is selected."
                    aria-invalid={!!errors.successEvent}
                    aria-describedby={
                      errors.successEvent ? "error-successEvent" : "help-successEvent"
                    }
                  />
                  <FieldHelp id="help-successEvent">
                    Describe the observable action that counts as success.
                  </FieldHelp>
                  {errors.successEvent && (
                    <FieldError id="error-successEvent">{errors.successEvent}</FieldError>
                  )}
                </FormField>

                {/* Device context */}
                <FormField id="field-device" label="Device context" required>
                  <RadioCards
                    name="device"
                    value={draft.device}
                    onChange={(d) => updateExperimentDetails({ device: d })}
                    options={[
                      {
                        value: "mobile" as DeviceType,
                        label: "Mobile",
                        description: "Evaluate the screenshot in a mobile interaction context.",
                      },
                      {
                        value: "desktop" as DeviceType,
                        label: "Desktop",
                        description: "Evaluate the screenshot in a desktop interaction context.",
                      },
                    ]}
                  />
                </FormField>

                {/* Hypothesis */}
                <FormField id="field-hypothesis" label="Hypothesis" optional>
                  <Textarea
                    id="field-hypothesis"
                    rows={2}
                    value={draft.hypothesis ?? ""}
                    onChange={(e) => updateExperimentDetails({ hypothesis: e.target.value })}
                    placeholder="Highlighting the fastest option will increase correct first-action selection."
                    aria-describedby="help-hypothesis"
                  />
                  <FieldHelp id="help-hypothesis">
                    Useful for documenting what you expect to learn. It does not determine the
                    simulated result.
                  </FieldHelp>
                </FormField>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="size-4" />
                  Cancel
                </Link>
              </Button>
              <Button onClick={handleContinue}>
                Continue to Variants
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Optional summary panel */}
          <aside className="hidden xl:block xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Experiment" value={draft.name || "Untitled"} />
                <SummaryRow label="Test" value="Snapshot" />
                <SummaryRow
                  label="Device"
                  value={draft.device === "mobile" ? "Mobile" : "Desktop"}
                />
                <SummaryRow label="Next" value="Upload 2–3 variants" />
              </dl>
            </div>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function FormField({
  id,
  label,
  required,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
        {optional && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">Optional</span>
        )}
      </Label>
      {children}
    </div>
  );
}

function FieldHelp({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {children}
    </p>
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

interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

function RadioCards<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioCardOption<T>[];
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer flex-col gap-1 rounded-md border px-4 py-3 transition-colors",
              isSelected
                ? "border-primary bg-accent"
                : "border-border bg-card hover:border-border-strong",
            )}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="size-4 accent-primary"
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {opt.label}
              </span>
            </div>
            <span className="text-xs leading-relaxed text-muted-foreground">{opt.description}</span>
          </label>
        );
      })}
    </div>
  );
}

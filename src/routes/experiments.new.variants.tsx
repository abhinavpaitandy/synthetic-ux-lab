import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { VariantUploadCard } from "@/components/variant-upload-card";
import { useDraft } from "@/lib/draft-store";
import { generateMockTarget } from "@/lib/mock-targets";

const TITLE = "Upload UI Variants — Synthetic UX Lab";
const DESCRIPTION = "Add 2–3 versions of the same decision point.";

export const Route = createFileRoute("/experiments/new/variants")({
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
  component: VariantUploadPage,
});

function VariantUploadPage() {
  const navigate = useNavigate();
  const { draft, addVariant, removeVariant, updateVariant, setDetectedTarget } = useDraft();
  const [showValidation, setShowValidation] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const variants = draft.variants;
  const allHaveScreenshots = variants.every((v) => v.screenshotUrl);
  const canContinue = variants.length >= 2 && allHaveScreenshots;

  function handleContinue() {
    if (!canContinue) {
      setShowValidation(true);
      return;
    }

    setIsAnalysing(true);
    setTimeout(() => {
      variants.forEach((variant, index) => {
        const target = generateMockTarget(index, draft.successEvent);
        setDetectedTarget(variant.id, target);
      });
      navigate({ to: "/experiments/new/targets" });
    }, 350);
  }

  const screensReady = variants.filter((v) => v.screenshotUrl).length;

  return (
    <>
      <PageHeader
        eyebrow="New Experiment · Step 2 of 5"
        title="Upload UI Variants"
        description={DESCRIPTION}
        actions={
          <Button variant="outline" asChild>
            <Link to="/experiments/new">
              <ArrowLeft className="size-4" />
              Back to Setup
            </Link>
          </Button>
        }
      />

      <PageBody>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {/* Experiment context */}
            <div className="rounded-lg border border-border bg-surface px-5 py-4">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
                <ContextRow label="Task" value={draft.task || "—"} />
                <ContextRow label="Success event" value={draft.successEvent || "—"} />
                <ContextRow
                  label="Device"
                  value={draft.device === "mobile" ? "Mobile" : "Desktop"}
                />
              </dl>
            </div>

            {/* Validation banner */}
            {showValidation && !canContinue && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
              >
                <p className="text-sm font-medium text-destructive">
                  {variants.length < 2
                    ? "Add at least 2 variants to continue."
                    : "Upload a screenshot for every variant to continue."}
                </p>
              </div>
            )}

            {/* Variant cards */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {variants.map((variant, index) => (
                <VariantUploadCard
                  key={variant.id}
                  variant={variant}
                  index={index}
                  canRemove={variants.length > 2}
                  onNameChange={(name) => updateVariant(variant.id, { name })}
                  onDescriptionChange={(description) => updateVariant(variant.id, { description })}
                  onScreenshotChange={(screenshotUrl) =>
                    updateVariant(variant.id, { screenshotUrl })
                  }
                  onScreenshotRemove={() =>
                    updateVariant(variant.id, {
                      screenshotUrl: undefined,
                      detectedTarget: undefined,
                    })
                  }
                  onRemoveVariant={() => removeVariant(variant.id)}
                  error={
                    showValidation && !variant.screenshotUrl
                      ? `Upload a screenshot for ${variant.name}.`
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Add variant C */}
            {variants.length < 3 && (
              <Button variant="outline" onClick={addVariant}>
                <Plus className="size-4" />
                Add another variant
              </Button>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link to="/experiments/new">
                  <ArrowLeft className="size-4" />
                  Back to Setup
                </Link>
              </Button>
              <Button onClick={handleContinue} disabled={isAnalysing}>
                {isAnalysing ? "Analysing…" : "Analyse Screens"}
                {!isAnalysing && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Summary panel */}
          <aside className="hidden xl:block xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Experiment" value={draft.name || "Untitled"} />
                <SummaryRow label="Variants" value={`${variants.length} of 3`} />
                <SummaryRow label="Screens ready" value={`${screensReady} of ${variants.length}`} />
                <SummaryRow label="Next" value="Review detected targets" />
              </dl>
            </div>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
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

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { TargetReviewCard } from "@/components/target-review-card";
import { useDraft } from "@/lib/draft-store";
import { isTargetReviewed } from "@/lib/types";

const TITLE = "Review Detected Targets — Synthetic UX Lab";
const DESCRIPTION = "Confirm the interaction area that represents success in each variant.";

export const Route = createFileRoute("/experiments/new/targets")({
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
  component: TargetReviewPage,
});

function TargetReviewPage() {
  const navigate = useNavigate();
  const { draft, confirmTarget, adjustTarget } = useDraft();

  const variants = draft.variants;
  const needsAnalysis = variants.some((v) => !v.screenshotUrl || !v.detectedTarget);

  const reviewedCount = variants.filter(
    (v) => v.detectedTarget && isTargetReviewed(v.detectedTarget),
  ).length;
  const allReviewed = reviewedCount === variants.length && variants.length > 0;

  if (needsAnalysis) {
    return (
      <>
        <PageHeader
          eyebrow="New Experiment · Step 3 of 5"
          title="Review Detected Targets"
          description={DESCRIPTION}
        />
        <PageBody>
          <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Screens need analysis first</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Upload and analyse each variant before reviewing targets.
            </p>
            <Button asChild className="mt-5">
              <Link to="/experiments/new/variants">
                <ArrowLeft className="size-4" />
                Back to Variants
              </Link>
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="New Experiment · Step 3 of 5"
        title="Review Detected Targets"
        description={DESCRIPTION}
        actions={
          <Button variant="outline" asChild>
            <Link to="/experiments/new/variants">
              <ArrowLeft className="size-4" />
              Back to Variants
            </Link>
          </Button>
        }
      />

      <PageBody>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {/* Supporting note */}
            <p className="text-sm text-muted-foreground">
              These targets will be used to evaluate whether a synthetic user's first action matches
              the expected action.
            </p>

            {/* Context summary */}
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

            {/* Review progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {reviewedCount} of {variants.length} targets reviewed
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${variants.length > 0 ? (reviewedCount / variants.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Review cards */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {variants.map((variant) => (
                <TargetReviewCard
                  key={variant.id}
                  variant={variant}
                  onConfirm={() => confirmTarget(variant.id)}
                  onAdjust={(box) => adjustTarget(variant.id, box)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" asChild>
                <Link to="/experiments/new/variants">
                  <ArrowLeft className="size-4" />
                  Back to Variants
                </Link>
              </Button>
              <Button
                disabled={!allReviewed}
                onClick={() => navigate({ to: "/experiments/new/simulation" })}
              >
                Continue to Simulation
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Summary panel */}
          <aside className="hidden xl:block xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Experiment" value={draft.name || "Untitled"} />
                <SummaryRow label="Variants" value={String(variants.length)} />
                <SummaryRow
                  label="Targets reviewed"
                  value={`${reviewedCount} of ${variants.length}`}
                />
                <SummaryRow label="Next" value="Configure simulation" />
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

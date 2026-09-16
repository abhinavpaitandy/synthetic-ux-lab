import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/experiments/new/targets")({
  head: () => ({
    meta: [
      { title: "Target Review — Synthetic UX Lab" },
      {
        name: "description",
        content:
          "Review the interaction targets automatically detected within each uploaded screenshot.",
      },
    ],
  }),
  component: TargetReviewPage,
});

function TargetReviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 3 of 5 · Targets"
        title="Target Review"
        description="Review the interaction targets automatically detected within each uploaded screenshot."
        actions={
          <Button variant="outline" asChild>
            <Link to="/experiments/new/variants">
              <ArrowLeft className="size-4" />
              Back to variants
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            Target detection and review will appear here.
          </p>
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link to="/experiments/new/simulation">
              Continue to simulation setup
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </PageBody>
    </>
  );
}

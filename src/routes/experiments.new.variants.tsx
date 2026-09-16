import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/experiments/new/variants")({
  head: () => ({
    meta: [
      { title: "Variant Upload — Synthetic UX Lab" },
      { name: "description", content: "Upload screenshots for each interface variant." },
    ],
  }),
  component: VariantUploadPage,
});

function VariantUploadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 2 of 5 · Variants"
        title="Variant Upload"
        description="Upload a screenshot for each interface variant you want to compare."
        actions={
          <Button variant="outline" asChild>
            <Link to="/experiments/new">
              <ArrowLeft className="size-4" />
              Back to setup
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            Variant upload and screenshot management will appear here.
          </p>
        </div>
        <div className="mt-6">
          <Button asChild>
            <Link to="/experiments/new/targets">
              Continue to target review
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </PageBody>
    </>
  );
}

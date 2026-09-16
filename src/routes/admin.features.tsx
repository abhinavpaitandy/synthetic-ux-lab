import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/admin/features")({
  head: () => ({
    meta: [
      { title: "Feature Flags — Synthetic UX Lab" },
      { name: "description", content: "Toggle features and manage rollouts." },
    ],
  }),
  component: FeatureFlagsPage,
});

function FeatureFlagsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin Center"
        title="Feature Flags"
        description="Toggle features and manage rollouts."
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            Feature flag management will appear here.
          </p>
        </div>
      </PageBody>
    </>
  );
}

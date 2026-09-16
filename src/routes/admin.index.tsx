import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — Synthetic UX Lab" },
      { name: "description", content: "System overview and recent activity." },
    ],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin Center"
        title="Overview"
        description="System overview, recent activity, and key metrics."
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            Admin overview content will appear here.
          </p>
        </div>
      </PageBody>
    </>
  );
}

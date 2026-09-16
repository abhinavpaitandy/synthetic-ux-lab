import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/admin/population")({
  head: () => ({
    meta: [
      { title: "Synthetic Population — Synthetic UX Lab" },
      {
        name: "description",
        content: "Manage persona profiles and behavioural segments.",
      },
    ],
  }),
  component: SyntheticPopulationPage,
});

function SyntheticPopulationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin Center"
        title="Synthetic Population"
        description="Manage persona profiles and behavioural segments."
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            Synthetic population management will appear here.
          </p>
        </div>
      </PageBody>
    </>
  );
}

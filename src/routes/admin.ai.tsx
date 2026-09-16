import { createFileRoute } from "@tanstack/react-router";

import { PageBody, PageHeader } from "@/components/app-shell";

export const Route = createFileRoute("/admin/ai")({
  head: () => ({
    meta: [
      { title: "AI & Simulation — Synthetic UX Lab" },
      {
        name: "description",
        content: "Model configuration, simulation parameters, and provider settings.",
      },
    ],
  }),
  component: AISimulationPage,
});

function AISimulationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin Center"
        title="AI & Simulation"
        description="Model configuration, simulation parameters, and provider settings."
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            AI and simulation configuration will appear here.
          </p>
        </div>
      </PageBody>
    </>
  );
}

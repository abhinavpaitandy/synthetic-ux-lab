import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PageBody, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/experiments/new/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation Setup — Synthetic UX Lab" },
      {
        name: "description",
        content: "Configure the simulation scale and parameters for your snapshot test.",
      },
    ],
  }),
  component: SimulationSetupPage,
});

function SimulationSetupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 4 of 5 · Simulation"
        title="Simulation Setup"
        description="Configure the simulation scale and parameters for your snapshot test."
        actions={
          <Button variant="outline" asChild>
            <Link to="/experiments/new/targets">
              <ArrowLeft className="size-4" />
              Back to targets
            </Link>
          </Button>
        }
      />
      <PageBody>
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            Simulation configuration will appear here.
          </p>
        </div>
      </PageBody>
    </>
  );
}

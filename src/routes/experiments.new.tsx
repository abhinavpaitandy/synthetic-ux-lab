import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { ExperimentStepper } from "@/components/experiment-stepper";

export const Route = createFileRoute("/experiments/new")({
  head: () => ({
    meta: [{ title: "New Experiment — Synthetic UX Lab" }],
  }),
  component: WizardLayout,
});

function WizardLayout() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const normalized = pathname.replace(/\/$/, "");
  const stepMap: Record<string, number> = {
    "/experiments/new": 1,
    "/experiments/new/variants": 2,
    "/experiments/new/targets": 3,
    "/experiments/new/simulation": 4,
  };
  const currentStep = stepMap[normalized] ?? 1;

  return (
    <AppShell>
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-8 py-3">
          <ExperimentStepper currentStep={currentStep} />
        </div>
      </div>
      <Outlet />
    </AppShell>
  );
}

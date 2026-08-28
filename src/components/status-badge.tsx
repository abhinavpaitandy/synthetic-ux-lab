import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Confidence, ExperimentStatus, SimulationStage } from "@/lib/mock-data";

const pill = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        info: "border-info/25 bg-info/10 text-info",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/35 bg-warning/12 text-warning-foreground",
        accent: "border-primary/25 bg-accent text-accent-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type PillProps = VariantProps<typeof pill> & {
  children: React.ReactNode;
  className?: string;
};

export function Pill({ tone, className, children }: PillProps) {
  return <span className={cn(pill({ tone }), className)}>{children}</span>;
}

const STATUS_LABEL: Record<ExperimentStatus, string> = {
  draft: "Draft",
  running: "Running",
  complete: "Complete",
};

export function StatusBadge({ status }: { status: ExperimentStatus }) {
  const tone = status === "complete" ? "success" : status === "running" ? "info" : "neutral";
  return (
    <Pill tone={tone}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "complete"
            ? "bg-success"
            : status === "running"
              ? "bg-info animate-pulse"
              : "bg-muted-foreground",
        )}
      />
      {STATUS_LABEL[status]}
    </Pill>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const tone = confidence === "high" ? "success" : confidence === "medium" ? "warning" : "neutral";
  const label = confidence.charAt(0).toUpperCase() + confidence.slice(1);
  return <Pill tone={tone}>{label} confidence</Pill>;
}

export function StageBadge({ stage }: { stage: SimulationStage }) {
  return <Pill tone="accent">{stage === "pilot" ? "Pilot" : "Test"}</Pill>;
}

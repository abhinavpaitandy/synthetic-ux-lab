import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ExperimentStepperProps {
  currentStep: number;
  experimentId?: string;
  className?: string;
}

const STEPS = [
  { key: "setup", label: "Setup", to: "/experiments/new" },
  { key: "variants", label: "Variants", to: "/experiments/new/variants" },
  { key: "targets", label: "Targets", to: "/experiments/new/targets" },
  { key: "simulation", label: "Simulation", to: "/experiments/new/simulation" },
  { key: "results", label: "Results" },
] as { key: string; label: string; to?: string }[];

export function ExperimentStepper({
  currentStep,
  experimentId,
  className,
}: ExperimentStepperProps) {
  return (
    <nav
      aria-label={`Experiment progress, step ${currentStep} of ${STEPS.length}`}
      className={className}
    >
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const stateLabel = isCompleted
            ? "completed"
            : isCurrent
              ? "current"
              : "upcoming";

          const circle = (
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "border-2 border-primary text-primary",
                !isCompleted && !isCurrent && "border border-border text-muted-foreground",
              )}
            >
              {isCompleted ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                stepNum
              )}
            </span>
          );

          const labelEl = (
            <span
              className={cn(
                "hidden text-sm md:inline",
                isCurrent
                  ? "font-semibold text-foreground"
                  : isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          );

          const inner = (
            <span className="flex items-center gap-2">
              {circle}
              {labelEl}
            </span>
          );

          const ariaLabel = `Step ${stepNum}: ${step.label}, ${stateLabel}`;

          let linkElement: React.ReactNode;
          if (step.key === "results") {
            if (experimentId) {
              linkElement = (
                <Link
                  to="/experiments/$experimentId"
                  params={{ experimentId }}
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                  aria-label={ariaLabel}
                >
                  {inner}
                </Link>
              );
            } else {
              linkElement = (
                <div className="flex items-center gap-2" aria-label={ariaLabel}>
                  {inner}
                </div>
              );
            }
          } else {
            linkElement = (
              <Link
                to={step.to as never}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
                aria-label={ariaLabel}
              >
                {inner}
              </Link>
            );
          }

          return (
            <Fragment key={step.key}>
              <li
                className="flex items-center"
                aria-current={isCurrent ? "step" : undefined}
              >
                {linkElement}
              </li>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px w-6 md:w-10",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

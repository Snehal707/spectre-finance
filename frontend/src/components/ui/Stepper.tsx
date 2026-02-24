import type { ReactNode } from "react";

export type StepState = "pending" | "active" | "done";

export interface StepItem {
  label: string;
  state: StepState;
  description?: ReactNode;
}

interface StepperProps {
  steps: StepItem[];
}

export function Stepper({ steps }: StepperProps) {
  return (
    <ol className="flex w-full flex-col gap-2 text-[11px] text-spectre-muted">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isDone = step.state === "done";
        const isActive = step.state === "active";

        return (
          <li key={step.label} className="relative flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  isDone
                    ? "border-spectre-accent bg-spectre-accent text-slate-950"
                    : isActive
                    ? "border-spectre-accent/80 bg-slate-900 text-spectre-accent"
                    : "border-spectre-border-soft bg-slate-950 text-spectre-muted/70"
                }`}
              >
                {idx + 1}
              </div>
              {!isLast && (
                <div className="mt-1 h-6 w-px bg-spectre-border-soft/70" />
              )}
            </div>
            <div className="mt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold tracking-[0.16em] ${
                    isDone || isActive ? "text-spectre-accent" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {step.description && (
                <p className="mt-0.5 text-[11px] text-spectre-muted">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

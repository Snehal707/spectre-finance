import type { ReactNode } from "react";

export type StepState = "pending" | "active" | "done";

export interface StepItem {
  label: string;
  state: StepState;
  description?: ReactNode;
}

interface StepperProps {
  steps: StepItem[];
  theme?: "light" | "dark";
}

export function Stepper({ steps, theme = "dark" }: StepperProps) {
  const isLight = theme === "light";

  return (
    <ol className="flex w-full flex-col gap-2.5 text-xs">
      {steps.map((step, idx) => {
        const isDone = step.state === "done";
        const isActive = step.state === "active";
        const itemClass = isDone
          ? isLight
            ? "border-sky-300 bg-sky-50 text-slate-800"
            : "border-fhenix-blue/30 bg-fhenix-blue/10 text-spectre-text"
          : isActive
          ? isLight
            ? "border-sky-200 bg-white text-slate-900 shadow-[0_10px_22px_rgba(148,163,184,0.08)]"
            : "border-spectre-accent/40 bg-slate-950/70 text-spectre-text"
          : isLight
          ? "border-slate-200 bg-white text-slate-700"
          : "border-spectre-border-soft/70 bg-slate-950/40 text-spectre-muted";

        return (
          <li
            key={step.label}
            className={`clip-cyber relative overflow-hidden border px-3 py-3 ${itemClass}`}
          >
            <div
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-px ${
                isDone || isActive
                  ? "bg-gradient-to-r from-transparent via-fhenix-blue/80 to-transparent"
                  : isLight
                  ? "bg-gradient-to-r from-transparent via-slate-400 to-transparent"
                  : "bg-gradient-to-r from-transparent via-slate-700 to-transparent"
              }`}
            />
            <div className="relative flex items-start gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  isDone
                    ? isLight
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-spectre-accent bg-spectre-accent text-slate-950"
                    : isActive
                    ? isLight
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-spectre-accent/80 bg-slate-900 text-spectre-accent"
                    : isLight
                    ? "border-slate-300 bg-slate-50 text-slate-600"
                    : "border-spectre-border-soft bg-slate-950 text-spectre-muted/70"
                }`}
              >
                {idx + 1}
              </div>
              <div className="mt-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.25em] ${
                      isDone || isActive
                        ? isLight
                          ? "text-sky-700"
                          : "text-spectre-accent"
                        : isLight
                        ? "text-slate-500"
                        : "text-spectre-muted/70"
                    }`}
                  >
                    Step {idx + 1}
                  </span>
                </div>
                <span
                  className={`mt-1 block font-semibold tracking-[0.16em] ${
                    isDone || isActive
                      ? isLight
                        ? "text-slate-900"
                        : "text-spectre-text"
                      : isLight
                      ? "text-slate-700"
                      : ""
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <p
                    className={`mt-1 text-[11px] ${
                      isLight ? "text-slate-600" : "text-spectre-muted"
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

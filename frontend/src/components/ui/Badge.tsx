import type { ReactNode } from "react";

type BadgeTone = "accent" | "neutral" | "success" | "warn";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide";

  const toneClasses =
    tone === "accent"
      ? "bg-spectre-accent/10 text-spectre-accent border border-spectre-accent/40"
      : tone === "success"
      ? "bg-spectre-success/10 text-spectre-success border border-spectre-success/40"
      : tone === "warn"
      ? "bg-spectre-warn/10 text-spectre-warn border border-spectre-warn/40"
      : "bg-slate-900/60 text-spectre-muted border border-spectre-border-soft/60";

  return (
    <span className={`${base} ${toneClasses} ${className}`}>{children}</span>
  );
}

import type { ReactNode } from "react";

type CardTone = "default" | "subtle" | "danger" | "success";

interface CardProps {
  tone?: CardTone;
  theme?: "light" | "dark";
  title?: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({
  tone = "default",
  theme = "dark",
  title,
  description,
  headerExtra,
  children,
  className = "",
}: CardProps) {
  const glassClass = theme === "light" ? "spectre-glass-light" : "spectre-glass";
  const base =
    `${glassClass} clip-cyber px-5 py-5 md:px-6 md:py-6 relative overflow-hidden`;

  const toneClasses =
    tone === "danger"
      ? "border-spectre-danger/60"
      : tone === "success"
      ? "border-spectre-success/60"
      : tone === "subtle"
      ? "spectre-glass-soft"
      : "";

  return (
    <section className={`${base} ${toneClasses} ${className}`}>
      {(title || description || headerExtra) && (
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className={`font-cyber text-sm tracking-[0.22em] ${theme === "light" ? "text-slate-500" : "text-spectre-muted"}`}>
                {title}
              </h2>
            )}
            {description && (
              <p className={`text-sm ${theme === "light" ? "text-slate-500" : "text-spectre-muted"}`}>{description}</p>
            )}
          </div>
          {headerExtra && <div className="shrink-0">{headerExtra}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  theme?: "light" | "dark";
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  theme = "dark",
  icon,
  iconRight,
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isLight = theme === "light";
  const base =
    "clip-cyber-btn relative inline-flex items-center justify-center overflow-hidden border font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fhenix-blue/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80";

  const sizeClasses =
    size === "sm"
      ? "min-h-9 px-3.5 py-1.5 text-xs gap-2"
      : "min-h-11 px-4 py-2.5 text-sm gap-2.5";

  const variantClasses =
    variant === "primary"
      ? "border-spectre-accent/70 bg-[linear-gradient(135deg,rgba(37,209,244,1),rgba(141,241,255,0.92))] text-slate-950 shadow-spectre-neon hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(37,209,244,0.55)]"
      : variant === "secondary"
      ? isLight
        ? "border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] text-slate-900 shadow-[0_14px_30px_rgba(148,163,184,0.14)] hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50"
        : "border-spectre-border-soft/80 bg-slate-950/70 text-spectre-text shadow-[0_14px_32px_rgba(2,6,23,0.34)] hover:-translate-y-0.5 hover:border-spectre-accent/35 hover:bg-slate-900/80"
      : isLight
      ? "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white/85 hover:text-slate-900"
      : "border-transparent bg-transparent text-spectre-muted hover:border-spectre-border-soft/70 hover:bg-white/5 hover:text-spectre-text";

  const widthClasses = fullWidth ? "w-full" : "";
  const ringOffsetClass = isLight
    ? "focus-visible:ring-offset-slate-100"
    : "focus-visible:ring-offset-spectre-dark";

  return (
    <button
      type="button"
      className={`${base} ${ringOffsetClass} ${sizeClasses} ${variantClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {variant !== "ghost" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_48%)] opacity-80"
        />
      )}
      {icon && <span className="relative z-[1] inline-flex items-center">{icon}</span>}
      {children && (
        <span
          className={`relative z-[1] ${icon || iconRight ? "whitespace-nowrap" : ""}`}
        >
          {children}
        </span>
      )}
      {iconRight && (
        <span className="relative z-[1] inline-flex items-center">{iconRight}</span>
      )}
    </button>
  );
}

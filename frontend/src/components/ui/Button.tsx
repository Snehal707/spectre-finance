import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "clip-cyber-btn inline-flex items-center justify-center font-semibold transition-colors transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fhenix-blue focus-visible:ring-offset-1 focus-visible:ring-offset-spectre-dark disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses =
    size === "sm"
      ? "px-3.5 py-1.5 text-xs gap-2"
      : "px-4 py-2.5 text-sm gap-2.5";

  const variantClasses =
    variant === "primary"
      ? "bg-spectre-accent text-slate-950 shadow-spectre-neon hover:bg-sky-300"
      : variant === "secondary"
      ? "bg-spectre-card-soft/90 text-spectre-text border border-spectre-border-soft hover:bg-spectre-card-soft"
      : "bg-transparent text-spectre-muted hover:text-spectre-text hover:bg-spectre-card-soft/60";

  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      className={`${base} ${sizeClasses} ${variantClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children && (
        <span className={icon || iconRight ? "whitespace-nowrap" : ""}>
          {children}
        </span>
      )}
      {iconRight && (
        <span className="inline-flex items-center">{iconRight}</span>
      )}
    </button>
  );
}

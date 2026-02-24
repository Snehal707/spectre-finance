import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  mono?: boolean;
  theme?: "light" | "dark";
}

export function Input({
  label,
  helperText,
  errorText,
  mono,
  theme = "dark",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (typeof label === "string" ? label : undefined);
  const isLight = theme === "light";

  const base = isLight
    ? "w-full border bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-spectre-accent focus:ring-1 focus:ring-spectre-accent"
    : "w-full border bg-slate-950/40 px-3 py-2.5 text-sm outline-none transition placeholder:text-spectre-muted/70 focus:border-spectre-accent focus:ring-1 focus:ring-spectre-accent";

  const stateClasses = errorText
    ? isLight
      ? "border-red-400 text-red-600"
      : "border-spectre-danger/70 text-spectre-danger"
    : isLight
    ? "border-slate-300 text-slate-900"
    : "border-spectre-border-soft text-spectre-text";

  const labelClass = isLight ? "text-slate-500" : "text-spectre-muted";
  const fontClass = mono ? "font-mono" : "";

  return (
    <label className={`flex w-full flex-col gap-1.5 text-xs ${labelClass}`}>
      {label && (
        <span className={`font-medium tracking-wide ${labelClass}`}>
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`${base} ${stateClasses} ${fontClass} ${className}`}
        {...props}
      />
      {helperText && !errorText && (
        <span className={`text-[11px] ${isLight ? "text-slate-400" : "text-spectre-muted/80"}`}>{helperText}</span>
      )}
      {errorText && (
        <span className={`text-[11px] ${isLight ? "text-red-500" : "text-spectre-danger/90"}`}>{errorText}</span>
      )}
    </label>
  );
}

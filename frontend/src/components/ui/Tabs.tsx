import type { ReactNode } from "react";

export interface TabItem {
  value: string;
  label: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  theme?: "light" | "dark";
}

export function Tabs({ items, value, onChange, theme = "dark" }: TabsProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`inline-flex items-center gap-1.5 border p-1 text-xs ${
        isLight
          ? "border-slate-200 bg-white/90 shadow-[0_14px_28px_rgba(148,163,184,0.12)]"
          : "border-spectre-border-soft/80 bg-slate-950/50 shadow-[0_16px_32px_rgba(2,6,23,0.28)]"
      }`}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`clip-cyber-tab relative px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition-all ${
              active
                ? "border border-fhenix-blue/70 bg-fhenix-blue text-slate-950 font-bold shadow-[0_0_16px_rgba(37,209,244,0.32)]"
                : isLight
                ? "border border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                : "border border-transparent bg-transparent text-spectre-muted hover:border-fhenix-blue/20 hover:bg-white/5 hover:text-fhenix-blue"
            }`}
          >
            {active && (
              <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-matrix-green shadow-[0_0_6px_#00ff41] animate-pulse" />
            )}
            <span className={active ? "pl-3" : ""}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

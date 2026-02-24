import type { ReactNode } from "react";

export interface TabItem {
  value: string;
  label: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-transparent p-0 text-xs">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`clip-cyber-tab relative px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all ${
              active
                ? "bg-fhenix-blue text-black font-bold"
                : "border border-fhenix-blue/20 bg-transparent text-spectre-muted hover:border-fhenix-blue/50 hover:text-fhenix-blue"
            }`}
          >
            {active && (
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-matrix-green shadow-[0_0_6px_#00ff41] animate-pulse" />
            )}
            <span className={active ? "pl-3" : ""}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

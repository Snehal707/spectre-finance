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
    <div className="inline-flex items-center justify-between rounded-full bg-slate-900/80 p-1 text-xs shadow-spectre-soft">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`relative rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              active
                ? "bg-spectre-accent text-slate-950"
                : "text-spectre-muted hover:text-spectre-text"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

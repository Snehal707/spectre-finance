import { Button } from "./ui/Button";

type AmountPanelProps = {
  label: string;
  token: string;
  amount: string;
  balance: string;
  onAmountChange: (value: string) => void;
  onMax: () => void;
  disabled?: boolean;
  theme?: "light" | "dark";
};

export function AmountPanel({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onMax,
  disabled = false,
  theme = "dark",
}: AmountPanelProps) {
  const isLight = theme === "light";
  return (
    <div className={`clip-cyber border p-5 shadow-inner ${isLight ? "border-slate-200 bg-slate-50" : "border-spectre-border-soft bg-spectre-card-soft/50"}`}>
      <div className="flex items-center justify-between">
        <span className={`font-cyber text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-500" : "text-spectre-muted"}`}>
          {label}
        </span>
        <div className={`clip-cyber-btn flex items-center gap-2 border px-3 py-1 text-xs font-bold ${isLight ? "border-slate-200 bg-white text-slate-700" : "border-spectre-border-soft bg-spectre-card text-spectre-text"}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-spectre-accent" />
          {token}
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          disabled={disabled}
          className={`w-full bg-transparent font-mono text-4xl font-bold tracking-tight outline-none ${isLight ? "text-slate-900 placeholder:text-slate-300" : "text-spectre-text placeholder:text-spectre-muted"} ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          placeholder="0"
        />
      </div>

      <div className={`mt-3 flex items-center justify-between border-t pt-3 ${isLight ? "border-slate-200" : "border-spectre-border-soft/70"}`}>
        <span className={`text-xs ${isLight ? "text-slate-500" : "text-spectre-muted"}`}>
          Balance: <span className="font-mono">{balance}</span>
        </span>
        <Button size="sm" onClick={onMax} disabled={disabled}>
          MAX
        </Button>
      </div>
    </div>
  );
}

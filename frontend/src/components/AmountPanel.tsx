import { Button } from "./ui/Button";

type AmountPanelProps = {
  label: string;
  token: string;
  amount: string;
  balance: string;
  onAmountChange: (value: string) => void;
  onMax: () => void;
  disabled?: boolean;
};

export function AmountPanel({
  label,
  token,
  amount,
  balance,
  onAmountChange,
  onMax,
  disabled = false,
}: AmountPanelProps) {
  return (
    <div className="rounded-2xl border border-spectre-border-soft bg-spectre-card-soft/50 p-5 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="font-cyber text-xs font-bold uppercase tracking-widest text-spectre-muted">
          {label}
        </span>
        <div className="flex items-center gap-2 rounded-full border border-spectre-border-soft bg-spectre-card px-3 py-1 text-xs font-bold text-spectre-text">
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
          className={`w-full bg-transparent font-mono text-4xl font-bold tracking-tight text-spectre-text outline-none placeholder:text-spectre-muted ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          placeholder="0"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-spectre-border-soft/70 pt-3">
        <span className="text-xs text-spectre-muted">
          Balance: <span className="font-mono">{balance}</span>
        </span>
        <Button size="sm" onClick={onMax} disabled={disabled}>
          MAX
        </Button>
      </div>
    </div>
  );
}

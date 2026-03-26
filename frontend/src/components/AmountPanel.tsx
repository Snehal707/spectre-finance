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
    <div
      className={`clip-cyber relative overflow-hidden border p-5 shadow-inner ${
        isLight
          ? "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.88))]"
          : "border-spectre-border-soft/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.58),rgba(2,6,23,0.52))]"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px ${
          isLight
            ? "bg-gradient-to-r from-transparent via-sky-400/70 to-transparent"
            : "bg-gradient-to-r from-transparent via-fhenix-blue/70 to-transparent"
        }`}
      />
      <div className="relative flex items-center justify-between">
        <span className={`font-cyber text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-600" : "text-spectre-muted"}`}>
          {label}
        </span>
        <div className={`clip-cyber-btn flex items-center gap-2 border px-3 py-1.5 text-xs font-bold ${isLight ? "border-slate-300 bg-white text-slate-800" : "border-spectre-border-soft bg-spectre-card text-spectre-text"}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-spectre-accent" />
          {token}
        </div>
      </div>

      <div className="relative mt-5">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          disabled={disabled}
          className={`w-full bg-transparent font-mono text-4xl font-bold tracking-[-0.05em] outline-none sm:text-5xl ${isLight ? "text-slate-900 placeholder:text-slate-300" : "text-spectre-text placeholder:text-spectre-muted"} ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          placeholder="0"
        />
      </div>

      <div className={`mt-4 flex items-center justify-between border-t pt-3 ${isLight ? "border-slate-200" : "border-spectre-border-soft/70"}`}>
        <span className={`text-xs ${isLight ? "text-slate-600" : "text-spectre-muted"}`}>
          Balance: <span className={`font-mono ${isLight ? "text-slate-900" : ""}`}>{balance}</span>
        </span>
        <Button size="sm" theme={theme} onClick={onMax} disabled={disabled}>
          MAX
        </Button>
      </div>
    </div>
  );
}

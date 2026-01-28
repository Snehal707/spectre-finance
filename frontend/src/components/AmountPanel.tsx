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
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          {token}
        </div>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          disabled={disabled}
          className={`w-full bg-transparent text-4xl font-bold tracking-tight text-slate-900 outline-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="0"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3">
        <span className="text-xs text-slate-500">
          Balance: <span className="font-mono">{balance}</span>
        </span>
        <button
          type="button"
          onClick={onMax}
          disabled={disabled}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
        >
          MAX
        </button>
      </div>
    </div>
  );
}

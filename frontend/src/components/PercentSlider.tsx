type PercentSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function PercentSlider({ value, onChange, disabled = false }: PercentSliderProps) {
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className={`h-1.5 w-full appearance-none rounded-full bg-blue-100 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          background: `linear-gradient(to right, #2563eb ${value}%, #dbeafe ${value}%)`,
        }}
      />
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

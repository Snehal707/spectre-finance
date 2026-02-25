type PercentSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function PercentSlider({
  value,
  onChange,
  disabled = false,
}: PercentSliderProps) {
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className={`w-full appearance-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{
          background: `linear-gradient(to right, #25d1f4 ${value}%, rgba(0,0,0,0.6) ${value}%)`,
        }}
      />
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-spectre-muted">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

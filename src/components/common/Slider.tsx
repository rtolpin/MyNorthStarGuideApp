interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  leftLabel?: string;
  rightLabel?: string;
}

export default function Slider({ value, onChange, min = 1, max = 10, label, leftLabel, rightLabel }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-starlight/70">{label}</label>
        <span className="text-gold font-semibold text-sm">{value}<span className="text-starlight/40">/{max}</span></span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-starlight/30">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

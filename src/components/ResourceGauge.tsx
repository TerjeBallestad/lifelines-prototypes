import { observer } from 'mobx-react-lite';

type ResourceGaugeProps = {
  value: number;
  label: string;
  maxValue?: number;
  modifierText?: string;
  inverted?: boolean; // true for stress (high = bad)
  size?: 'sm' | 'md' | 'lg';
};

export const ResourceGauge = observer(function ResourceGauge({
  value,
  label,
  maxValue = 100,
  modifierText,
  inverted = false,
  size = 'md',
}: ResourceGaugeProps) {
  const percentage = Math.round((value / maxValue) * 100);

  // Color based on value (or inverted for stress)
  const getColor = () => {
    const effectiveValue = inverted ? 100 - percentage : percentage;
    if (effectiveValue >= 70) return 'text-success';
    if (effectiveValue >= 30) return 'text-warning';
    return 'text-error';
  };

  const sizeValue = {
    sm: '3rem',
    md: '4rem',
    lg: '5rem',
  }[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`radial-progress ${getColor()}`}
        style={
          {
            '--value': percentage,
            '--size': sizeValue,
          } as React.CSSProperties
        }
        role="progressbar"
        aria-valuenow={percentage}
        aria-label={label}
      >
        <span className="font-mono text-xs">{Math.round(value)}</span>
      </div>
      <span className="text-base-content/70 text-center text-xs">{label}</span>
      {modifierText && (
        <span className="text-base-content/50 text-center text-xs">
          {modifierText}
        </span>
      )}
    </div>
  );
});

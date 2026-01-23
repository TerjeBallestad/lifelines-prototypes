import { observer } from 'mobx-react-lite';

interface NeedBarProps {
  value: number;
  label: string;
  decayRate: number;
  criticalThreshold: number;
}

/**
 * Determines the color class based on need value thresholds.
 * >= 70: green (success) - satisfied
 * >= 40: yellow (warning) - attention needed soon
 * >= 20: orange - getting urgent
 * < 20: red (error) - critical state
 */
function getColorClass(value: number): string {
  if (value >= 70) return 'progress-success';
  if (value >= 40) return 'progress-warning';
  if (value >= 20) return 'text-orange-500';
  return 'progress-error';
}

/**
 * NeedBar - Displays a single need with color-coded urgency.
 * Shows progress bar, percentage value, and decay rate on hover.
 * Critical needs (< criticalThreshold) have pulsing visual indicator.
 */
export const NeedBar = observer(function NeedBar({
  value,
  label,
  decayRate,
  criticalThreshold,
}: NeedBarProps) {
  const isCritical = value < criticalThreshold;
  const colorClass = getColorClass(value);
  const roundedValue = Math.round(value);

  return (
    <div
      className={`flex flex-col gap-1 ${isCritical ? 'animate-pulse' : ''}`}
      title={`Decay: ${decayRate.toFixed(2)}/tick`}
    >
      <div className="flex justify-between text-xs">
        <span className={isCritical ? 'text-error font-bold' : ''}>
          {label}
        </span>
        <span
          className={
            isCritical ? 'text-error font-bold' : 'text-base-content/70'
          }
        >
          {roundedValue}%
        </span>
      </div>
      <progress
        className={`progress h-2 w-full ${colorClass}`}
        value={roundedValue}
        max={100}
      />
    </div>
  );
});

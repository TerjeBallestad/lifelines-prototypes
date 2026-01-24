import clsx from 'clsx';

interface FloatingNumberProps {
  id: string;
  value: number;
  label: string;
  onComplete: (id: string) => void;
}

/**
 * Animated floating number that shows resource/need changes.
 * Floats upward and fades out over 1.5s.
 */
export function FloatingNumber({
  id,
  value,
  label,
  onComplete,
}: FloatingNumberProps) {
  const isPositive = value > 0;
  const prefix = isPositive ? '+' : '';
  const displayValue =
    Math.abs(value) >= 1 ? value.toFixed(0) : value.toFixed(1);

  return (
    <div
      className="animate-float-up pointer-events-none absolute"
      onAnimationEnd={() => onComplete(id)}
    >
      <span
        className={clsx(
          'text-sm font-bold drop-shadow-md',
          isPositive ? 'text-success' : 'text-error'
        )}
      >
        {prefix}
        {displayValue} {label}
      </span>
    </div>
  );
}

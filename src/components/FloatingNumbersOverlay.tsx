import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { useActivityStore } from '../stores/RootStore';

/**
 * Renders floating numbers as a portal overlay.
 * Positioned in the top-left area (near the sidebar/needs panel).
 * Uses portal to avoid overflow clipping issues.
 */
export const FloatingNumbersOverlay = observer(function FloatingNumbersOverlay() {
  const activityStore = useActivityStore();

  if (activityStore.floatingNumbers.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed left-64 top-32 z-50">
      {activityStore.floatingNumbers.map((fn, index) => {
        const isPositive = fn.value > 0;
        const prefix = isPositive ? '+' : '';
        const displayValue = Math.abs(fn.value) >= 1
          ? fn.value.toFixed(0)
          : fn.value.toFixed(1);

        return (
          <div
            key={fn.id}
            className="animate-float-up absolute"
            style={{ top: `${index * 28}px` }}
            onAnimationEnd={() => activityStore.removeFloatingNumber(fn.id)}
          >
            <span
              className={`text-base font-bold drop-shadow-lg ${
                isPositive ? 'text-success' : 'text-error'
              }`}
            >
              {prefix}{displayValue} {fn.label}
            </span>
          </div>
        );
      })}
    </div>,
    document.body
  );
});

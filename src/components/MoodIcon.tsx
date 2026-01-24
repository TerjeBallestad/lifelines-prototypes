import { useId, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { StatBreakdown } from '../entities/types';

type MoodIconProps = {
  value: number;
  breakdown: StatBreakdown;
};

/**
 * Get emoji representing mood level.
 * @param value Mood value 0-100
 */
function getMoodEmoji(value: number): string {
  if (value >= 75) return '😊'; // happy
  if (value >= 50) return '🙂'; // content
  if (value >= 25) return '😐'; // neutral
  return '😢'; // sad
}

/**
 * MoodIcon - Displays emoji based on mood value with tooltip breakdown.
 * Shows intuitive mood representation and detailed contribution analysis on hover.
 * Uses native Popover API for proper layering without z-index issues.
 */
export const MoodIcon = observer(function MoodIcon({
  value,
  breakdown,
}: MoodIconProps) {
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const emoji = getMoodEmoji(value);

  const showPopover = () => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    if (!popover || !trigger) return;

    // Position popover to the right of trigger
    const rect = trigger.getBoundingClientRect();
    popover.style.top = `${rect.top + rect.height / 2}px`;
    popover.style.left = `${rect.right + 8}px`;
    popover.style.transform = 'translateY(-50%)';

    popover.showPopover();
  };

  const hidePopover = () => {
    popoverRef.current?.hidePopover();
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-help text-4xl"
        role="img"
        aria-label={`mood: ${emoji}`}
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
      >
        {emoji}
      </span>

      <div
        ref={popoverRef}
        id={popoverId}
        popover="manual"
        className="bg-neutral text-neutral-content m-0 rounded px-3 py-2 text-sm shadow-lg"
      >
        <div className="font-semibold">Mood: {Math.round(breakdown.total)}</div>
        <div className="mt-1 space-y-0.5 text-xs opacity-90">
          {breakdown.contributions.map(({ source, value: contribValue }) => {
            const sign = contribValue >= 0 ? '+' : '';
            return (
              <div key={source}>
                {source}: {sign}
                {Math.round(contribValue)}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

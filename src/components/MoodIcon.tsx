import { observer } from 'mobx-react-lite';
import type { StatBreakdown } from '../entities/types';

interface MoodIconProps {
  value: number;
  breakdown: StatBreakdown;
}

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
 */
export const MoodIcon = observer(function MoodIcon({
  value,
  breakdown,
}: MoodIconProps) {
  const emoji = getMoodEmoji(value);

  // Format tooltip text with breakdown
  const tooltipLines = [
    `Mood: ${Math.round(breakdown.total)}`,
    '',
    ...breakdown.contributions.map(({ source, value: contribValue }) => {
      const sign = contribValue >= 0 ? '+' : '';
      return `${source}: ${sign}${Math.round(contribValue)}`;
    }),
  ];
  const tooltipText = tooltipLines.join('\n');

  return (
    <div
      className="tooltip tooltip-right whitespace-pre-line"
      data-tip={tooltipText}
    >
      <span
        className="text-4xl cursor-help"
        role="img"
        aria-label={`mood: ${emoji}`}
      >
        {emoji}
      </span>
    </div>
  );
});

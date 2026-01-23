import { observer } from 'mobx-react-lite';
import type { Activity } from '../entities/Activity';
import type { ActivityData } from '../entities/types';
import type { Character } from '../entities/Character';
import clsx from 'clsx';
import { DifficultyStars } from './DifficultyStars';

interface ActivityCardProps {
  activity: Activity | ActivityData;
  variant: 'preview' | 'queued' | 'active';
  onCancel?: () => void;
  onSelect?: () => void;
  progress?: number; // 0-100 for active variant
  character?: Character; // Optional for difficulty calculation
}

const DOMAIN_COLORS: Record<string, string> = {
  social: 'badge-primary',
  organisational: 'badge-secondary',
  physical: 'badge-accent',
  creative: 'badge-info',
  analytical: 'badge-warning',
};

export const ActivityCard = observer(function ActivityCard({
  activity,
  variant,
  onCancel,
  onSelect,
  progress,
  character,
}: ActivityCardProps) {
  const isClickable = variant === 'preview' && onSelect;

  // Calculate difficulty (if possible)
  let difficulty: number;
  let difficultyBreakdown = undefined;

  if (activity instanceof Activity && character) {
    // Activity instance with character: get personalized difficulty
    difficulty = activity.getEffectiveDifficulty(character);
    difficultyBreakdown = activity.getDifficultyBreakdown(character);
  } else if ('baseDifficulty' in activity && activity.baseDifficulty) {
    // ActivityData with baseDifficulty: use base difficulty
    difficulty = activity.baseDifficulty;
  } else {
    // Fallback: default to 3 stars (medium)
    difficulty = 3;
  }

  // Format resource effects for preview
  const effectsPreview = Object.entries(activity.resourceEffects)
    .map(([key, val]) => {
      const sign = val >= 0 ? '+' : '';
      const icon = val >= 0 ? '↑' : '↓';
      return `${icon} ${key}: ${sign}${val.toFixed(1)}`;
    })
    .slice(0, 3); // Show max 3

  return (
    <div
      className={clsx('card bg-base-100 shadow-sm', {
        'hover:bg-base-300 cursor-pointer transition-colors': isClickable,
        'ring-success ring-2': variant === 'active',
      })}
      onClick={isClickable ? onSelect : undefined}
    >
      <div className="card-body p-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="card-title text-sm">{activity.name}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-xs ${DOMAIN_COLORS[activity.domain]}`}
              >
                {activity.domain}
              </span>
              {/* Difficulty stars */}
              <DifficultyStars
                difficulty={difficulty}
                breakdown={difficultyBreakdown}
                size="xs"
              />
            </div>
          </div>
          {variant === 'queued' && onCancel && (
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              title="Cancel"
            >
              ✕
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-base-content/70 text-xs">{activity.description}</p>

        {/* Resource effects preview */}
        {variant === 'preview' && effectsPreview.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {effectsPreview.map((effect, i) => (
              <span key={i} className="badge badge-ghost badge-xs">
                {effect}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar for active */}
        {variant === 'active' && progress !== undefined && (
          <progress
            className="progress progress-success mt-2 w-full"
            value={progress}
            max="100"
          />
        )}

        {/* Mastery for queued/active (if Activity instance) */}
        {'masteryLevel' in activity && variant !== 'preview' && (
          <div className="text-base-content/50 mt-1 text-xs">
            Mastery Lv.{activity.masteryLevel}
          </div>
        )}
      </div>
    </div>
  );
});

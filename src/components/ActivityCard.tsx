import { observer } from 'mobx-react-lite';
import type { Activity } from '../entities/Activity';
import type { ActivityData } from '../entities/types';

interface ActivityCardProps {
  activity: Activity | ActivityData;
  variant: 'preview' | 'queued' | 'active';
  onCancel?: () => void;
  onSelect?: () => void;
  progress?: number; // 0-100 for active variant
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
}: ActivityCardProps) {
  const isClickable = variant === 'preview' && onSelect;

  // Format resource effects for preview
  const effectsPreview = Object.entries(activity.resourceEffects)
    .map(([key, val]) => {
      const sign = val! >= 0 ? '+' : '';
      const icon = val! >= 0 ? '↑' : '↓';
      return `${icon} ${key}: ${sign}${val!.toFixed(1)}`;
    })
    .slice(0, 3); // Show max 3

  return (
    <div
      className={`card bg-base-200 shadow-sm ${
        isClickable ? 'cursor-pointer hover:bg-base-300 transition-colors' : ''
      } ${variant === 'active' ? 'ring-2 ring-success' : ''}`}
      onClick={isClickable ? onSelect : undefined}
    >
      <div className="card-body p-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title text-sm">{activity.name}</h3>
            <span className={`badge badge-xs ${DOMAIN_COLORS[activity.domain]}`}>
              {activity.domain}
            </span>
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
        <p className="text-xs text-base-content/70">{activity.description}</p>

        {/* Resource effects preview */}
        {variant === 'preview' && effectsPreview.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
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
            className="progress progress-success w-full mt-2"
            value={progress}
            max="100"
          />
        )}

        {/* Mastery for queued/active (if Activity instance) */}
        {'masteryLevel' in activity && variant !== 'preview' && (
          <div className="text-xs text-base-content/50 mt-1">
            Mastery Lv.{activity.masteryLevel}
          </div>
        )}
      </div>
    </div>
  );
});

import { observer } from 'mobx-react-lite';
import { Activity, type ResourceCosts } from '../entities/Activity';
import type { ActivityData } from '../entities/types';
import type { Character } from '../entities/Character';
import clsx from 'clsx';
import { DifficultyStars } from './DifficultyStars';
import { STARTER_SKILLS } from '../data/skills';
import { useSkillStore } from '../stores/RootStore';

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
  const skillStore = useSkillStore();
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

  // Calculate resource costs (if possible)
  let costs = undefined;
  let alignmentInfo = undefined;

  if (activity instanceof Activity && character) {
    const resourceCosts = activity.getResourceCosts(character);
    costs = resourceCosts;
    alignmentInfo = resourceCosts.alignment;
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

        {/* Skill requirements */}
        {variant === 'preview' &&
          'skillRequirements' in activity &&
          activity.skillRequirements &&
          activity.skillRequirements.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {activity.skillRequirements.map((req) => {
                const skill = skillStore.getSkill(req.skillId);
                const skillData = STARTER_SKILLS.find((s) => s.id === req.skillId);
                const skillName = skill?.name ?? skillData?.name ?? req.skillId;
                const charLevel = skill?.level ?? 0;
                const hasSkill = charLevel > 0;

                return (
                  <span
                    key={req.skillId}
                    className={clsx('badge badge-xs', {
                      'badge-success badge-outline': hasSkill,
                      'badge-ghost': !hasSkill,
                    })}
                    title={hasSkill ? `You have ${skillName} at level ${charLevel}` : `${skillName} helps with this activity`}
                  >
                    {skillName} {hasSkill ? `Lv.${charLevel}` : ''}
                  </span>
                );
              })}
            </div>
          )}

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

        {/* Estimated costs (if available) */}
        {variant === 'preview' && costs && (
          <div className="mt-1 text-xs text-base-content/60">
            <span className="font-medium">Costs:</span>{' '}
            <span>Overskudd -{costs.overskudd.toFixed(0)}</span>
            {costs.willpower > 0 && <span>, Willpower -{costs.willpower.toFixed(0)}</span>}
            {costs.focus > 0 && <span>, Focus -{costs.focus.toFixed(0)}</span>}
            {costs.socialBattery > 0 && <span>, Social -{costs.socialBattery.toFixed(0)}</span>}
          </div>
        )}

        {/* Personality alignment indicator (tooltip only - card stays clean per CONTEXT.md) */}
        {variant === 'preview' && alignmentInfo && alignmentInfo.breakdown.length > 0 && (
          <div
            className="mt-1 text-xs opacity-50 cursor-help"
            title={alignmentInfo.breakdown.map(b => `${b.trait}: ${b.contribution > 0 ? '+' : ''}${(b.contribution * 100).toFixed(0)}%`).join(', ')}
          >
            {alignmentInfo.costMultiplier < 0.95 ? '(Good fit)' : alignmentInfo.costMultiplier > 1.05 ? '(Poor fit)' : ''}
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

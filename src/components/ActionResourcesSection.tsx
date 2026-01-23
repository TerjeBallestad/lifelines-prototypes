import { observer } from 'mobx-react-lite';
import type { ActionResources, StatBreakdown } from '../entities/types';

interface ActionResourcesSectionProps {
  actionResources: ActionResources;
  overskuddBreakdown: StatBreakdown;
  socialBatteryBreakdown: StatBreakdown;
  focusBreakdown: StatBreakdown;
  willpowerBreakdown: StatBreakdown;
  extraversion: number;
}

/**
 * Get personality badge based on Extraversion value.
 */
function getPersonalityBadge(extraversion: number): string {
  if (extraversion < 40) return 'Introvert';
  if (extraversion > 60) return 'Extrovert';
  return 'Ambivert';
}

/**
 * ActionResourcesSection - Displays the four action resources.
 * Each resource has a single consistent color and shows tooltip breakdowns.
 * Visually separated from Derived Wellbeing with border-top.
 */
export const ActionResourcesSection = observer(function ActionResourcesSection({
  actionResources,
  overskuddBreakdown,
  socialBatteryBreakdown,
  focusBreakdown,
  willpowerBreakdown,
  extraversion,
}: ActionResourcesSectionProps) {
  return (
    <div className="border-t border-base-300 pt-4 mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/70 mb-3">
        Action Resources
      </h4>

      <div className="flex flex-col gap-4">
        {/* Overskudd - Blue (progress-primary) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <div className="tooltip tooltip-right" data-tip={`Mood (${overskuddBreakdown.contributions[0]?.value}) + Energy (${overskuddBreakdown.contributions[1]?.value}) + Purpose (${overskuddBreakdown.contributions[2]?.value}) = ${overskuddBreakdown.total}`}>
              <span className="cursor-help">Overskudd</span>
            </div>
            <span className="text-base-content/70">
              {Math.round(actionResources.overskudd)}%
            </span>
          </div>
          <progress
            className="progress progress-primary w-full h-2"
            value={actionResources.overskudd}
            max="100"
          />
        </div>

        {/* socialBattery - Purple/Pink (progress-secondary) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <div className="tooltip tooltip-right" data-tip={`${socialBatteryBreakdown.contributions[2]?.source}`}>
              <span className="cursor-help">Social Battery</span>
            </div>
            <span className="text-base-content/70">
              {Math.round(actionResources.socialBattery)}%
            </span>
          </div>
          <progress
            className="progress progress-secondary w-full h-2"
            value={actionResources.socialBattery}
            max="100"
          />
          <div className="flex items-center gap-2">
            <span className="badge badge-xs badge-outline">{getPersonalityBadge(extraversion)}</span>
            <span className="text-xs text-base-content/50">E: {Math.round(extraversion)}</span>
          </div>
        </div>

        {/* Focus - Teal (progress-accent) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <div className="tooltip tooltip-right" data-tip={`${focusBreakdown.contributions[0]?.source}: Full capacity - depleted by concentration activities`}>
              <span className="cursor-help">Focus</span>
            </div>
            <span className="text-base-content/70">
              {Math.round(actionResources.focus)}%
            </span>
          </div>
          <progress
            className="progress progress-accent w-full h-2"
            value={actionResources.focus}
            max="100"
          />
        </div>

        {/* Willpower - Amber/Yellow (progress-warning) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <div className="tooltip tooltip-right" data-tip={`Base (${willpowerBreakdown.contributions[0]?.value}) + Fun boost (${willpowerBreakdown.contributions[1]?.value}) = ${willpowerBreakdown.total}`}>
              <span className="cursor-help">Willpower</span>
            </div>
            <span className="text-base-content/70">
              {Math.round(actionResources.willpower)}%
            </span>
          </div>
          <progress
            className="progress progress-warning w-full h-2"
            value={actionResources.willpower}
            max="100"
          />
          <span className="text-xs text-base-content/50">
            Mental reserves - rebuilds through rest and fun
          </span>
        </div>
      </div>
    </div>
  );
});

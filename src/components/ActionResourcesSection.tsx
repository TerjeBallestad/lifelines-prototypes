import { useId, useRef } from 'react';
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

interface ResourceBarProps {
  label: string;
  value: number;
  colorClass: string;
  tooltipContent: React.ReactNode;
  extraContent?: React.ReactNode;
}

/**
 * ResourceBar - Single action resource with native popover tooltip.
 */
function ResourceBar({ label, value, colorClass, tooltipContent, extraContent }: ResourceBarProps) {
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

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
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span
          ref={triggerRef}
          className="cursor-help"
          onMouseEnter={showPopover}
          onMouseLeave={hidePopover}
        >
          {label}
        </span>
        <span className="text-base-content/70">
          {Math.round(value)}%
        </span>
      </div>
      <progress
        className={`progress ${colorClass} w-full h-2`}
        value={value}
        max="100"
      />
      {extraContent}

      <div
        ref={popoverRef}
        id={popoverId}
        popover="manual"
        className="m-0 rounded bg-neutral px-3 py-2 text-sm text-neutral-content shadow-lg"
      >
        {tooltipContent}
      </div>
    </div>
  );
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
        <ResourceBar
          label="Overskudd"
          value={actionResources.overskudd}
          colorClass="progress-primary"
          tooltipContent={
            <div>
              <div className="font-semibold">Overskudd: {overskuddBreakdown.total}</div>
              <div className="mt-1 space-y-0.5 text-xs opacity-90">
                <div>Mood: {overskuddBreakdown.contributions[0]?.value}</div>
                <div>Energy: {overskuddBreakdown.contributions[1]?.value}</div>
                <div>Purpose: {overskuddBreakdown.contributions[2]?.value}</div>
              </div>
            </div>
          }
        />

        {/* socialBattery - Purple/Pink (progress-secondary) */}
        <ResourceBar
          label="Social Battery"
          value={actionResources.socialBattery}
          colorClass="progress-secondary"
          tooltipContent={
            <div>
              <div className="font-semibold">Social Battery: {Math.round(actionResources.socialBattery)}</div>
              <div className="mt-1 text-xs opacity-90">
                {socialBatteryBreakdown.contributions[2]?.source}
              </div>
            </div>
          }
          extraContent={
            <div className="flex items-center gap-2">
              <span className="badge badge-xs badge-outline">{getPersonalityBadge(extraversion)}</span>
              <span className="text-xs text-base-content/50">E: {Math.round(extraversion)}</span>
            </div>
          }
        />

        {/* Focus - Teal (progress-accent) */}
        <ResourceBar
          label="Focus"
          value={actionResources.focus}
          colorClass="progress-accent"
          tooltipContent={
            <div>
              <div className="font-semibold">Focus: {Math.round(actionResources.focus)}</div>
              <div className="mt-1 text-xs opacity-90">
                Full capacity - depleted by concentration activities
              </div>
            </div>
          }
        />

        {/* Willpower - Amber/Yellow (progress-warning) */}
        <ResourceBar
          label="Willpower"
          value={actionResources.willpower}
          colorClass="progress-warning"
          tooltipContent={
            <div>
              <div className="font-semibold">Willpower: {willpowerBreakdown.total}</div>
              <div className="mt-1 space-y-0.5 text-xs opacity-90">
                <div>Base: {willpowerBreakdown.contributions[0]?.value}</div>
                <div>Fun boost: {willpowerBreakdown.contributions[1]?.value}</div>
              </div>
            </div>
          }
          extraContent={
            <span className="text-xs text-base-content/50">
              Mental reserves - rebuilds through rest and fun
            </span>
          }
        />
      </div>
    </div>
  );
});

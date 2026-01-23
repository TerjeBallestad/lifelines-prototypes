import { useId, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { DifficultyBreakdown } from '../types/difficulty';

interface DifficultyStarsProps {
  /** Effective difficulty (1-5 stars) */
  difficulty: number;
  /** Optional breakdown for tooltip */
  breakdown?: DifficultyBreakdown;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Get explicit size classes for star divs.
 * DaisyUI rating-xs/sm/md only work on inputs, so we need explicit sizing for divs.
 */
function getStarSizeClass(size: 'xs' | 'sm' | 'md'): string {
  switch (size) {
    case 'xs':
      return 'w-3 h-3';
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-5 h-5';
  }
}

/**
 * Get color class for filled stars based on difficulty level.
 * Uses DaisyUI semantic colors:
 * - Easy (1-2): green (bg-success)
 * - Medium (2.5-3.5): yellow (bg-warning)
 * - Hard (4-5): red (bg-error)
 */
function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return 'bg-success';
  if (difficulty <= 3.5) return 'bg-warning';
  return 'bg-error';
}

/**
 * DifficultyStars - Read-only star rating display with optional popover breakdown.
 * Uses DaisyUI rating component with mask-star-2 for consistent star shapes.
 * Follows native Popover API pattern from ActionResourcesSection.
 */
export const DifficultyStars = observer(function DifficultyStars({
  difficulty,
  breakdown,
  size = 'sm',
}: DifficultyStarsProps) {
  const popoverId = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const filledStars = Math.round(difficulty);
  const colorClass = getDifficultyColor(difficulty);
  const sizeClass = getStarSizeClass(size);

  const showPopover = () => {
    if (!breakdown) return; // No tooltip if no breakdown
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
      <div
        ref={triggerRef}
        className="flex gap-0.5 cursor-help"
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`mask mask-star-2 ${sizeClass} ${
              star <= filledStars ? colorClass : 'bg-base-300'
            }`}
            aria-label={`${star} star`}
          />
        ))}
      </div>

      {breakdown && (
        <div
          ref={popoverRef}
          id={popoverId}
          popover="manual"
          className="fixed m-0 rounded bg-neutral px-3 py-2 text-sm text-neutral-content shadow-lg"
        >
          <div className="font-semibold">
            Difficulty: {breakdown.effective.toFixed(1)}★
          </div>
          <div className="mt-1 space-y-0.5 text-xs opacity-90">
            <div>Base: {breakdown.base.toFixed(1)}★</div>
            {breakdown.skillReduction > 0 && (
              <div>Skills: -{breakdown.skillReduction.toFixed(1)}★</div>
            )}
            {breakdown.masteryReduction > 0 && (
              <div>Mastery: -{breakdown.masteryReduction.toFixed(1)}★</div>
            )}
          </div>

          {/* Per-skill details - only show skills with actual reduction */}
          {breakdown.skillDetails.filter((s) => s.reduction > 0).length > 0 && (
            <div className="mt-2 border-t border-neutral-content/20 pt-2">
              <div className="text-xs font-semibold opacity-90">
                Skill Contributions:
              </div>
              <div className="mt-1 space-y-0.5 text-xs opacity-80">
                {breakdown.skillDetails
                  .filter((skill) => skill.reduction > 0)
                  .map((skill) => (
                    <div key={skill.skillId}>
                      {skill.skillName} Lv.{skill.level}: -
                      {skill.reduction.toFixed(1)}★
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
});

export default DifficultyStars;

import { observer } from 'mobx-react-lite';
import { MoodIcon } from './MoodIcon';
import type { DerivedStats, StatBreakdown } from '../entities/types';

interface DerivedStatsSectionProps {
  derivedStats: DerivedStats;
  moodBreakdown: StatBreakdown;
  purposeEquilibrium: number;
}

/**
 * Get progress bar color class for purpose value.
 */
function getPurposeColor(value: number): string {
  if (value >= 60) return 'progress-info';
  if (value >= 40) return 'progress-warning';
  return 'progress-error';
}

/**
 * Get progress bar color class for nutrition value.
 */
function getNutritionColor(value: number): string {
  if (value >= 70) return 'progress-success';
  if (value >= 40) return 'progress-warning';
  return 'progress-error';
}

/**
 * DerivedStatsSection - Displays derived wellbeing stats.
 * Shows Mood (emoji with tooltip), Purpose (bar with equilibrium), and Nutrition (slow bar).
 * Visually separated from primary needs with border-top.
 */
export const DerivedStatsSection = observer(function DerivedStatsSection({
  derivedStats,
  moodBreakdown,
  purposeEquilibrium,
}: DerivedStatsSectionProps) {
  return (
    <div className="border-t border-base-300 pt-4 mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/70 mb-3">
        Derived Wellbeing
      </h4>

      <div className="flex flex-col gap-4">
        {/* Mood row - centered icon */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-base-content/70 w-16">Mood</span>
          <MoodIcon value={derivedStats.mood} breakdown={moodBreakdown} />
          <span className="text-sm text-base-content/50">
            {Math.round(derivedStats.mood)}%
          </span>
        </div>

        {/* Purpose row - bar with equilibrium */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>Purpose</span>
            <span className="text-base-content/70">
              {Math.round(derivedStats.purpose)}%
            </span>
          </div>
          <progress
            className={`progress ${getPurposeColor(derivedStats.purpose)} w-full h-2`}
            value={derivedStats.purpose}
            max="100"
          />
          <div className="flex justify-between text-xs text-base-content/50">
            <span>Equilibrium: {Math.round(purposeEquilibrium)}%</span>
            <span className="opacity-60">personality baseline</span>
          </div>
        </div>

        {/* Nutrition row - bar with slow indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>Nutrition</span>
            <span className="text-base-content/70">
              {Math.round(derivedStats.nutrition)}%
            </span>
          </div>
          <progress
            className={`progress ${getNutritionColor(derivedStats.nutrition)} w-full h-2`}
            value={derivedStats.nutrition}
            max="100"
          />
          <span className="text-xs text-base-content/50">
            (changes slowly based on diet)
          </span>
        </div>
      </div>
    </div>
  );
});

import { observer } from 'mobx-react-lite';
import { NeedBar } from './NeedBar';
import { DerivedStatsSection } from './DerivedStatsSection';
import { ActionResourcesSection } from './ActionResourcesSection';
import type {
  Needs,
  NeedKey,
  DerivedStats,
  StatBreakdown,
  ActionResources,
} from '../entities/types';
import type { NeedsConfig } from '../config/balance';

type NeedsPanelProps = {
  needs: Needs;
  needsConfig: NeedsConfig;
  derivedStats?: DerivedStats;
  moodBreakdown?: StatBreakdown;
  purposeEquilibrium?: number;
  actionResources?: ActionResources;
  overskuddBreakdown?: StatBreakdown;
  socialBatteryBreakdown?: StatBreakdown;
  focusBreakdown?: StatBreakdown;
  willpowerBreakdown?: StatBreakdown;
  extraversion?: number;
};

// Need groupings
const PHYSIOLOGICAL_NEEDS: Array<{
  key: NeedKey;
  label: string;
  rateKey: keyof NeedsConfig;
}> = [
  { key: 'hunger', label: 'Hunger', rateKey: 'hungerDecayRate' },
  { key: 'energy', label: 'Energy', rateKey: 'energyDecayRate' },
  { key: 'hygiene', label: 'Hygiene', rateKey: 'hygieneDecayRate' },
  { key: 'bladder', label: 'Bladder', rateKey: 'bladderDecayRate' },
];

const SOCIAL_NEEDS: Array<{
  key: NeedKey;
  label: string;
  rateKey: keyof NeedsConfig;
}> = [
  { key: 'social', label: 'Social', rateKey: 'socialDecayRate' },
  { key: 'fun', label: 'Fun', rateKey: 'funDecayRate' },
  { key: 'security', label: 'Security', rateKey: 'securityDecayRate' },
];

/**
 * NeedsPanel - Displays all 7 primary needs grouped by category.
 * Physiological needs (fast decay): Hunger, Energy, Hygiene, Bladder
 * Social/psychological needs (slow decay): Social, Fun, Security
 */
export const NeedsPanel = observer(function NeedsPanel({
  needs,
  needsConfig,
  derivedStats,
  moodBreakdown,
  purposeEquilibrium,
  actionResources,
  overskuddBreakdown,
  socialBatteryBreakdown,
  focusBreakdown,
  willpowerBreakdown,
  extraversion,
}: NeedsPanelProps) {
  const { criticalThreshold } = needsConfig;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Physiological Needs */}
      <div>
        <h4 className="text-base-content/70 mb-2 text-xs font-semibold tracking-wide uppercase">
          Physiological
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {PHYSIOLOGICAL_NEEDS.map(({ key, label, rateKey }) => (
            <NeedBar
              key={key}
              value={needs[key]}
              label={label}
              decayRate={needsConfig[rateKey] as number}
              criticalThreshold={criticalThreshold}
            />
          ))}
        </div>
      </div>

      {/* Social/Psychological Needs */}
      <div>
        <h4 className="text-base-content/70 mb-2 text-xs font-semibold tracking-wide uppercase">
          Social
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {SOCIAL_NEEDS.map(({ key, label, rateKey }) => (
            <NeedBar
              key={key}
              value={needs[key]}
              label={label}
              decayRate={needsConfig[rateKey] as number}
              criticalThreshold={criticalThreshold}
            />
          ))}
        </div>
      </div>

      {/* Derived Wellbeing - only show if derivedStats available */}
      {derivedStats && moodBreakdown && purposeEquilibrium !== undefined && (
        <DerivedStatsSection
          derivedStats={derivedStats}
          moodBreakdown={moodBreakdown}
          purposeEquilibrium={purposeEquilibrium}
        />
      )}

      {/* Action Resources - only show if actionResources available */}
      {actionResources &&
        overskuddBreakdown &&
        socialBatteryBreakdown &&
        focusBreakdown &&
        willpowerBreakdown &&
        extraversion !== undefined && (
          <ActionResourcesSection
            actionResources={actionResources}
            overskuddBreakdown={overskuddBreakdown}
            socialBatteryBreakdown={socialBatteryBreakdown}
            focusBreakdown={focusBreakdown}
            willpowerBreakdown={willpowerBreakdown}
            extraversion={extraversion}
          />
        )}
    </div>
  );
});

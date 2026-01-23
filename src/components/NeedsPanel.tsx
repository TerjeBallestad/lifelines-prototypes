import { observer } from 'mobx-react-lite';
import { NeedBar } from './NeedBar';
import type { Needs, NeedKey } from '../entities/types';
import type { NeedsConfig } from '../config/balance';

interface NeedsPanelProps {
  needs: Needs;
  needsConfig: NeedsConfig;
}

// Need groupings
const PHYSIOLOGICAL_NEEDS: { key: NeedKey; label: string; rateKey: keyof NeedsConfig }[] = [
  { key: 'hunger', label: 'Hunger', rateKey: 'hungerDecayRate' },
  { key: 'energy', label: 'Energy', rateKey: 'energyDecayRate' },
  { key: 'hygiene', label: 'Hygiene', rateKey: 'hygieneDecayRate' },
  { key: 'bladder', label: 'Bladder', rateKey: 'bladderDecayRate' },
];

const SOCIAL_NEEDS: { key: NeedKey; label: string; rateKey: keyof NeedsConfig }[] = [
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
}: NeedsPanelProps) {
  const { criticalThreshold } = needsConfig;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Physiological Needs */}
      <div>
        <h4 className="text-base-content/70 mb-2 text-xs font-semibold uppercase tracking-wide">
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
        <h4 className="text-base-content/70 mb-2 text-xs font-semibold uppercase tracking-wide">
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
    </div>
  );
});

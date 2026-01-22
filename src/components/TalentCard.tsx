import { observer } from 'mobx-react-lite';
import type { Talent } from '../entities/Talent';

interface TalentCardProps {
  talent: Talent;
  onSelect?: () => void;
  compact?: boolean;
}

/**
 * Displays a single talent with rarity indicator and effects.
 * Used in selection modal and talents panel.
 */
export const TalentCard = observer(function TalentCard({
  talent,
  onSelect,
  compact = false,
}: TalentCardProps) {
  // Rarity badge styling
  const rarityBadgeClass: Record<string, string> = {
    common: 'badge-ghost',
    rare: 'badge-info',
    epic: 'badge-secondary',
  };

  // Rarity border glow
  const rarityBorderClass: Record<string, string> = {
    common: 'border-base-300',
    rare: 'border-info/50',
    epic: 'border-secondary/50 shadow-lg shadow-secondary/20',
  };

  return (
    <div
      className={`card bg-base-200 border-2 ${rarityBorderClass[talent.rarity]} ${
        onSelect ? 'hover:bg-base-300 cursor-pointer transition-colors' : ''
      } ${compact ? 'card-compact' : ''}`}
      onClick={onSelect}
    >
      <div className="card-body">
        {/* Header: Name + Rarity */}
        <div className="flex items-center justify-between">
          <h3 className={`card-title text-lg ${talent.rarityColorClass}`}>
            {talent.name}
          </h3>
          <span
            className={`badge ${rarityBadgeClass[talent.rarity]} capitalize`}
          >
            {talent.rarity}
          </span>
        </div>

        {/* Domain indicator */}
        {talent.domain && (
          <span className="badge badge-outline badge-sm capitalize">
            {talent.domain}
          </span>
        )}

        {/* Description */}
        <p className="text-sm opacity-80">{talent.description}</p>

        {/* Effects breakdown (only in non-compact mode) */}
        {!compact && talent.effects.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="text-xs font-semibold uppercase opacity-60">
              Effects
            </div>
            {talent.effects.map((effect, idx) => (
              <div
                key={idx}
                className={`text-xs ${
                  effect.value > 0 ? 'text-success' : 'text-error'
                }`}
              >
                {effect.description}
              </div>
            ))}
          </div>
        )}

        {/* Select button (when interactive) */}
        {onSelect && (
          <div className="card-actions mt-2 justify-end">
            <button className="btn btn-primary btn-sm">Select</button>
          </div>
        )}
      </div>
    </div>
  );
});

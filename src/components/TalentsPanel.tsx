import { observer } from 'mobx-react-lite';
import { useTalentStore, useCharacterStore } from '../stores/RootStore';
import { TalentCard } from './TalentCard';

/**
 * Panel displaying all selected talents with their effects.
 * Shows in main content area alongside skills and activities.
 * Includes stat breakdown section showing talent contributions.
 */
export const TalentsPanel = observer(function TalentsPanel() {
  const talentStore = useTalentStore();
  const characterStore = useCharacterStore();
  const character = characterStore.character;
  const selectedTalents = talentStore.selectedTalentsArray;

  // Get modifier breakdowns from character
  const capacityBreakdown = character?.capacityModifierBreakdown;
  const resourceBreakdown = character?.resourceModifierBreakdown;

  // Check if there are any active modifiers to show
  const hasCapacityMods = capacityBreakdown && capacityBreakdown.size > 0;
  const hasResourceMods = resourceBreakdown && resourceBreakdown.size > 0;
  const hasAnyMods = hasCapacityMods || hasResourceMods;

  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body">
        {/* Header with count */}
        <div className="flex items-center justify-between">
          <h2 className="card-title">Talents</h2>
          <span className="badge badge-neutral">
            {selectedTalents.length} selected
          </span>
        </div>

        {/* Empty state */}
        {selectedTalents.length === 0 && (
          <div className="text-center py-8 opacity-60">
            <p>No talents selected yet.</p>
            <p className="text-sm mt-2">
              Earn 500 domain XP to unlock talent picks!
            </p>
          </div>
        )}

        {/* Selected talents list */}
        {selectedTalents.length > 0 && (
          <div className="space-y-3 mt-2">
            {selectedTalents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} compact />
            ))}
          </div>
        )}

        {/* Stat Breakdown Section */}
        {hasAnyMods && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <h3 className="text-sm font-semibold opacity-80 mb-2">
              Talent Effects
            </h3>

            {/* Capacity modifiers */}
            {hasCapacityMods && (
              <div className="mb-3">
                <div className="text-xs font-medium opacity-60 uppercase mb-1">
                  Capacities
                </div>
                <div className="space-y-1">
                  {Array.from(capacityBreakdown!.entries()).map(([key, mods]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-success">
                        {mods.map((m, i) => (
                          <span key={i} title={m.source}>
                            {i > 0 ? ', ' : ''}
                            +{m.value}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resource modifiers */}
            {hasResourceMods && (
              <div>
                <div className="text-xs font-medium opacity-60 uppercase mb-1">
                  Resource Rates
                </div>
                <div className="space-y-1">
                  {Array.from(resourceBreakdown!.entries()).map(([key, mods]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span>
                        {mods.map((m, i) => (
                          <span
                            key={i}
                            title={m.source}
                            className={m.value < 0 ? 'text-success' : 'text-error'}
                          >
                            {i > 0 ? ', ' : ''}
                            {m.value > 0 ? '+' : ''}{Math.round(m.value * 100)}%
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending picks indicator */}
        {talentStore.pendingPicks > 0 && (
          <div className="alert alert-warning mt-4">
            <span>
              {talentStore.pendingPicks} talent pick{talentStore.pendingPicks > 1 ? 's' : ''} available!
            </span>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => talentStore.generateOffer()}
            >
              Choose
            </button>
          </div>
        )}

        {/* Dev: Force offer button (for testing) */}
        {import.meta.env.DEV && selectedTalents.length < talentStore.talentsArray.length - 2 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm opacity-60">Dev Tools</summary>
            <button
              className="btn btn-xs btn-outline mt-2"
              onClick={() => talentStore.forceOffer()}
            >
              Force Talent Offer
            </button>
          </details>
        )}
      </div>
    </div>
  );
});

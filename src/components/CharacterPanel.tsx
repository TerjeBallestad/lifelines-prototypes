import { observer } from 'mobx-react-lite';
import { PersonalityRadar } from './PersonalityRadar';
import { CapacitiesRadar } from './CapacitiesRadar';
import { NeedsPanel } from './NeedsPanel';
import { useCharacterStore, useRootStore } from '../stores/RootStore';

export const CharacterPanel = observer(function CharacterPanel() {
  const root = useRootStore();
  const characterStore = useCharacterStore();
  const character = characterStore.character;

  if (!character) {
    return (
      <div className="bg-base-200 h-screen w-80 p-4">
        <p className="text-base-content/50">No character created</p>
      </div>
    );
  }

  return (
    <div className="bg-base-200 flex h-screen w-80 flex-col">
      {/* Header with name */}
      <div className="border-base-300 border-b p-4">
        <h2 className="text-lg font-bold">{character.displayName}</h2>
        {character.isExhausted && (
          <span className="badge badge-error badge-sm">Exhausted</span>
        )}
        {character.isSociallyDrained && (
          <span className="badge badge-info badge-sm ml-1">Drained</span>
        )}
      </div>

      {/* Resources / Needs - most prominent per CONTEXT.md */}
      <div className="border-base-300 border-b p-4">
        <h3 className="text-base-content/70 mb-2 text-sm font-semibold">
          Needs
        </h3>
        <NeedsPanel
          needs={character.needs}
          needsConfig={root.balanceConfig.needsConfig}
          derivedStats={character.derivedStats}
          moodBreakdown={character.moodBreakdown}
          purposeEquilibrium={character.purposeEquilibrium}
          actionResources={character.actionResources}
          overskuddBreakdown={character.overskuddBreakdown}
          socialBatteryBreakdown={character.socialBatteryBreakdown}
          focusBreakdown={character.focusBreakdown}
          willpowerBreakdown={character.willpowerBreakdown}
          extraversion={character.personality.extraversion}
        />
      </div>

      {/* Personality radar */}
      <div className="border-base-300 border-b p-4">
        <h3 className="text-base-content/70 mb-2 text-sm font-semibold">
          Personality
        </h3>
        <PersonalityRadar personality={character.personality} />
        {/* Dev sliders for testing emergence per CONTEXT.md */}
        <details className="mt-2">
          <summary className="text-base-content/50 cursor-pointer text-xs">
            Adjust (dev)
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {Object.entries(character.personality).map(([key, value]) => (
              <label
                key={key}
                className="input input-xs flex items-center gap-2"
              >
                <span className="label w-24 capitalize">{key}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) =>
                    character.updatePersonality({
                      [key]: Number(e.target.value),
                    })
                  }
                  className="range range-xs w-full"
                />
                <span className="w-8 text-right text-xs">{value}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* Capacities radar */}
      <div className="p-4">
        <h3 className="text-base-content/70 mb-2 text-sm font-semibold">
          Capacities
        </h3>
        <CapacitiesRadar capacities={character.effectiveCapacities} />
      </div>
    </div>
  );
});

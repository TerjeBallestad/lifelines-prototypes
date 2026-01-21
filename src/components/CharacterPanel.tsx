import { observer } from 'mobx-react-lite';
import { PersonalityRadar } from './PersonalityRadar';
import { CapacitiesRadar } from './CapacitiesRadar';
import { ResourcePanel } from './ResourcePanel';
import { useCharacterStore } from '../stores/RootStore';

export const CharacterPanel = observer(function CharacterPanel() {
  const characterStore = useCharacterStore();
  const character = characterStore.character;

  if (!character) {
    return (
      <div className="w-80 p-4 bg-base-200 h-screen">
        <p className="text-base-content/50">No character created</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-base-200 h-screen overflow-y-auto flex flex-col">
      {/* Header with name */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-bold">{character.displayName}</h2>
        {character.isExhausted && (
          <span className="badge badge-error badge-sm">Exhausted</span>
        )}
        {character.isOverstressed && (
          <span className="badge badge-warning badge-sm ml-1">Stressed</span>
        )}
        {character.isSociallyDrained && (
          <span className="badge badge-info badge-sm ml-1">Drained</span>
        )}
      </div>

      {/* Resources - most prominent per CONTEXT.md */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-sm font-semibold mb-2 text-base-content/70">
          Resources
        </h3>
        <ResourcePanel resources={character.resources} />
      </div>

      {/* Personality radar */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-sm font-semibold mb-2 text-base-content/70">
          Personality
        </h3>
        <PersonalityRadar personality={character.personality} />
        {/* Dev sliders for testing emergence per CONTEXT.md */}
        <details className="mt-2">
          <summary className="text-xs text-base-content/50 cursor-pointer">
            Adjust (dev)
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            {Object.entries(character.personality).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs w-24 capitalize">{key}</label>
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
                <span className="text-xs w-8 text-right">{value}</span>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Capacities radar */}
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-2 text-base-content/70">
          Capacities
        </h3>
        <CapacitiesRadar capacities={character.capacities} />
      </div>
    </div>
  );
});

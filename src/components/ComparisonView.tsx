import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useCharacterStore } from '../stores/RootStore';
import { ARCHETYPES, createArchetypeCharacter } from '../data/archetypes';
import { PersonalityRadar } from './PersonalityRadar';
import { ResourcePanel } from './ResourcePanel';
import { CapacitiesRadar } from './CapacitiesRadar';
import type { Character } from '../entities/Character';

type ComparisonViewProps = {
  onExitComparison: () => void;
};

export const ComparisonView = observer(function ComparisonView({
  onExitComparison,
}: ComparisonViewProps) {
  const characterStore = useCharacterStore();
  const [char1Id, setChar1Id] = useState<string | null>(null);
  const [char2Id, setChar2Id] = useState<string | null>(null);

  const setupComparison = (arch1Index: number, arch2Index: number) => {
    // Clear existing characters
    for (const id of Array.from(characterStore.characters.keys())) {
      characterStore.removeCharacter(id);
    }

    const arch1 = ARCHETYPES[arch1Index];
    const arch2 = ARCHETYPES[arch2Index];
    if (!arch1 || !arch2) return; // Safety check

    const data1 = createArchetypeCharacter(arch1.id);
    const data2 = createArchetypeCharacter(arch2.id);

    // Use replaceActive=false to add characters without clearing the map
    const c1 = characterStore.createFromData(data1, false);
    const c2 = characterStore.createFromData(data2, false);

    setChar1Id(c1.id);
    setChar2Id(c2.id);
  };

  // If no comparison setup, show selection UI
  if (!char1Id || !char2Id) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Emergence Comparison</h2>
            <p className="mt-2 text-base-content/70">
              Select two contrasting archetypes to compare their behavior
              side-by-side.
            </p>
          </div>
          <button onClick={onExitComparison} className="btn btn-outline">
            Back to Single Mode
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold">Suggested Comparisons:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setupComparison(0, 1)}
              className="btn btn-outline"
            >
              Hermit vs Social Butterfly
            </button>
            <button
              onClick={() => setupComparison(2, 3)}
              className="btn btn-outline"
            >
              Perfectionist vs Free Spirit
            </button>
            <button
              onClick={() => setupComparison(4, 5)}
              className="btn btn-outline"
            >
              Competitor vs Peacemaker
            </button>
          </div>
        </div>
      </div>
    );
  }

  const char1 = characterStore.getCharacter(char1Id);
  const char2 = characterStore.getCharacter(char2Id);

  if (!char1 || !char2) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Comparison Mode</h2>
        <button onClick={onExitComparison} className="btn btn-outline btn-sm">
          Back to Single Mode
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CharacterComparisonPanel character={char1} />
        <CharacterComparisonPanel character={char2} />
      </div>
    </div>
  );
});

// Scoped panel for comparison view
const CharacterComparisonPanel = observer(function CharacterComparisonPanel({
  character,
}: {
  character: Character;
}) {
  const archetype = ARCHETYPES.find((a) => a.name === character.name);

  return (
    <div className="bg-base-200 rounded-lg p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-bold">{character.displayName}</h3>
        {archetype && (
          <p className="text-xs text-base-content/50 mt-1">
            Expected: {archetype.expectedBehavior}
          </p>
        )}
        <div className="flex gap-1 mt-2">
          {character.isExhausted && (
            <span className="badge badge-error badge-sm">Exhausted</span>
          )}
          {character.isOverstressed && (
            <span className="badge badge-warning badge-sm">Stressed</span>
          )}
          {character.isSociallyDrained && (
            <span className="badge badge-info badge-sm">Drained</span>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-base-content/70 mb-2">
          Resources
        </h4>
        <ResourcePanel resources={character.resources} />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-base-content/70 mb-2">
          Personality
        </h4>
        <PersonalityRadar personality={character.personality} />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-base-content/70 mb-2">
          Capacities
        </h4>
        <CapacitiesRadar capacities={character.effectiveCapacities} />
      </div>
    </div>
  );
});

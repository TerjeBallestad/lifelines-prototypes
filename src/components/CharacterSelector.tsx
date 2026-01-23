import { observer } from 'mobx-react-lite';
import { useRootStore } from '../stores/RootStore';
import {
  ARCHETYPES,
  createArchetypeCharacter,
  createRandomCharacter,
} from '../data/archetypes';

/**
 * Compact character selection controls for the header area.
 * Allows quick switching between archetype presets or randomizing.
 */
export const CharacterSelector = observer(function CharacterSelector() {
  const { characterStore } = useRootStore();

  return (
    <div className="flex items-center gap-2">
      <select
        className="select select-sm select-bordered"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            const data = createArchetypeCharacter(e.target.value);
            characterStore.createFromData(data);
            e.target.value = '';
          }
        }}
      >
        <option value="" disabled>
          Load archetype...
        </option>
        {ARCHETYPES.map((arch) => (
          <option key={arch.id} value={arch.id}>
            {arch.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const data = createRandomCharacter();
          characterStore.createFromData(data);
        }}
        className="btn btn-sm btn-outline"
        title="Generate random character"
      >
        Random
      </button>
    </div>
  );
});

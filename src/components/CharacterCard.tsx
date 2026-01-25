import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../stores/RootStore';

export const CharacterCard = observer(function CharacterCard() {
  const store = useCharacterStore();
  const character = store.character;

  if (!character) {
    return (
      <div className="card bg-base-200 max-w-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title">No Character</h2>
          <p className="text-base-content/70">
            Create a character to get started.
          </p>
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={() => store.createCharacter('New Patient')}
            >
              Create Character
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 max-w-md shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{character.displayName}</h2>

        <label className="input input-bordered">
          <span className="label">Name</span>
          <input
            type="text"
            value={character.name}
            onChange={(e) => character.setName(e.target.value)}
            placeholder="Enter character name"
          />
        </label>

        <div className="divider">Status</div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-base-content/70">Valid:</span>{' '}
            <span className={character.isValid ? 'text-success' : 'text-error'}>
              {character.isValid ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-base-content/70">Energy:</span>{' '}
            {Math.round(character.needs.energy)}
          </div>
          <div>
            <span className="text-base-content/70">Social:</span>{' '}
            {Math.round(character.actionResources.socialBattery)}
          </div>
          <div>
            <span className="text-base-content/70">Mood:</span>{' '}
            {Math.round(character.derivedStats.mood)}
          </div>
        </div>

        <div className="divider">Personality</div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>O: {character.personality.openness}</div>
          <div>C: {character.personality.conscientiousness}</div>
          <div>E: {character.personality.extraversion}</div>
          <div>A: {character.personality.agreeableness}</div>
          <div>N: {character.personality.neuroticism}</div>
        </div>

        <div className="card-actions mt-4 justify-end">
          <button
            className="btn btn-outline btn-error btn-sm"
            onClick={() => store.clearCharacter()}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

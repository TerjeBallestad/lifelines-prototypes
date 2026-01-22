import { observer } from 'mobx-react-lite';
import { useRootStore } from '../stores/RootStore';
import type { BalanceConfig } from '../config/balance';
import {
  ARCHETYPES,
  createArchetypeCharacter,
  createRandomCharacter,
} from '../data/archetypes';

/**
 * Dev Tools panel for tuning game balance and simulation parameters.
 * Uses native <details> element with DaisyUI styling for collapsible UI.
 */
export const DevToolsPanel = observer(function DevToolsPanel() {
  const { simulationStore, balanceConfig, characterStore } = useRootStore();

  // Handler for balance config updates
  const handleBalanceChange = (field: keyof BalanceConfig, value: number) => {
    // Clamp to non-negative
    const clamped = Math.max(0, value);
    balanceConfig.update({ [field]: clamped });
  };

  return (
    <details className="collapse collapse-arrow bg-base-200 border border-base-300">
      <summary className="collapse-title text-lg font-medium">
        Dev Tools
      </summary>
      <div className="collapse-content space-y-4">
        {/* Simulation section */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Simulation</h3>
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Speed: {simulationStore.speed.toFixed(1)}x
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={simulationStore.speed}
              onChange={(e) =>
                simulationStore.setSpeed(parseFloat(e.target.value))
              }
              className="range range-sm"
            />
          </div>
        </div>

        {/* Balance parameters section */}
        <div className="divider text-sm">Balance</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Activity system */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Min Overskudd to Start</span>
            </label>
            <input
              type="number"
              min="0"
              value={balanceConfig.minOverskuddToStart}
              onChange={(e) =>
                handleBalanceChange('minOverskuddToStart', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Mastery Bonus Per Level</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={balanceConfig.masteryBonusPerLevel}
              onChange={(e) =>
                handleBalanceChange('masteryBonusPerLevel', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Mastery XP on Success</span>
            </label>
            <input
              type="number"
              min="0"
              value={balanceConfig.masteryXPOnSuccess}
              onChange={(e) =>
                handleBalanceChange('masteryXPOnSuccess', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Mastery XP on Failure</span>
            </label>
            <input
              type="number"
              min="0"
              value={balanceConfig.masteryXPOnFailure}
              onChange={(e) =>
                handleBalanceChange('masteryXPOnFailure', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          {/* Talent system */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Talent Pick Threshold</span>
            </label>
            <input
              type="number"
              min="0"
              value={balanceConfig.talentPickThreshold}
              onChange={(e) =>
                handleBalanceChange('talentPickThreshold', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Max Pending Picks</span>
            </label>
            <input
              type="number"
              min="0"
              value={balanceConfig.maxPendingPicks}
              onChange={(e) =>
                handleBalanceChange('maxPendingPicks', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          {/* Personality system */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Personality Modifier Strength</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={balanceConfig.personalityModifierStrength}
              onChange={(e) =>
                handleBalanceChange('personalityModifierStrength', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>

          {/* Simulation system */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Simulation Tick (ms)</span>
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={balanceConfig.simulationTickMs}
              onChange={(e) =>
                handleBalanceChange('simulationTickMs', parseFloat(e.target.value))
              }
              className="input input-sm input-bordered"
            />
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => balanceConfig.reset()}
          className="btn btn-sm btn-outline btn-warning mt-4 w-full"
        >
          Reset All to Defaults
        </button>

        {/* Character Presets section */}
        <div className="divider text-sm">Character Presets</div>

        {/* Archetype dropdown */}
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs">Load Archetype</span>
          </label>
          <select
            className="select select-sm select-bordered"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                const data = createArchetypeCharacter(e.target.value);
                characterStore.createFromData(data);
                e.target.value = ''; // Reset select
              }
            }}
          >
            <option value="" disabled>
              Select archetype...
            </option>
            {ARCHETYPES.map((arch) => (
              <option key={arch.id} value={arch.id}>
                {arch.name} - {arch.description}
              </option>
            ))}
          </select>
        </div>

        {/* Randomize button */}
        <button
          onClick={() => {
            const data = createRandomCharacter();
            characterStore.createFromData(data);
          }}
          className="btn btn-sm btn-outline mt-2 w-full"
        >
          Randomize Character
        </button>
      </div>
    </details>
  );
});

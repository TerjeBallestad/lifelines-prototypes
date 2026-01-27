import { observer } from 'mobx-react-lite';
import { PersonalityRadar } from './PersonalityRadar';
import { CapacitiesRadar } from './CapacitiesRadar';
import { NeedsPanel } from './NeedsPanel';
import { DecisionLogPanel } from './DecisionLogPanel';
import { CalculationTracePanel } from './CalculationTracePanel';
import { SimulationRunnerPanel } from './SimulationRunnerPanel';
import { TelemetryChartsPanel } from './TelemetryChartsPanel';
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

      {/* Autonomous AI Controls */}
      <div className="border-base-300 border-b p-4">
        <h3 className="text-base-content/70 mb-2 text-sm font-semibold">
          Autonomy
        </h3>
        {/* Free Will Toggle */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={character.freeWillEnabled}
              onChange={(e) => character.setFreeWill(e.target.checked)}
            />
            <span className="label-text">Free Will</span>
            <span className="text-xs text-base-content/50">
              {character.freeWillEnabled ? '(AI fills idle time)' : '(Manual only)'}
            </span>
          </label>
        </div>
        {/* Decision Log */}
        <div className="mt-2">
          <DecisionLogPanel />
        </div>
        {/* Calculation Traces */}
        <div className="mt-2">
          <CalculationTracePanel />
        </div>
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
      <div className="border-base-300 border-b p-4">
        <h3 className="text-base-content/70 mb-2 text-sm font-semibold">
          Capacities
        </h3>
        <CapacitiesRadar capacities={character.effectiveCapacities} />
      </div>

      {/* Balance Testing Tools */}
      <div className="p-4">
        <details className="collapse collapse-arrow bg-base-300 rounded-box">
          <summary className="collapse-title text-sm font-medium">
            Balance Testing Tools
          </summary>
          <div className="collapse-content space-y-2">
            <SimulationRunnerPanel />
            <TelemetryChartsPanel />
          </div>
        </details>
      </div>
    </div>
  );
});

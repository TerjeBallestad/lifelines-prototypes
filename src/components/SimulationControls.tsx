import { observer } from 'mobx-react-lite';
import { useSimulationStore } from '../stores/RootStore';

export const SimulationControls = observer(function SimulationControls() {
  const simulationStore = useSimulationStore();
  const { isRunning, speed, tickCount, formattedTime } = simulationStore;

  return (
    <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
      {/* Play/Pause */}
      <button
        className={`btn btn-circle ${isRunning ? 'btn-error' : 'btn-success'}`}
        onClick={() =>
          isRunning ? simulationStore.stop() : simulationStore.start()
        }
        aria-label={isRunning ? 'Pause simulation' : 'Start simulation'}
      >
        {isRunning ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="4" width="3" height="12" />
            <rect x="11" y="4" width="3" height="12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <polygon points="5,3 19,10 5,17" />
          </svg>
        )}
      </button>

      {/* Speed slider */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-base-content/70">Speed: {speed}x</label>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={speed}
          onChange={(e) => simulationStore.setSpeed(Number(e.target.value))}
          className="range range-xs range-primary w-32"
        />
      </div>

      {/* Time display */}
      <div className="text-sm font-mono text-base-content/70">
        Tick: {tickCount} ({formattedTime})
      </div>
    </div>
  );
});

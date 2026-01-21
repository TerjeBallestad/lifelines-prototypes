import { observer } from 'mobx-react-lite';
import { useActivityStore, useSimulationStore } from '../stores/RootStore';
import { ActivityCard } from './ActivityCard';

export const ActivityQueue = observer(function ActivityQueue() {
  const activityStore = useActivityStore();
  const simulationStore = useSimulationStore();

  const { currentActivity, currentProgress, queue } = activityStore;

  // Calculate progress percentage for active activity
  const getProgressPercent = (): number => {
    if (!currentActivity) return 0;

    const mode = currentActivity.durationMode;
    switch (mode.type) {
      case 'fixed':
        return Math.min(100, (currentProgress / mode.ticks) * 100);
      case 'variable': {
        const adjusted = mode.baseTicks * (1 - currentActivity.masterySpeedBonus);
        return Math.min(100, (currentProgress / adjusted) * 100);
      }
      case 'threshold':
        // Threshold activities don't have predictable progress
        return 50; // Show indeterminate middle
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Activity */}
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          Current Activity
          {simulationStore.isRunning && currentActivity && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </h4>
        {currentActivity ? (
          <ActivityCard
            activity={currentActivity}
            variant="active"
            progress={getProgressPercent()}
          />
        ) : (
          <div className="text-sm text-base-content/50 italic p-3 bg-base-200 rounded-lg">
            No activity in progress
          </div>
        )}
      </div>

      {/* Queued Activities */}
      <div>
        <h4 className="text-sm font-semibold mb-2">
          Queue ({queue.length})
        </h4>
        {queue.length > 0 ? (
          <div className="space-y-2">
            {queue.map((activity, index) => (
              <ActivityCard
                key={`${activity.id}-${index}`}
                activity={activity}
                variant="queued"
                onCancel={() => activityStore.cancel(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-base-content/50 italic p-3 bg-base-200 rounded-lg">
            Queue empty - add activities from the panel
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {queue.length > 0 && (
        <button
          className="btn btn-sm btn-ghost btn-block text-error"
          onClick={() => activityStore.clearQueue()}
        >
          Clear Queue
        </button>
      )}
    </div>
  );
});

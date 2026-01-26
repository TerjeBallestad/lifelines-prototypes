import { observer } from 'mobx-react-lite';
import { useRootStore, useCharacterStore } from '../stores/RootStore';

/**
 * DecisionLogPanel - displays the last 5 AI decisions for player insight.
 *
 * Shows:
 * - Activity name and critical mode badge
 * - Top reason for selection
 * - Score and alternatives
 * - Expandable breakdown of all 5 utility factors
 */
export const DecisionLogPanel = observer(function DecisionLogPanel() {
  const { utilityAIStore } = useRootStore();
  const characterStore = useCharacterStore();
  const character = characterStore.character;
  const decisions = utilityAIStore.decisionLog;

  if (!character) return null;

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-box">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-medium">
        AI Decision Log ({decisions.length} recent)
      </div>
      <div className="collapse-content">
        {decisions.length === 0 ? (
          <p className="text-sm text-base-content/60">
            No autonomous decisions yet
          </p>
        ) : (
          <ul className="space-y-2">
            {decisions
              .slice()
              .reverse()
              .map((decision, index) => (
                <li
                  key={`${decision.timestamp}-${index}`}
                  className="text-sm border-l-2 border-primary pl-2"
                >
                  <div className="font-medium">
                    {decision.activityName}
                    {decision.criticalMode && (
                      <span className="badge badge-error badge-xs ml-1">
                        Critical
                      </span>
                    )}
                  </div>
                  <div className="text-base-content/70">{decision.topReason}</div>
                  <div className="text-xs text-base-content/50">
                    Score: {Math.round(decision.score)}
                    {decision.topAlternatives.length > 0 && (
                      <>
                        {' '}
                        | Alt:{' '}
                        {decision.topAlternatives
                          .map((a) => `${a.activityName} (${Math.round(a.score)})`)
                          .join(', ')}
                      </>
                    )}
                  </div>
                  {/* Expandable breakdown - all 5 utility factors */}
                  <details className="text-xs mt-1">
                    <summary className="cursor-pointer text-base-content/50">
                      Breakdown
                    </summary>
                    <div className="pl-2 mt-1 text-base-content/60">
                      <div>Need Urgency: {Math.round(decision.breakdown.needUrgency)}</div>
                      <div>
                        Personality Fit: {Math.round(decision.breakdown.personalityFit)}
                      </div>
                      <div>
                        Resource Avail:{' '}
                        {Math.round(decision.breakdown.resourceAvailability)}
                      </div>
                      <div>
                        Willpower Match: {Math.round(decision.breakdown.willpowerMatch)}
                      </div>
                      <div>Mood Delta: {Math.round(decision.breakdown.moodDelta)}</div>
                    </div>
                  </details>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
});

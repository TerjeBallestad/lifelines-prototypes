import { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore, useCharacterStore } from '../stores/RootStore';

/**
 * CalculationTracePanel - Debug panel showing formula breakdowns for derived stats and action resources.
 *
 * Purpose: Enables player/developer to understand why Overskudd, Mood, Purpose, etc. have their current values.
 * Pattern: Follows DecisionLogPanel expandable pattern with DaisyUI collapse and nested <details>.
 *
 * Features:
 * - Action Resources: Overskudd, socialBattery, Focus, Willpower
 * - Derived Wellbeing: Mood, Purpose, Nutrition
 * - Nested expansion for input dependencies
 * - Manual refresh button (not real-time per CONTEXT.md)
 */
export const CalculationTracePanel = observer(function CalculationTracePanel() {
  const root = useRootStore();
  const characterStore = useCharacterStore();
  const character = characterStore.character;
  const config = root.balanceConfig;

  // Refresh counter to force re-render on manual refresh
  const [refreshCount, setRefreshCount] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  if (!character) return null;

  // Read values (refreshCount in dependency ensures re-read on refresh)
  const _ = refreshCount; // Intentionally reference to suppress unused warning

  const { derivedStats, actionResources, needs, personality } = character;
  const actionConfig = config.actionResourcesConfig;
  const derivedConfig = config.derivedStatsConfig;

  // Pre-compute formula values for display
  const overskuddMoodContrib = derivedStats.mood * actionConfig.overskuddMoodWeight;
  const overskuddEnergyContrib = needs.energy * actionConfig.overskuddEnergyWeight;
  const overskuddPurposeContrib = derivedStats.purpose * actionConfig.overskuddPurposeWeight;
  const overskuddTotal = overskuddMoodContrib + overskuddEnergyContrib + overskuddPurposeContrib;

  // Mood formula values
  const moodWeights = derivedConfig.needWeights;
  const moodSteepness = 2.5;
  const totalWeight =
    moodWeights.hunger +
    moodWeights.energy +
    moodWeights.hygiene +
    moodWeights.bladder +
    moodWeights.social +
    moodWeights.fun +
    moodWeights.security;

  // Nutrition mood modifier
  const nutritionMoodMod =
    derivedConfig.nutritionMoodPenalty * (1 - derivedStats.nutrition / 100);

  // Purpose equilibrium
  const purposeEquilibrium = character.purposeEquilibrium;
  const purposeConscientiousnessContrib =
    ((personality.conscientiousness - 50) / 50) *
    derivedConfig.purposeEquilibriumWeights.conscientiousness;
  const purposeOpennessContrib =
    ((personality.openness - 50) / 50) *
    derivedConfig.purposeEquilibriumWeights.openness;

  // socialBattery context
  const extraversion = personality.extraversion;
  const socialBatteryTarget = character.socialBatteryTarget;
  const socialContext = character.currentSocialContext === 0 ? 'Solo' : 'Social';
  const personalityType =
    extraversion < 40 ? 'Introvert' : extraversion > 60 ? 'Extrovert' : 'Ambivert';

  // Willpower
  const willpowerFunBoost = (needs.fun / 100) * actionConfig.willpowerFunBoost * 100;

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-box">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-medium flex items-center gap-2">
        Calculation Traces
        <button
          className="btn btn-xs btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleRefresh();
          }}
        >
          Refresh
        </button>
      </div>
      <div className="collapse-content">
        {/* Action Resources Section */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-base-content/70 mb-2 uppercase tracking-wide">
            Action Resources
          </h4>

          {/* Overskudd */}
          <details className="mb-2 border-l-2 border-primary pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Overskudd: {actionResources.overskudd.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div className="font-mono">
                = (Mood x {actionConfig.overskuddMoodWeight}) + (Energy x{' '}
                {actionConfig.overskuddEnergyWeight}) + (Purpose x{' '}
                {actionConfig.overskuddPurposeWeight})
              </div>
              <div className="font-mono">
                = ({derivedStats.mood.toFixed(1)} x {actionConfig.overskuddMoodWeight}) + (
                {needs.energy.toFixed(1)} x {actionConfig.overskuddEnergyWeight}) + (
                {derivedStats.purpose.toFixed(1)} x {actionConfig.overskuddPurposeWeight})
              </div>
              <div className="font-mono">
                = {overskuddMoodContrib.toFixed(2)} + {overskuddEnergyContrib.toFixed(2)} +{' '}
                {overskuddPurposeContrib.toFixed(2)}
              </div>
              <div className="font-mono font-bold">= {overskuddTotal.toFixed(2)}</div>

              {/* Nested: Where does Mood come from? */}
              <details className="mt-2 pl-2 border-l border-base-300">
                <summary className="cursor-pointer text-base-content/50">
                  Where does Mood come from?
                </summary>
                <div className="mt-1 space-y-1">
                  <div>Mood: {derivedStats.mood.toFixed(1)} (floor: {derivedConfig.moodFloor}, ceiling: {derivedConfig.moodCeiling})</div>
                  <div className="font-mono">
                    = 50 + avgWeightedNeedContribution + nutritionMod
                  </div>
                  <div className="font-mono">
                    Nutrition modifier: {nutritionMoodMod.toFixed(1)} (penalty: {derivedConfig.nutritionMoodPenalty})
                  </div>
                  <div className="font-mono">Steepness: {moodSteepness}, Total weight: {totalWeight.toFixed(1)}</div>
                  <div className="mt-1 text-base-content/50">Need contributions:</div>
                  {character.moodBreakdown.contributions.map((c) => (
                    <div key={c.source} className="font-mono pl-2">
                      {c.source}: {c.value > 0 ? '+' : ''}{c.value.toFixed(1)}
                    </div>
                  ))}
                </div>
              </details>

              {/* Nested: Where does Purpose come from? */}
              <details className="mt-2 pl-2 border-l border-base-300">
                <summary className="cursor-pointer text-base-content/50">
                  Where does Purpose come from?
                </summary>
                <div className="mt-1 space-y-1">
                  <div>Purpose: {derivedStats.purpose.toFixed(1)} (equilibrium: {purposeEquilibrium.toFixed(1)})</div>
                  <div className="font-mono">
                    Equilibrium = 50 + (C contribution) + (O contribution)
                  </div>
                  <div className="font-mono pl-2">
                    Conscientiousness ({personality.conscientiousness}): {purposeConscientiousnessContrib > 0 ? '+' : ''}{purposeConscientiousnessContrib.toFixed(1)}
                  </div>
                  <div className="font-mono pl-2">
                    Openness ({personality.openness}): {purposeOpennessContrib > 0 ? '+' : ''}{purposeOpennessContrib.toFixed(1)}
                  </div>
                  <div className="font-mono">
                    Decay rate: {derivedConfig.purposeDecayRate} toward equilibrium
                  </div>
                </div>
              </details>
            </div>
          </details>

          {/* socialBattery */}
          <details className="mb-2 border-l-2 border-secondary pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Social Battery: {actionResources.socialBattery.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div>Extraversion: {extraversion.toFixed(0)} ({personalityType})</div>
              <div>Current context: {socialContext}</div>
              <div>Target: {socialBatteryTarget.toFixed(1)}</div>
              <div className="font-mono mt-1">
                {personalityType === 'Introvert' && (
                  <>
                    Solo: charges at {actionConfig.introvertChargeRate}/tick
                    <br />
                    Social: drains at {actionConfig.introvertDrainRate}/tick
                  </>
                )}
                {personalityType === 'Extrovert' && (
                  <>
                    Solo: drains at {actionConfig.extrovertDrainRate}/tick
                    <br />
                    Social: charges at {actionConfig.extrovertChargeRate}/tick
                  </>
                )}
                {personalityType === 'Ambivert' && (
                  <>Neutral drift: {actionConfig.ambivertDrainRate}/tick</>
                )}
              </div>
              {actionResources.socialBattery <= 0 && (
                <div className="text-error font-mono">
                  At 0: draining Willpower at {actionConfig.zeroSocialBatteryWillpowerCost}/tick
                </div>
              )}
            </div>
          </details>

          {/* Focus */}
          <details className="mb-2 border-l-2 border-accent pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Focus: {actionResources.focus.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div>Target: {character.focusTarget} (resting)</div>
              <div className="font-mono">
                Passive regen: {actionConfig.focusRegenRate}/tick
              </div>
              <div className="font-mono">
                Concentration cost: {actionConfig.focusCostPerTick}/tick
              </div>
            </div>
          </details>

          {/* Willpower */}
          <details className="mb-2 border-l-2 border-warning pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Willpower: {actionResources.willpower.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div className="font-mono">
                Target = 80 (base) + Fun boost
              </div>
              <div className="font-mono">
                = 80 + ({needs.fun.toFixed(1)} / 100 x {actionConfig.willpowerFunBoost} x 100)
              </div>
              <div className="font-mono">
                = 80 + {willpowerFunBoost.toFixed(1)} = {(80 + willpowerFunBoost).toFixed(1)}
              </div>
              <div className="font-mono mt-1">
                Passive regen: {actionConfig.willpowerRegenRate}/tick
              </div>
              <div className="font-mono">
                Decision cost: {actionConfig.willpowerDecisionCost}/decision
              </div>
            </div>
          </details>
        </div>

        {/* Derived Wellbeing Section */}
        <div>
          <h4 className="text-xs font-semibold text-base-content/70 mb-2 uppercase tracking-wide">
            Derived Wellbeing
          </h4>

          {/* Mood */}
          <details className="mb-2 border-l-2 border-info pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Mood: {derivedStats.mood.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div>
                Floor: {derivedConfig.moodFloor}, Ceiling: {derivedConfig.moodCeiling}
              </div>
              <div>Smoothing alpha: {derivedConfig.moodSmoothingAlpha}</div>
              <div className="font-mono mt-1">
                = 50 + avgWeightedNeedContrib + nutritionMod
              </div>
              <div className="mt-1 text-base-content/50">Need weights:</div>
              {Object.entries(moodWeights).map(([key, weight]) => (
                <div key={key} className="font-mono pl-2">
                  {key}: x{weight} ({((needs as Record<string, number>)[key] ?? 0).toFixed(1)})
                </div>
              ))}
              <div className="mt-1 font-mono">
                Nutrition ({derivedStats.nutrition.toFixed(1)}): {nutritionMoodMod > 0 ? '+' : ''}{nutritionMoodMod.toFixed(1)} mood
              </div>
            </div>
          </details>

          {/* Purpose */}
          <details className="mb-2 border-l-2 border-success pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Purpose: {derivedStats.purpose.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div>Equilibrium: {purposeEquilibrium.toFixed(1)} (decays toward this)</div>
              <div>Decay rate: {derivedConfig.purposeDecayRate}/tick</div>
              <div>Smoothing alpha: {derivedConfig.purposeSmoothingAlpha}</div>
              <div className="font-mono mt-1">
                Equilibrium = 50 + C({purposeConscientiousnessContrib.toFixed(1)}) + O({purposeOpennessContrib.toFixed(1)})
              </div>
              <div className="font-mono">
                Conscientiousness: {personality.conscientiousness} (weight: {derivedConfig.purposeEquilibriumWeights.conscientiousness})
              </div>
              <div className="font-mono">
                Openness: {personality.openness} (weight: {derivedConfig.purposeEquilibriumWeights.openness})
              </div>
            </div>
          </details>

          {/* Nutrition */}
          <details className="mb-2 border-l-2 border-base-300 pl-2">
            <summary className="cursor-pointer text-sm font-medium">
              Nutrition: {derivedStats.nutrition.toFixed(1)}
            </summary>
            <div className="text-xs space-y-1 mt-1 text-base-content/70">
              <div>Smoothing alpha: {derivedConfig.nutritionSmoothingAlpha} (very slow)</div>
              <div className="font-mono mt-1">
                Energy regen modifier: {character.getNutritionEnergyModifier().toFixed(2)}x
              </div>
              <div className="font-mono">
                Range: {derivedConfig.nutritionEnergyModMin} (at 0) to {derivedConfig.nutritionEnergyModMax} (at 100)
              </div>
              <div className="font-mono mt-1">
                Mood penalty at 0: {derivedConfig.nutritionMoodPenalty}
              </div>
              <div className="font-mono">
                Current mood effect: {nutritionMoodMod.toFixed(1)}
              </div>
            </div>
          </details>
        </div>

        {/* Refresh timestamp */}
        <div className="text-xs text-base-content/40 mt-2 text-right">
          Refreshed: {new Date().toLocaleTimeString()} (#{refreshCount})
        </div>
      </div>
    </div>
  );
});

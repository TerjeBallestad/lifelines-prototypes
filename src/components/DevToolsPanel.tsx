import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { useRootStore } from '../stores/RootStore';
import type { BalanceConfig, NeedsConfig, DerivedStatsConfig, ActionResourcesConfig } from '../config/balance';
import { listPresets, savePreset, loadPreset, deletePreset } from '../utils/presets';
import type { DifficultyConfig } from '../types/difficulty';

/**
 * Dev Tools panel for tuning game balance and simulation parameters.
 * Features preset management and deep nested config editing.
 */
export const DevToolsPanel = observer(function DevToolsPanel() {
  const { simulationStore, balanceConfig } = useRootStore();

  // Preset management state
  const [presetList, setPresetList] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [newPresetName, setNewPresetName] = useState<string>('');

  // Refresh preset list on mount and after changes
  useEffect(() => {
    setPresetList(listPresets());
  }, []);

  const refreshPresets = () => {
    setPresetList(listPresets());
  };

  // Handler for top-level balance config updates
  const handleBalanceChange = (field: keyof BalanceConfig, value: number) => {
    const clamped = Math.max(0, value);
    balanceConfig.update({ [field]: clamped });
  };

  // Handler for nested config updates
  const handleNestedUpdate = (
    section: 'needs' | 'derivedStats' | 'actionResources' | 'difficulty',
    field: string,
    value: number
  ) => {
    const sectionConfig = { ...balanceConfig.config[section], [field]: value };
    balanceConfig.update({ [section]: sectionConfig });
  };

  // Handler for deeply nested updates (e.g., needWeights, purposeEquilibriumWeights)
  const handleDeepNestedUpdate = (
    section: 'derivedStats',
    nested: 'needWeights' | 'purposeEquilibriumWeights',
    field: string,
    value: number
  ) => {
    const sectionConfig = balanceConfig.config[section];
    const nestedConfig = { ...sectionConfig[nested], [field]: value };
    balanceConfig.update({
      [section]: { ...sectionConfig, [nested]: nestedConfig }
    });
  };

  // Preset actions
  const handleLoadPreset = () => {
    if (!selectedPreset) return;
    const preset = loadPreset(selectedPreset);
    if (preset) {
      balanceConfig.update(preset);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    savePreset(newPresetName.trim(), balanceConfig.config);
    setNewPresetName('');
    refreshPresets();
    setSelectedPreset(newPresetName.trim());
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;
    deletePreset(selectedPreset);
    setSelectedPreset('');
    refreshPresets();
  };

  return (
    <details className="collapse-arrow bg-base-200 border-base-300 collapse border">
      <summary className="collapse-title text-lg font-medium">
        Dev Tools
      </summary>
      <div className="collapse-content space-y-4">
        {/* Preset Controls Section */}
        <div className="bg-base-300 rounded-lg p-3">
          <h3 className="mb-2 text-sm font-semibold">Presets</h3>
          <div className="flex flex-wrap gap-2">
            {/* Preset selector */}
            <select
              className="select select-sm select-bordered flex-1 min-w-[120px]"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
            >
              <option value="">Select preset...</option>
              {presetList.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button
              onClick={handleLoadPreset}
              disabled={!selectedPreset}
              className="btn btn-sm btn-primary"
            >
              Load
            </button>
            <button
              onClick={handleDeletePreset}
              disabled={!selectedPreset}
              className="btn btn-sm btn-error btn-outline"
            >
              Delete
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="New preset name..."
              className="input input-sm input-bordered flex-1"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <button
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
              className="btn btn-sm btn-success"
            >
              Save Current
            </button>
          </div>
        </div>

        {/* Simulation section */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Simulation</h3>
          <label className="input">
            <span className="label">
              Speed: {simulationStore.speed.toFixed(1)}x
            </span>
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
          </label>
        </div>

        {/* Core Balance Parameters */}
        <details className="collapse-arrow bg-base-300 collapse">
          <summary className="collapse-title text-sm font-medium">Core Balance</summary>
          <div className="collapse-content">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <NumberInput
                label="Min Overskudd to Start"
                value={balanceConfig.minOverskuddToStart}
                onChange={(v) => handleBalanceChange('minOverskuddToStart', v)}
              />
              <NumberInput
                label="Mastery Bonus Per Level"
                value={balanceConfig.masteryBonusPerLevel}
                step={0.01}
                onChange={(v) => handleBalanceChange('masteryBonusPerLevel', v)}
              />
              <NumberInput
                label="Mastery XP on Success"
                value={balanceConfig.masteryXPOnSuccess}
                onChange={(v) => handleBalanceChange('masteryXPOnSuccess', v)}
              />
              <NumberInput
                label="Mastery XP on Failure"
                value={balanceConfig.masteryXPOnFailure}
                onChange={(v) => handleBalanceChange('masteryXPOnFailure', v)}
              />
              <NumberInput
                label="Talent Pick Threshold"
                value={balanceConfig.talentPickThreshold}
                onChange={(v) => handleBalanceChange('talentPickThreshold', v)}
              />
              <NumberInput
                label="Max Pending Picks"
                value={balanceConfig.maxPendingPicks}
                onChange={(v) => handleBalanceChange('maxPendingPicks', v)}
              />
              <NumberInput
                label="Personality Modifier Strength"
                value={balanceConfig.personalityModifierStrength}
                step={0.1}
                onChange={(v) => handleBalanceChange('personalityModifierStrength', v)}
              />
              <NumberInput
                label="Simulation Tick (ms)"
                value={balanceConfig.simulationTickMs}
                step={100}
                onChange={(v) => handleBalanceChange('simulationTickMs', v)}
              />
            </div>
          </div>
        </details>

        {/* Needs Config Section */}
        <details className="collapse-arrow bg-base-300 collapse">
          <summary className="collapse-title text-sm font-medium">Needs Config</summary>
          <div className="collapse-content">
            <NeedsConfigSection
              config={balanceConfig.needsConfig}
              onUpdate={(field, value) => handleNestedUpdate('needs', field, value)}
            />
          </div>
        </details>

        {/* Derived Stats Config Section */}
        <details className="collapse-arrow bg-base-300 collapse">
          <summary className="collapse-title text-sm font-medium">Derived Stats Config</summary>
          <div className="collapse-content">
            <DerivedStatsConfigSection
              config={balanceConfig.derivedStatsConfig}
              onUpdate={(field, value) => handleNestedUpdate('derivedStats', field, value)}
              onDeepUpdate={(nested, field, value) => handleDeepNestedUpdate('derivedStats', nested, field, value)}
            />
          </div>
        </details>

        {/* Action Resources Config Section */}
        <details className="collapse-arrow bg-base-300 collapse">
          <summary className="collapse-title text-sm font-medium">Action Resources Config</summary>
          <div className="collapse-content">
            <ActionResourcesConfigSection
              config={balanceConfig.actionResourcesConfig}
              onUpdate={(field, value) => handleNestedUpdate('actionResources', field, value)}
            />
          </div>
        </details>

        {/* Difficulty Config Section */}
        <details className="collapse-arrow bg-base-300 collapse">
          <summary className="collapse-title text-sm font-medium">Difficulty Config</summary>
          <div className="collapse-content">
            <DifficultyConfigSection
              config={balanceConfig.difficultyConfig}
              onUpdate={(field, value) => handleNestedUpdate('difficulty', field, value)}
            />
          </div>
        </details>

        {/* Reset button */}
        <button
          onClick={() => balanceConfig.reset()}
          className="btn btn-sm btn-outline btn-warning mt-4 w-full"
        >
          Reset All to Defaults
        </button>
      </div>
    </details>
  );
});

// ============================================================================
// Helper Components
// ============================================================================

interface NumberInputProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, step = 1, min = 0, onChange }: NumberInputProps) {
  return (
    <label className="input input-sm input-bordered flex items-center gap-2">
      <span className="text-xs opacity-70 flex-shrink-0">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 text-right"
      />
    </label>
  );
}

// ============================================================================
// Needs Config Section
// ============================================================================

interface NeedsConfigSectionProps {
  config: NeedsConfig;
  onUpdate: (field: string, value: number) => void;
}

function NeedsConfigSection({ config, onUpdate }: NeedsConfigSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="col-span-full text-xs opacity-70 mb-1">Physiological Decay Rates</div>
      <NumberInput
        label="Hunger"
        value={config.hungerDecayRate}
        step={0.1}
        onChange={(v) => onUpdate('hungerDecayRate', v)}
      />
      <NumberInput
        label="Energy"
        value={config.energyDecayRate}
        step={0.1}
        onChange={(v) => onUpdate('energyDecayRate', v)}
      />
      <NumberInput
        label="Hygiene"
        value={config.hygieneDecayRate}
        step={0.1}
        onChange={(v) => onUpdate('hygieneDecayRate', v)}
      />
      <NumberInput
        label="Bladder"
        value={config.bladderDecayRate}
        step={0.1}
        onChange={(v) => onUpdate('bladderDecayRate', v)}
      />
      <div className="col-span-full text-xs opacity-70 mb-1 mt-2">Social/Psychological Decay Rates</div>
      <NumberInput
        label="Social"
        value={config.socialDecayRate}
        step={0.05}
        onChange={(v) => onUpdate('socialDecayRate', v)}
      />
      <NumberInput
        label="Fun"
        value={config.funDecayRate}
        step={0.05}
        onChange={(v) => onUpdate('funDecayRate', v)}
      />
      <NumberInput
        label="Security"
        value={config.securityDecayRate}
        step={0.05}
        onChange={(v) => onUpdate('securityDecayRate', v)}
      />
      <div className="col-span-full text-xs opacity-70 mb-1 mt-2">Other</div>
      <NumberInput
        label="Personality Modifier"
        value={config.personalityModifierNeeds}
        step={0.1}
        onChange={(v) => onUpdate('personalityModifierNeeds', v)}
      />
      <NumberInput
        label="Critical Threshold"
        value={config.criticalThreshold}
        onChange={(v) => onUpdate('criticalThreshold', v)}
      />
    </div>
  );
}

// ============================================================================
// Derived Stats Config Section
// ============================================================================

interface DerivedStatsConfigSectionProps {
  config: DerivedStatsConfig;
  onUpdate: (field: string, value: number) => void;
  onDeepUpdate: (nested: 'needWeights' | 'purposeEquilibriumWeights', field: string, value: number) => void;
}

function DerivedStatsConfigSection({ config, onUpdate, onDeepUpdate }: DerivedStatsConfigSectionProps) {
  return (
    <div className="space-y-4">
      {/* Mood Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Mood</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Smoothing Alpha"
            value={config.moodSmoothingAlpha}
            step={0.01}
            onChange={(v) => onUpdate('moodSmoothingAlpha', v)}
          />
          <NumberInput
            label="Floor"
            value={config.moodFloor}
            onChange={(v) => onUpdate('moodFloor', v)}
          />
          <NumberInput
            label="Ceiling"
            value={config.moodCeiling}
            onChange={(v) => onUpdate('moodCeiling', v)}
          />
        </div>
        <div className="text-xs opacity-70 mb-1 mt-2">Need Weights</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {Object.entries(config.needWeights).map(([need, weight]) => (
            <NumberInput
              key={need}
              label={need}
              value={weight}
              step={0.1}
              onChange={(v) => onDeepUpdate('needWeights', need, v)}
            />
          ))}
        </div>
      </div>

      {/* Purpose Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Purpose</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Smoothing Alpha"
            value={config.purposeSmoothingAlpha}
            step={0.01}
            onChange={(v) => onUpdate('purposeSmoothingAlpha', v)}
          />
          <NumberInput
            label="Decay Rate"
            value={config.purposeDecayRate}
            step={0.01}
            onChange={(v) => onUpdate('purposeDecayRate', v)}
          />
        </div>
        <div className="text-xs opacity-70 mb-1 mt-2">Equilibrium Weights</div>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Conscientiousness"
            value={config.purposeEquilibriumWeights.conscientiousness}
            onChange={(v) => onDeepUpdate('purposeEquilibriumWeights', 'conscientiousness', v)}
          />
          <NumberInput
            label="Openness"
            value={config.purposeEquilibriumWeights.openness}
            onChange={(v) => onDeepUpdate('purposeEquilibriumWeights', 'openness', v)}
          />
        </div>
      </div>

      {/* Nutrition Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Nutrition</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Smoothing Alpha"
            value={config.nutritionSmoothingAlpha}
            step={0.001}
            onChange={(v) => onUpdate('nutritionSmoothingAlpha', v)}
          />
          <NumberInput
            label="Energy Mod Min"
            value={config.nutritionEnergyModMin}
            step={0.1}
            onChange={(v) => onUpdate('nutritionEnergyModMin', v)}
          />
          <NumberInput
            label="Energy Mod Max"
            value={config.nutritionEnergyModMax}
            step={0.1}
            onChange={(v) => onUpdate('nutritionEnergyModMax', v)}
          />
          <NumberInput
            label="Mood Penalty"
            value={config.nutritionMoodPenalty}
            min={-100}
            onChange={(v) => onUpdate('nutritionMoodPenalty', v)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Action Resources Config Section
// ============================================================================

interface ActionResourcesConfigSectionProps {
  config: ActionResourcesConfig;
  onUpdate: (field: string, value: number) => void;
}

function ActionResourcesConfigSection({ config, onUpdate }: ActionResourcesConfigSectionProps) {
  return (
    <div className="space-y-4">
      {/* Overskudd Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Overskudd</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Alpha"
            value={config.overskuddAlpha}
            step={0.01}
            onChange={(v) => onUpdate('overskuddAlpha', v)}
          />
          <NumberInput
            label="Mood Weight"
            value={config.overskuddMoodWeight}
            step={0.05}
            onChange={(v) => onUpdate('overskuddMoodWeight', v)}
          />
          <NumberInput
            label="Energy Weight"
            value={config.overskuddEnergyWeight}
            step={0.05}
            onChange={(v) => onUpdate('overskuddEnergyWeight', v)}
          />
          <NumberInput
            label="Purpose Weight"
            value={config.overskuddPurposeWeight}
            step={0.05}
            onChange={(v) => onUpdate('overskuddPurposeWeight', v)}
          />
        </div>
      </div>

      {/* socialBattery Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Social Battery</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Alpha"
            value={config.socialBatteryAlpha}
            step={0.01}
            onChange={(v) => onUpdate('socialBatteryAlpha', v)}
          />
          <NumberInput
            label="Introvert Drain Rate"
            value={config.introvertDrainRate}
            step={0.1}
            onChange={(v) => onUpdate('introvertDrainRate', v)}
          />
          <NumberInput
            label="Introvert Charge Rate"
            value={config.introvertChargeRate}
            step={0.1}
            onChange={(v) => onUpdate('introvertChargeRate', v)}
          />
          <NumberInput
            label="Extrovert Drain Rate"
            value={config.extrovertDrainRate}
            step={0.1}
            onChange={(v) => onUpdate('extrovertDrainRate', v)}
          />
          <NumberInput
            label="Extrovert Charge Rate"
            value={config.extrovertChargeRate}
            step={0.1}
            onChange={(v) => onUpdate('extrovertChargeRate', v)}
          />
          <NumberInput
            label="Ambivert Drain Rate"
            value={config.ambivertDrainRate}
            step={0.1}
            onChange={(v) => onUpdate('ambivertDrainRate', v)}
          />
          <NumberInput
            label="Zero Battery WP Cost"
            value={config.zeroSocialBatteryWillpowerCost}
            onChange={(v) => onUpdate('zeroSocialBatteryWillpowerCost', v)}
          />
        </div>
      </div>

      {/* Focus Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Focus</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Alpha"
            value={config.focusAlpha}
            step={0.01}
            onChange={(v) => onUpdate('focusAlpha', v)}
          />
          <NumberInput
            label="Regen Rate"
            value={config.focusRegenRate}
            step={0.1}
            onChange={(v) => onUpdate('focusRegenRate', v)}
          />
          <NumberInput
            label="Cost Per Tick"
            value={config.focusCostPerTick}
            step={0.1}
            onChange={(v) => onUpdate('focusCostPerTick', v)}
          />
        </div>
      </div>

      {/* Willpower Config */}
      <div>
        <div className="text-xs font-semibold mb-2">Willpower</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NumberInput
            label="Alpha"
            value={config.willpowerAlpha}
            step={0.01}
            onChange={(v) => onUpdate('willpowerAlpha', v)}
          />
          <NumberInput
            label="Regen Rate"
            value={config.willpowerRegenRate}
            step={0.05}
            onChange={(v) => onUpdate('willpowerRegenRate', v)}
          />
          <NumberInput
            label="Fun Boost"
            value={config.willpowerFunBoost}
            step={0.1}
            onChange={(v) => onUpdate('willpowerFunBoost', v)}
          />
          <NumberInput
            label="Decision Cost"
            value={config.willpowerDecisionCost}
            onChange={(v) => onUpdate('willpowerDecisionCost', v)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Difficulty Config Section
// ============================================================================

interface DifficultyConfigSectionProps {
  config: DifficultyConfig;
  onUpdate: (field: string, value: number) => void;
}

function DifficultyConfigSection({ config, onUpdate }: DifficultyConfigSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <NumberInput
        label="Max Skill Reduction"
        value={config.maxSkillReduction}
        step={0.1}
        onChange={(v) => onUpdate('maxSkillReduction', v)}
      />
      <NumberInput
        label="Max Mastery Reduction"
        value={config.maxMasteryReduction}
        step={0.1}
        onChange={(v) => onUpdate('maxMasteryReduction', v)}
      />
      <div className="col-span-full">
        <label className="text-xs opacity-70">Diminishing Returns: {config.skillDiminishingReturns}</label>
      </div>
    </div>
  );
}

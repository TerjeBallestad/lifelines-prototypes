import type { BalanceConfig } from '../config/balance';
import { BALANCE_PRESETS_KEY } from '../config/balance';

/**
 * Preset management utilities for balance configuration.
 * Presets allow saving, loading, and managing named balance configurations
 * for A/B testing different balance philosophies.
 */

export type PresetMap = Record<string, BalanceConfig>;

/**
 * List all saved preset names.
 */
export function listPresets(): string[] {
  const stored = localStorage.getItem(BALANCE_PRESETS_KEY);
  if (!stored) return [];
  try {
    return Object.keys(JSON.parse(stored) as PresetMap);
  } catch {
    return [];
  }
}

/**
 * Save current config as a named preset.
 */
export function savePreset(name: string, config: BalanceConfig): void {
  const presets = loadAllPresets();
  presets[name] = config;
  localStorage.setItem(BALANCE_PRESETS_KEY, JSON.stringify(presets));
}

/**
 * Load a preset by name.
 * Returns null if preset doesn't exist.
 */
export function loadPreset(name: string): BalanceConfig | null {
  const presets = loadAllPresets();
  return presets[name] ?? null;
}

/**
 * Delete a preset by name.
 */
export function deletePreset(name: string): void {
  const presets = loadAllPresets();
  delete presets[name];
  localStorage.setItem(BALANCE_PRESETS_KEY, JSON.stringify(presets));
}

/**
 * Load all presets from localStorage.
 * @internal
 */
function loadAllPresets(): PresetMap {
  const stored = localStorage.getItem(BALANCE_PRESETS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as PresetMap;
  } catch {
    return {};
  }
}

// ============================================================================
// Export/Import for file-based backup
// ============================================================================

/**
 * Export all presets as JSON string for backup.
 */
export function exportPresetsToJSON(): string {
  return localStorage.getItem(BALANCE_PRESETS_KEY) ?? '{}';
}

/**
 * Import presets from JSON string.
 * Returns true if import succeeded, false if JSON was invalid.
 */
export function importPresetsFromJSON(json: string): boolean {
  try {
    JSON.parse(json); // Validate JSON
    localStorage.setItem(BALANCE_PRESETS_KEY, json);
    return true;
  } catch {
    return false;
  }
}

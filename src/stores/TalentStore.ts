import { makeAutoObservable, observable } from 'mobx';
import { Talent } from '../entities/Talent';
import type { TalentData, SkillDomain } from '../entities/types';
import { TALENTS } from '../data/talents';
import { type RootStore } from './RootStore';
import { weightedSampleWithoutReplacement } from '../utils/weightedRandom';

/** XP threshold per domain to earn a talent pick */
const PICK_THRESHOLD = 500;

/** Maximum pending picks that can queue */
const MAX_PENDING_PICKS = 3;

export class TalentStore {
  talentPool = observable.map<string, Talent>();
  selectedTalents = observable.map<string, Talent>();
  pendingPicks = 0;
  currentOffer: Talent[] | null = null;

  /** Track XP thresholds crossed per domain to avoid double-triggering */
  private pickThresholdsCrossed = observable.map<SkillDomain, number>();

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

    // Seed talent pool from data
    this.seedTalents(TALENTS);
  }

  get talentsArray(): Talent[] {
    return Array.from(this.talentPool.values());
  }

  get selectedTalentsArray(): Talent[] {
    return Array.from(this.selectedTalents.values());
  }

  get availableTalents(): Talent[] {
    return this.talentsArray.filter((t) => !this.selectedTalents.has(t.id));
  }

  /** Check if player has earned a talent pick based on domain XP */
  checkForTalentPick(domain: SkillDomain, newTotalXP: number): void {
    const prevThreshold = this.pickThresholdsCrossed.get(domain) ?? 0;
    const newThreshold = Math.floor(newTotalXP / PICK_THRESHOLD);

    if (newThreshold > prevThreshold) {
      this.pickThresholdsCrossed.set(domain, newThreshold);
      this.addPendingPick();
    }
  }

  private addPendingPick(): void {
    if (this.pendingPicks < MAX_PENDING_PICKS) {
      this.pendingPicks++;

      // Auto-generate offer if none active
      if (!this.currentOffer) {
        this.generateOffer();
      }
    }
  }

  /** Generate weighted random 1-of-3 offer (no duplicates) */
  generateOffer(): void {
    const available = this.availableTalents;

    if (available.length < 3) {
      console.warn('[TalentStore] Not enough talents for offer');
      return;
    }

    const weights = available.map((t) => t.rarityWeight);
    const indices = weightedSampleWithoutReplacement(weights, 3);
    this.currentOffer = indices
      .map((i) => available[i])
      .filter((t): t is Talent => t !== undefined);
  }

  /** Select a talent from current offer */
  selectTalent(talentId: string): boolean {
    if (!this.currentOffer) return false;

    const talent = this.currentOffer.find((t) => t.id === talentId);
    if (!talent) return false;

    // Add to selected
    this.selectedTalents.set(talent.id, talent);

    // Consume pending pick
    this.pendingPicks--;
    this.currentOffer = null;

    // Generate next offer if picks remain
    if (this.pendingPicks > 0) {
      this.generateOffer();
    }

    return true;
  }

  /** Force open talent selection (for testing) */
  forceOffer(): void {
    if (this.availableTalents.length >= 3) {
      this.pendingPicks = Math.max(1, this.pendingPicks);
      this.generateOffer();
    }
  }

  private seedTalents(talentDataList: TalentData[]): void {
    for (const data of talentDataList) {
      const talent = new Talent(data);
      this.talentPool.set(data.id, talent);
    }
  }

  get rootStore(): RootStore {
    return this.root;
  }
}

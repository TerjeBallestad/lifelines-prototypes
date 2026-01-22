import { makeAutoObservable } from 'mobx';
import type { TalentData, TalentRarity, SkillDomain, ModifierEffect } from './types';

/**
 * Talent entity - represents a roguelike talent/modifier.
 * Uses class-based pattern to mirror Character/Skill/Activity structure.
 * All properties are observable, all methods are actions.
 */
export class Talent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rarity: TalentRarity;
  readonly domain: SkillDomain | null;
  readonly effects: ModifierEffect[];

  constructor(data: TalentData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.rarity = data.rarity;
    this.domain = data.domain;
    this.effects = data.effects;

    makeAutoObservable(this);
  }

  /**
   * Computed: Rarity weight for selection probability.
   * Common = 70, Rare = 25, Epic = 5 (totals 100 for easy % calculation)
   */
  get rarityWeight(): number {
    const weights: Record<TalentRarity, number> = {
      common: 70,
      rare: 25,
      epic: 5,
    };
    return weights[this.rarity];
  }

  /**
   * Computed: Whether this talent is domain-specific or universal.
   */
  get isUniversal(): boolean {
    return this.domain === null;
  }

  /**
   * Computed: CSS color class for rarity display.
   */
  get rarityColorClass(): string {
    const colors: Record<TalentRarity, string> = {
      common: 'text-base-content',
      rare: 'text-info',
      epic: 'text-secondary',
    };
    return colors[this.rarity];
  }
}

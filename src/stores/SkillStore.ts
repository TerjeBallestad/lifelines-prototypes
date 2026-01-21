import { makeAutoObservable, observable } from 'mobx';
import { Skill } from '../entities/Skill';
import {
  SkillDomain,
  SkillData,
  SkillState,
  PrerequisiteStatus,
} from '../entities/types';
import type { RootStore } from './RootStore';

// All skill domains
export const DOMAINS: SkillDomain[] = [
  'social',
  'organisational',
  'analytical',
  'physical',
  'creative',
];

export class SkillStore {
  skills = observable.map<string, Skill>();
  domainXP = observable.map<SkillDomain, number>();

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

    // Initialize all domains with 0 XP
    for (const domain of DOMAINS) {
      this.domainXP.set(domain, 0);
    }
  }

  get skillsArray(): Skill[] {
    return Array.from(this.skills.values());
  }

  skillsByDomain(domain: SkillDomain): Skill[] {
    return this.skillsArray.filter((skill) => skill.domain === domain);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  // Check if a skill can be unlocked (all prerequisites met)
  isUnlockable(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Already unlocked
    if (skill.level > 0) return false;

    // All prerequisites must be at least level 1
    return skill.prerequisites.every(
      (prereqId) => (this.skills.get(prereqId)?.level ?? 0) >= 1
    );
  }

  // Get the current state of a skill
  getSkillState(skillId: string): SkillState {
    const skill = this.skills.get(skillId);
    if (!skill) return 'locked';

    if (skill.level >= 5) return 'mastered';
    if (skill.level >= 1) return 'unlocked';
    if (this.isUnlockable(skillId)) return 'unlockable';
    return 'locked';
  }

  // Get progress for each prerequisite
  getPrerequisiteProgress(skillId: string): PrerequisiteStatus[] {
    const skill = this.skills.get(skillId);
    if (!skill) return [];

    return skill.prerequisites.map((prereqId) => {
      const prereq = this.skills.get(prereqId);
      const current = prereq?.level ?? 0;
      return {
        skillId: prereqId,
        name: prereq?.name ?? 'Unknown',
        required: 1,
        current,
        met: current >= 1,
      };
    });
  }

  // Check if player can afford to unlock/level up a skill
  canAffordUnlock(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    const currentXP = this.domainXP.get(skill.domain) ?? 0;
    return currentXP >= skill.nextLevelCost;
  }
}

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
}

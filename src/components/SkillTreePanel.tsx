import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSkillStore } from '../stores';
import { SkillCard } from './SkillCard';
import type { SkillDomain } from '../entities/types';

// All skill domains
const DOMAINS: SkillDomain[] = [
  'social',
  'organisational',
  'analytical',
  'physical',
  'creative',
];

// Human-readable domain labels
const DOMAIN_LABELS: Record<SkillDomain, string> = {
  social: 'Social',
  organisational: 'Organisation',
  analytical: 'Analytical',
  physical: 'Physical',
  creative: 'Creative',
};

export const SkillTreePanel = observer(function SkillTreePanel() {
  const [activeDomain, setActiveDomain] = useState<SkillDomain>('social');
  const skillStore = useSkillStore();

  const skills = skillStore.skillsByDomain(activeDomain);
  const domainXP = skillStore.domainXP.get(activeDomain) ?? 0;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Skill Tree</h2>

      {/* Domain tabs */}
      <div role="tablist" className="tabs tabs-box mb-4">
        {DOMAINS.map((domain) => (
          <button
            key={domain}
            role="tab"
            className={`tab ${activeDomain === domain ? 'tab-active' : ''}`}
            onClick={() => setActiveDomain(domain)}
          >
            {DOMAIN_LABELS[domain]}
            <span className="badge badge-sm ml-2">
              {skillStore.domainXP.get(domain) ?? 0} XP
            </span>
          </button>
        ))}
      </div>

      {/* Domain XP display */}
      <div className="mb-4 text-lg">
        <span className="font-semibold">{DOMAIN_LABELS[activeDomain]} XP:</span>
        <span className="ml-2 text-primary font-bold">{domainXP}</span>
      </div>

      {/* Skill grid */}
      {skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skillId={skill.id} />
          ))}
        </div>
      ) : (
        <div className="text-base-content/50 text-center py-8">
          No skills in this domain yet
        </div>
      )}
    </div>
  );
});

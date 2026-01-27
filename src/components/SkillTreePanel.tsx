import { Fragment, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SkillCard } from './SkillCard';
import type { SkillDomain } from '../entities/types';
import { useSkillStore } from '../stores/RootStore';

// All skill domains
const DOMAINS: Array<SkillDomain> = [
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

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Skill Tree</h2>

      {/* Domain tabs with interleaved content */}
      <div role="tablist" className="tabs tabs-box">
        {DOMAINS.map((domain) => {
          const isActive = activeDomain === domain;
          const skills = skillStore.skillsByDomain(domain);
          const domainXP = skillStore.domainXP.get(domain) ?? 0;

          return (
            <Fragment key={domain}>
              <button
                role="tab"
                className={`tab ${isActive ? 'tab-active' : ''}`}
                onClick={() => setActiveDomain(domain)}
              >
                {DOMAIN_LABELS[domain]}
                <span className="badge badge-sm ml-2">{domainXP} XP</span>
              </button>
              <div className="tab-content bg-base-100 border-base-300 h-100 overflow-y-auto p-4">
                {/* Domain XP display */}
                <div className="mb-4 text-lg">
                  <span className="font-semibold">
                    {DOMAIN_LABELS[domain]} XP:
                  </span>
                  <span className="text-primary ml-2 font-bold">
                    {domainXP}
                  </span>
                </div>

                {/* Skill grid */}
                {skills.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {skills.map((skill) => (
                      <SkillCard key={skill.id} skillId={skill.id} />
                    ))}
                  </div>
                ) : (
                  <div className="text-base-content/50 py-8 text-center">
                    No skills in this domain yet
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
});

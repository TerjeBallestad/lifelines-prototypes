import { observer } from 'mobx-react-lite';
import { ResourceGauge } from './ResourceGauge';
import type { Resources } from '../entities/types';

interface ResourcePanelProps {
  resources: Resources;
}

interface ResourceConfig {
  key: keyof Resources;
  label: string;
  inverted?: boolean;
}

const RESOURCE_CONFIG: ResourceConfig[] = [
  { key: 'energy', label: 'Energy' },
  { key: 'socialBattery', label: 'Social Battery' },
  { key: 'stress', label: 'Stress', inverted: true },
  { key: 'overskudd', label: 'Overskudd' },
  { key: 'mood', label: 'Mood' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'security', label: 'Security' },
  { key: 'focus', label: 'Focus' },
  { key: 'nutrition', label: 'Nutrition' },
];

export const ResourcePanel = observer(function ResourcePanel({
  resources,
}: ResourcePanelProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {RESOURCE_CONFIG.map(({ key, label, inverted }) => (
        <ResourceGauge
          key={key}
          value={resources[key]}
          label={label}
          inverted={inverted}
          size="md"
        />
      ))}
    </div>
  );
});

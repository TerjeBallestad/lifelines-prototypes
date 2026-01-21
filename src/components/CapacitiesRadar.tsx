import { observer } from 'mobx-react-lite';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { Capacities } from '../entities/types';

interface CapacitiesRadarProps {
  capacities: Capacities;
}

export const CapacitiesRadar = observer(function CapacitiesRadar({
  capacities,
}: CapacitiesRadarProps) {
  // 6 vertices for hexagon - shortened labels for readability
  const data = [
    { trait: 'Divergent', value: capacities.divergentThinking },
    { trait: 'Convergent', value: capacities.convergentThinking },
    { trait: 'Memory', value: capacities.workingMemory },
    { trait: 'Attention', value: capacities.attentionSpan },
    { trait: 'Speed', value: capacities.processingSpeed },
    { trait: 'Regulation', value: capacities.emotionalRegulation },
  ];

  return (
    <div className="w-full h-48 text-accent">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--color-primary)" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fontSize: 10, fill: 'var(--color-base-content)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});

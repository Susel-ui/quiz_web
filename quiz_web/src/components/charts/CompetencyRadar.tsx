import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { CompetencyScore } from '../../types/api';
import { GAP_SEVERITY_CONFIG } from '../../lib/utils';
import { CHART_ANIMATION } from '../../animations/motionConfig';

interface CompetencyRadarProps {
  scores: CompetencyScore[];
  /** Label for the current level series */
  currentLabel?: string;
  /** Label for the required level series */
  requiredLabel?: string;
  height?: number;
}

interface RadarDataPoint {
  domain:   string;
  current:  number;
  required: number;
  severity: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RadarDataPoint; value: number; dataKey: string }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = GAP_SEVERITY_CONFIG[d.severity as keyof typeof GAP_SEVERITY_CONFIG];
  return (
    <div
      className="bg-white dark:bg-slate-800 border border-surface-border dark:border-slate-700 rounded-lg p-3 shadow-card-md text-body-sm"
      role="tooltip"
    >
      <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{d.domain}</p>
      <p className="text-slate-600 dark:text-slate-300">Current: <span className="font-medium">{d.current}%</span></p>
      <p className="text-slate-600 dark:text-slate-300">Required: <span className="font-medium">{d.required}%</span></p>
      <p className={`mt-1 font-medium`} style={{ color: cfg.color }}>
        {cfg.icon} {cfg.label}
      </p>
    </div>
  );
}

export default function CompetencyRadar({
  scores,
  currentLabel  = 'Current Level',
  requiredLabel = 'Required Level',
  height        = 340,
}: CompetencyRadarProps) {
  const data: RadarDataPoint[] = scores.map((s) => ({
    domain:   s.domain.name,
    current:  s.currentLevel,
    required: s.requiredLevel,
    severity: s.severity,
  }));

  return (
    <div
      role="img"
      aria-label={`Competency radar chart comparing current vs required levels across ${scores.length} domains`}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94A3B8', fontSize: 10 }}
          />
          <Radar
            name={requiredLabel}
            dataKey="required"
            stroke="#6B7280"
            fill="#6B7280"
            fillOpacity={0.12}
            strokeDasharray="5 3"
            animationBegin={CHART_ANIMATION.begin}
            animationDuration={CHART_ANIMATION.duration}
            animationEasing={CHART_ANIMATION.easing}
          />
          <Radar
            name={currentLabel}
            dataKey="current"
            stroke="#1A3A6B"
            fill="#1A3A6B"
            fillOpacity={0.35}
            animationBegin={CHART_ANIMATION.begin + 100}
            animationDuration={CHART_ANIMATION.duration}
            animationEasing={CHART_ANIMATION.easing}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', paddingTop: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

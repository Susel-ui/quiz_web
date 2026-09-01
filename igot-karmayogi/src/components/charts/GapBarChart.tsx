import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, LabelList,
} from 'recharts';
import type { CompetencyScore } from '../../types/api';
import { GAP_SEVERITY_CONFIG } from '../../lib/utils';
import { CHART_ANIMATION } from '../../animations/motionConfig';

interface GapBarChartProps {
  scores:  CompetencyScore[];
  height?: number;
}

export default function GapBarChart({ scores, height = 300 }: GapBarChartProps) {
  const data = [...scores]
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .map((s) => ({
      name:     s.domain.name.length > 14 ? s.domain.name.slice(0, 13) + '…' : s.domain.name,
      fullName: s.domain.name,
      gap:      s.gapPercent,
      severity: s.severity,
      color:    GAP_SEVERITY_CONFIG[s.severity].color,
    }));

  return (
    <div
      role="img"
      aria-label={`Bar chart showing competency gap percentages. Largest gap: ${data[0]?.fullName} at ${data[0]?.gap}%`}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 4 }} layout="vertical">
          <CartesianGrid horizontal={false} stroke="#F1F5F9" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 11, fill: '#64748B' }}
          />
          <Tooltip
            formatter={(value: number, _name: string, props: { payload?: { fullName?: string; severity?: string } }) => [
              `${value}% gap`,
              props?.payload?.fullName ?? '',
            ]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              fontFamily: 'Inter',
            }}
          />
          <Bar
            dataKey="gap"
            radius={[0, 4, 4, 0]}
            animationBegin={CHART_ANIMATION.begin}
            animationDuration={CHART_ANIMATION.duration}
            animationEasing={CHART_ANIMATION.easing}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
            <LabelList
              dataKey="gap"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

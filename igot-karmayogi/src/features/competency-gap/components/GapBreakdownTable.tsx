import { useState } from 'react';
import type { CompetencyScore } from '../../../types/api';
import Badge from '../../../components/ui/Badge';
import { GAP_SEVERITY_CONFIG } from '../../../lib/utils';

interface GapBreakdownTableProps {
  scores:   CompetencyScore[];
  filter?:  string | null;
}

export default function GapBreakdownTable({ scores, filter }: GapBreakdownTableProps) {
  const [sortField, setSortField] = useState<'gap' | 'current' | 'required'>('gap');
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = scores
    .filter((s) => !filter || s.domain.category === filter)
    .sort((a, b) => {
      const va = a[sortField === 'gap' ? 'gapPercent' : sortField === 'current' ? 'currentLevel' : 'requiredLevel'];
      const vb = b[sortField === 'gap' ? 'gapPercent' : sortField === 'current' ? 'currentLevel' : 'requiredLevel'];
      return sortDir === 'desc' ? vb - va : va - vb;
    });

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span aria-hidden="true" className="ml-1 text-slate-400">
      {sortField === field ? (sortDir === 'desc' ? '↓' : '↑') : '⇅'}
    </span>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border dark:border-surface-dark-border">
      <table className="w-full text-body-sm" aria-label="Competency gap breakdown table">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
              Domain
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
              Category
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
              onClick={() => handleSort('current')}
              aria-sort={sortField === 'current' ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}
            >
              Current <SortIcon field="current" />
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
              onClick={() => handleSort('required')}
              aria-sort={sortField === 'required' ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}
            >
              Required <SortIcon field="required" />
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
              onClick={() => handleSort('gap')}
              aria-sort={sortField === 'gap' ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}
            >
              Gap <SortIcon field="gap" />
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
          {filtered.map((score) => {
            const cfg = GAP_SEVERITY_CONFIG[score.severity];
            return (
              <tr
                key={score.domain.id}
                className="bg-white dark:bg-surface-dark-card hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                  {score.domain.name}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {score.domain.category}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {score.currentLevel}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {score.requiredLevel}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: cfg.color }}>
                  {score.gapPercent}%
                </td>
                <td className="px-4 py-3">
                  <Badge variant={score.severity} icon={cfg.icon}>{cfg.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

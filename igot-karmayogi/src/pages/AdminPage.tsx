import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { fadeInUp, staggerContainer } from '../animations/motionConfig';

const MOCK_ORG_HEATMAP = [
  { dept: 'Ministry of Finance', avgScore: 74, criticalGaps: 12, totalEmployees: 450 },
  { dept: 'Ministry of Electronics & IT', avgScore: 82, criticalGaps: 5, totalEmployees: 320 },
  { dept: 'Department of Personnel & Training', avgScore: 68, criticalGaps: 24, totalEmployees: 610 },
  { dept: 'Ministry of External Affairs', avgScore: 79, criticalGaps: 8, totalEmployees: 280 },
  { dept: 'Ministry of Health & Family Welfare', avgScore: 61, criticalGaps: 38, totalEmployees: 890 },
];

const MOCK_PENDING_QUIZZES = [
  {
    id: 'pq-1',
    title: 'Public Procurement & GFR 2017 Compliance',
    creator: 'Automated Ingestion (GFR_2017_Manual.pdf)',
    questionsCount: 15,
    difficulty: 'medium',
    date: '2026-08-24',
    status: 'Pending Review',
  },
  {
    id: 'pq-2',
    title: 'Cybersecurity Hygiene for Government Systems',
    creator: 'Automated Ingestion (CERT-In_Guidelines.pdf)',
    questionsCount: 20,
    difficulty: 'hard',
    date: '2026-08-23',
    status: 'Pending Review',
  },
];

export default function AdminPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'heatmap' | 'quizzes'>('heatmap');
  const [quizzes, setQuizzes] = useState(MOCK_PENDING_QUIZZES);

  const handleApprove = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading-1 text-slate-800 dark:text-slate-100">Administrative Portal</h1>
            <Badge variant="primary">Admin</Badge>
          </div>
          <p className="text-body text-slate-500 mt-1">
            Organization-wide competency telemetry, curriculum approval, and governance controls.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-surface-dark-card p-2 rounded-xl border border-surface-border dark:border-surface-dark-border">
          <span className="text-caption text-slate-500 font-medium">Demo Role:</span>
          <Button
            size="sm"
            variant={user?.role === 'admin' ? 'primary' : 'ghost'}
            onClick={() => user && setUser({ ...user, role: 'admin' })}
          >
            Admin
          </Button>
          <Button
            size="sm"
            variant={user?.role === 'learner' ? 'primary' : 'ghost'}
            onClick={() => user && setUser({ ...user, role: 'learner' })}
          >
            Learner
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border dark:border-surface-dark-border gap-6">
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`pb-3 text-body-sm font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'heatmap'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Org-Wide Competency Heatmap
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 text-body-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          AI Question Bank Ingestion
          {quizzes.length > 0 && (
            <span className="px-2 py-0.2 text-caption rounded-full bg-accent-100 text-accent-700 font-bold">
              {quizzes.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'heatmap' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <span className="text-caption text-slate-500 uppercase font-medium">Total Assessed Civil Servants</span>
              <p className="text-display-2 font-bold text-primary-600 mt-1">2,550</p>
              <p className="text-caption text-slate-500 mt-1">Across 5 Ministries & Departments</p>
            </Card>
            <Card className="p-5">
              <span className="text-caption text-slate-500 uppercase font-medium">Org Overall Readiness</span>
              <p className="text-display-2 font-bold text-gap-warning mt-1">71.4%</p>
              <p className="text-caption text-slate-500 mt-1">+4.2% increase from previous quarter</p>
            </Card>
            <Card className="p-5">
              <span className="text-caption text-slate-500 uppercase font-medium">Total Critical Gaps</span>
              <p className="text-display-2 font-bold text-gap-critical mt-1">87</p>
              <p className="text-caption text-slate-500 mt-1">Requires urgent targeted training</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-heading-3 text-slate-800 dark:text-slate-100 mb-4">Department Competency Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm" aria-label="Department competency overview">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Department / Ministry</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Officers</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Avg Readiness</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Critical Gaps</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {MOCK_ORG_HEATMAP.map((d) => (
                    <tr key={d.dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-100">{d.dept}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{d.totalEmployees}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-100">{d.avgScore}%</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gap-critical">{d.criticalGaps}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={d.avgScore >= 80 ? 'ok' : d.avgScore >= 70 ? 'warning' : 'critical'}>
                          {d.avgScore >= 80 ? 'Optimal' : d.avgScore >= 70 ? 'Moderate' : 'Needs Action'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'quizzes' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-heading-3 text-slate-800 dark:text-slate-100">Pending AI Generated Quizzes for Review</h2>
          {quizzes.length === 0 ? (
            <p className="text-body text-slate-500 py-8 text-center">No quizzes pending moderation. All ingested questions approved.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-surface-border dark:border-surface-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-body font-semibold text-slate-800 dark:text-slate-100">{q.title}</h3>
                    <p className="text-caption text-slate-500 mt-0.5">
                      Source: {q.creator} · {q.questionsCount} MCQs · Generated on {q.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={q.difficulty === 'hard' ? 'error' : 'warning'}>{q.difficulty}</Badge>
                    <Button size="sm" variant="outline">
                      Inspect
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => handleApprove(q.id)}>
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </motion.div>
  );
}

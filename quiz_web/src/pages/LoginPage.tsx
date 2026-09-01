import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/apiClient';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import type { User, AuthTokens } from '../types/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('priya.sharma@gov.in');
  const [role, setRole] = useState<'learner' | 'admin'>('learner');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Direct call to mock auth endpoint
      const { data } = await apiClient.post<{ user: User; accessToken: string; refreshToken: string; expiresAt: number }>('/auth/login', { email, role });
      login({ ...data.user, role, email }, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      });
      navigate('/dashboard');
    } catch {
      // Fallback
      login({
        id: 'user-001',
        name: role === 'admin' ? 'Rajesh Kumar (Admin)' : 'Priya Sharma',
        email,
        role,
        department: 'Ministry of Finance',
      }, {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 shadow-card-lg">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-gradient">iGOT</span>
          <h1 className="text-heading-2 text-slate-800 dark:text-slate-100 mt-1">Sign In to Platform</h1>
          <p className="text-body-sm text-slate-500 mt-1">Access AI-Enabled Competency Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">
              Official Email ID (.gov.in / .nic.in)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-surface-border dark:border-surface-dark-border rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-accent-500"
              required
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="role">
              Select Demo Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'learner' | 'admin')}
              className="w-full px-3 py-2 border border-surface-border dark:border-surface-dark-border rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-accent-500"
            >
              <option value="learner">Learner (Civil Servant / Officer)</option>
              <option value="admin">Administrator / Ministry Evaluator</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-6" loading={loading}>
            Continue to Dashboard →
          </Button>
        </form>
      </Card>
    </div>
  );
}

import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import AppShell from './components/layout/AppShell';
import Spinner from './components/ui/Spinner';
import IntroAnimation from './animations/IntroAnimation';
import { useAuthStore } from './store/authStore';

// Code-split routes for optimal performance (>90 Lighthouse target)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GapAnalysisPage = lazy(() => import('./pages/GapAnalysisPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const QuizGeneratorPage = lazy(() => import('./pages/QuizGeneratorPage'));
const QuizAttemptPage = lazy(() => import('./pages/QuizAttemptPage'));
const QuizResultsPage = lazy(() => import('./pages/QuizResultsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" className="text-primary-600" label="Loading page..." />
    </div>
  );
}

// Role-based protection helper
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) {
  const { user } = useAuthStore();
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('igot_intro_played');
  });

  const { user, login } = useAuthStore();

  // Initialize a default mock user session if none exists
  useEffect(() => {
    if (!user) {
      login(
        {
          id: 'user-001',
          name: 'Priya Sharma',
          email: 'priya.sharma@gov.in',
          role: 'learner',
          department: 'Ministry of Finance',
        },
        {
          accessToken: 'mock-initial-token',
          refreshToken: 'mock-initial-refresh',
          expiresAt: Date.now() + 86400000,
        }
      );
    }
  }, [user, login]);

  return (
    <QueryClientProvider client={queryClient}>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Authenticated / AppShell routes */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/gap-analysis" element={<GapAnalysisPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
              <Route path="/quiz/:id" element={<QuizAttemptPage />} />
              <Route path="/quiz/:id/results" element={<QuizResultsPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

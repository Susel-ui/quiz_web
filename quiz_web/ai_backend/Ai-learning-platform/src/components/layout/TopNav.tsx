import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function TopNav() {
  const { sidebarOpen, setSidebar, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className="h-16 bg-white dark:bg-surface-dark-card border-b border-surface-border dark:border-surface-dark-border px-4 flex items-center gap-4 sticky top-0 z-30"
      role="banner"
    >
      {/* Sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebar(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Open sidebar"
        >
          <span aria-hidden="true" className="block w-5 h-5 text-center leading-5">☰</span>
        </button>
      )}

      {/* Breadcrumb / Page title slot — filled by pages via context if needed */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>

        {/* User menu (simplified — would use a popover in full build) */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-body-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-caption text-slate-500 capitalize">{user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-caption font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => navigate('/auth/login')}>Sign in</Button>
        )}
      </div>
    </header>
  );
}

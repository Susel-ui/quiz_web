import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

interface NavItem {
  path:  string;
  label: string;
  icon:  string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',      label: 'Dashboard',       icon: '⬡' },
  { path: '/gap-analysis',   label: 'Gap Analysis',    icon: '◎' },
  { path: '/recommendations',label: 'Courses',         icon: '◈' },
  { path: '/quiz-generator', label: 'Quiz Generator',  icon: '⊞' },
  { path: '/admin',          label: 'Admin',           icon: '⚙', roles: ['admin'] },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebar } = useUIStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-primary-600 text-white shadow-card-lg"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 h-16 border-b border-primary-700 shrink-0">
            <span className="text-accent-400 text-xl" aria-hidden="true">⬡</span>
            <div>
              <span className="font-bold text-white text-body leading-tight block">iGOT</span>
              <span className="text-primary-300 text-caption leading-tight block">Karmayogi</span>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-4 border-b border-primary-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white font-semibold text-body-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-caption text-primary-300 truncate">{user.department}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Primary navigation">
            {visibleItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-primary-200 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <span className="text-base w-5 text-center" aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Collapse button */}
          <button
            onClick={() => setSidebar(false)}
            className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-primary-300 hover:text-white hover:bg-white/10 text-body-sm transition-colors"
            aria-label="Collapse sidebar"
          >
            <span aria-hidden="true">←</span> Collapse
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

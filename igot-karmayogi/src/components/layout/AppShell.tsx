import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useUIStore } from '../../store/uiStore';
import { pageTransition } from '../../animations/motionConfig';

export default function AppShell() {
  const { sidebarOpen } = useUIStore();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      <Sidebar />

      {/* Main content area — offset by sidebar width when open */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-250 ease-out"
        style={{ marginLeft: sidebarOpen ? '256px' : '0' }}
      >
        <TopNav />

        <main
          className="flex-1 page-container py-6"
          id="main-content"
          role="main"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile overlay to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => useUIStore.getState().setSidebar(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

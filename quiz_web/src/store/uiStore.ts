import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface Toast {
  id:      string;
  type:    'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface UIState {
  theme:         Theme;
  sidebarOpen:   boolean;
  toasts:        Toast[];
  // Actions
  toggleTheme:   () => void;
  setTheme:      (t: Theme) => void;
  setSidebar:    (open: boolean) => void;
  addToast:      (toast: Omit<Toast, 'id'>) => void;
  removeToast:   (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme:       'light',
      sidebarOpen: true,
      toasts:      [],

      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          // Apply class to <html> immediately
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),

      setTheme: (t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
        set({ theme: t });
      },

      setSidebar: (open) => set({ sidebarOpen: open }),

      addToast: (toast) =>
        set((s) => ({
          toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
        })),

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name:        'igot_ui',
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        // Sync CSS class on hydration
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    },
  ),
);

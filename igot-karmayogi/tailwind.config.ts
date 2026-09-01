import type { Config } from 'tailwindcss';

// Design tokens — single source of truth for all visual primitives.
// Components reference these by name (e.g. bg-primary-600), never raw hex.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand — iGOT deep navy palette
        primary: {
          50:  '#EEF3FB',
          100: '#D5E1F5',
          200: '#AABFEB',
          300: '#7F9EE1',
          400: '#547CD7',
          500: '#2A5BC7',
          600: '#1A3A6B', // base brand color
          700: '#142D53',
          800: '#0E203D',
          900: '#091428',
        },
        // Accent — sky/digital blue
        accent: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // base accent
          600: '#0284C7',
          700: '#0369A1',
        },
        // Semantic — competency gap severity
        gap: {
          critical: '#DC2626',  // red-600  — gap > 60%
          warning:  '#D97706',  // amber-600 — gap 30–60%
          ok:       '#16A34A',  // green-600 — gap < 30%
          neutral:  '#6B7280',  // gray-500
        },
        // Surface / background tokens
        surface: {
          light:  '#F8FAFC',
          card:   '#FFFFFF',
          border: '#E2E8F0',
          dark:   {
            DEFAULT: '#0F172A',
            card:    '#1E293B',
            border:  '#334155',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Type scale — 4 headline levels + body + caption
        'display-1': ['3rem',    { lineHeight: '1.1', fontWeight: '700' }],
        'display-2': ['2.25rem', { lineHeight: '1.15', fontWeight: '700' }],
        'heading-1': ['1.875rem',{ lineHeight: '1.2', fontWeight: '600' }],
        'heading-2': ['1.5rem',  { lineHeight: '1.25', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg':   ['1.125rem',{ lineHeight: '1.6' }],
        'body':      ['1rem',    { lineHeight: '1.6' }],
        'body-sm':   ['0.875rem',{ lineHeight: '1.5' }],
        'caption':   ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        // Extend with semantic spacing tokens (layout-level only)
        'layout-xs': '1rem',
        'layout-sm': '1.5rem',
        'layout-md': '2rem',
        'layout-lg': '3rem',
        'layout-xl': '4rem',
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'card-sm': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'glow-accent': '0 0 20px 4px rgb(14 165 233 / 0.3)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        // Hero gradient — deep navy to midnight slate
        'hero-gradient': 'linear-gradient(135deg, #091428 0%, #1A3A6B 40%, #0E1F3D 70%, #0F172A 100%)',
        // Subtle mesh for backgrounds
        'grid-pattern': `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.05) 1px, transparent 0)`,
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-md': '40px 40px',
      },
    },
  },
  plugins: [],
};

export default config;

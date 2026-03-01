/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'bg-base': '#0f1117',
        'bg-surface': '#1a1d27',
        'bg-card': '#1e2130',
        'accent': '#6366f1',
        'accent-hover': '#4f46e5',
        'expense': '#ef4444',
        'investment': '#10b981',
        'emi': '#f59e0b',
        'saving': '#8b5cf6',
        'text-primary': '#f1f5f9',
        'text-muted': '#94a3b8',
      },
    },
  },
  plugins: [],
}

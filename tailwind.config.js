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
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        'bg-base': '#09090b',
        'bg-surface': '#111113',
        'bg-card': '#18181b',
        'accent': '#a78bfa',
        'accent-hover': '#8b5cf6',
        'expense': '#fb7185',
        'investment': '#34d399',
        'emi': '#fbbf24',
        'saving': '#c084fc',
        'text-primary': '#fafaf9',
        'text-muted': '#71717a',
      },
    },
  },
  plugins: [],
}

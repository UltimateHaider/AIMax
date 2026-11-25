/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/.vitepress/theme/**/*.{vue,js,ts,jsx,tsx}',
    './docs/.vitepress/*.{js,ts,mts}',
    './docs/*.md',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf2ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#3553ff', // Primary requested
          600: '#2b43d6',
          700: '#2133a8',
          800: '#19277d',
          900: '#111b54',
        },
        dark: {
          bg: '#0f1117',      // Dark background requested
          surface: '#161922', // Surface
          card: '#1a1d27',
          border: '#272b3a',
          muted: '#94a3b8',
        },
        light: {
          bg: '#fafaf5',      // Light background requested
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e5e7eb',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber highlight requested
          hover: '#d97706',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

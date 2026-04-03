import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0f0f0f',
          secondary: '#171717',
          tertiary: '#1f1f1f',
        },
        surface: {
          DEFAULT: '#242424',
          hover: '#2e2e2e',
          active: '#383838',
        },
        accent: {
          DEFAULT: '#e2b714',
          hover: '#f0ca2d',
          dim: '#e2b71433',
        },
        text: {
          primary: '#d1d0c5',
          secondary: '#646669',
          tertiary: '#3a3a3c',
          error: '#ca4754',
          success: '#4caf79',
        },
      },
      fontFamily: {
        mono: ['var(--font-roboto-mono)', 'Roboto Mono', 'monospace'],
        sans: ['var(--font-lexend)', 'Lexend', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-ring': 'pulseRing 1.5s ease infinite',
        'caret-blink': 'caretBlink 1s ease infinite',
        'progress-fill': 'progressFill 0.3s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(226,183,20,0.4)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(226,183,20,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(226,183,20,0)' },
        },
        caretBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

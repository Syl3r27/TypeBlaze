import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#2A2A2A',
          secondary: '#333333',
          tertiary: '#3A3A3A',
        },
        surface: {
          DEFAULT: '#333333',
          hover: '#3F3F3F',
          active: '#4A4A4A',
        },
        accent: {
          DEFAULT: '#FFB090',
          hover: '#FFC0A5',
          dim: '#FFB09044',
        },
        accent2: {
          DEFAULT: '#CA5995',
          hover: '#D4709A',
        },
        text: {
          primary: '#FFF1D3',
          secondary: '#D4B5A0',
          tertiary: '#A89080',
          error: '#CA5995',
          success: '#FFB090',
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
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(90,143,181,0.4)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(90,143,181,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(90,143,181,0)' },
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

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
          DEFAULT: '#1C1C2E',
          secondary: '#16162A',
          tertiary: '#222240',
        },
        surface: {
          DEFAULT: '#2A2A4A',
          hover: '#33335A',
          active: '#3D3D6A',
        },
        accent: {
          DEFAULT: '#FF2D95',
          hover: '#FF5CB0',
          dim: '#FF2D9544',
        },
        accent2: {
          DEFAULT: '#00E5FF',
          hover: '#33ECFF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#C0A0FF',
          tertiary: '#6E6E88',
          error: '#FF3333',
          success: '#39FF14',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['var(--font-roboto-mono)', 'Roboto Mono', 'monospace'],
        sans: ['var(--font-lexend)', 'Lexend', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-ring': 'pulseRing 1.5s ease infinite',
        'caret-blink': 'caretBlink 1s ease infinite',
        'progress-fill': 'progressFill 0.3s ease forwards',
        'pixel-float': 'pixelFloat 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
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
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0,229,255,0.4)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(0,229,255,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(0,229,255,0)' },
        },
        caretBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress)' },
        },
        pixelFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px #000000',
        'brutal-sm': '3px 3px 0px #000000',
        'brutal-lg': '6px 6px 0px #000000',
        'brutal-accent': '4px 4px 0px #FF2D95',
        'brutal-cyan': '4px 4px 0px #00E5FF',
        'neon-pink': '0 0 20px rgba(255,45,149,0.3), 0 0 40px rgba(255,45,149,0.1)',
        'neon-cyan': '0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;

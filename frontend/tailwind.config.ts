import type { Config } from 'tailwindcss';

// ──────────────────────────────────────────────────────────────
// SweetRedeem.club — Design Tokens V3
// Mirrors CSS custom properties in globals.css
// ──────────────────────────────────────────────────────────────
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Colour palette ─────────────────────────────────────
      colors: {
        canvas:  '#FFFFFF',   // white page background — matches Figma
        surface: '#FFFFFF',   // white card surface
        dark:    '#121212',   // CTA / overlay dark
        border:  '#EAEAEA',   // subtle dividers

        text: {
          primary:   '#000000',
          secondary: '#666666',
          ondark:    '#FFFFFF',
        },

        gold: {
          DEFAULT: '#C5A059',
          bg:      '#F4ECD8',
          dark:    '#8A6A00',
        },

        green: {
          DEFAULT: '#00C885',
          dim:     '#00A86B',
          muted:   'rgba(0,200,133,0.08)',
          border:  'rgba(0,200,133,0.2)',
        },

        warn:  '#E08A00',
        error: '#E03E3E',

        // Value tier aliases (used in badge / CPP logic)
        value: {
          elite: '#00C885',
          high:  '#00A86B',
          mid:   '#E08A00',
          low:   '#E08A00',
          poor:  '#E03E3E',
        },
      },

      // ── Typography ─────────────────────────────────────────
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'hero':       ['2.625rem', { lineHeight: '1.1',  fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-xl': ['2rem',     { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['1.5rem',   { lineHeight: '1.2',  fontWeight: '700', letterSpacing: '-0.01em' }],
      },

      // ── Shadows ─────────────────────────────────────────────
      boxShadow: {
        card:  '0 4px 12px rgba(0,0,0,0.06)',
        sheet: '0 -8px 40px rgba(0,0,0,0.12)',
        gold:  '0 2px 12px rgba(197,160,89,0.2)',
      },

      // ── Border radius ────────────────────────────────────────
      borderRadius: {
        card: '16px',
        btn:  '12px',
        pill: '9999px',
      },

      // ── Animations ───────────────────────────────────────────
      animation: {
        'fade-in':  'fadeIn 0.25s ease forwards',
        'slide-up': 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards',
        'shimmer':  'shimmer 1.6s infinite',
      },

      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

/**
 * Two design systems live side by side:
 *  - `brand.*` / `ink.*` / `steel.*`  -> PDA BLISS corporate site
 *  - `sky.*` / `navy.*` / `ivory` ...  -> the private A&I experience
 * Nothing is shared except spacing, radii and easing so the two never bleed.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F1FBF5',
          100: '#DBF5E5',
          200: '#B2E9C8',
          300: '#7FD9A6',
          400: '#35C96F',
          500: '#1DAA61',
          600: '#148A4D',
          700: '#0B5137',
          800: '#063B2A',
          900: '#04261B'
        },
        ink: {
          DEFAULT: '#0A0F0C',
          soft: '#121A15',
          muted: '#1C261F'
        },
        steel: {
          50: '#F7F9F7',
          100: '#EFF3F0',
          200: '#E9EEEA',
          300: '#CBD5CE',
          400: '#9AA89F',
          500: '#6E7E73',
          600: '#4E5C53',
          700: '#38443C',
          800: '#232C27',
          900: '#141A16'
        },
        /**
         * A&I palette. `sky.400` (#7EC8FF) is the primary and `sky.100`
         * (#DCEFFF) the secondary; `navy.700` (#17324D) is the base navy the
         * upper sky is graded from. Nothing here is shared with the PDA BLISS
         * scale above.
         */
        sky: {
          50: '#F4FAFF',
          100: '#DCEFFF',
          200: '#C4E4FF',
          300: '#A3D6FF',
          400: '#7EC8FF',
          500: '#5FAFEE',
          600: '#4491D2',
          700: '#316FA6',
          800: '#254F79',
          900: '#1B3A59'
        },
        navy: {
          400: '#3A6B99',
          500: '#27527C',
          600: '#1E4164',
          700: '#17324D',
          800: '#112538',
          900: '#0C1B29'
        },
        ivory: '#FFFFFF',
        cream: '#F7F1E8',
        champagne: '#EBD9BC',
        glow: '#CFE8FF'
      },
      fontFamily: {
        // Thai-first: IBM Plex Sans Thai leads so Thai glyphs never fall back.
        sans: ['IBM Plex Sans Thai', 'Inter', 'system-ui', 'sans-serif'],
        thai: ['IBM Plex Sans Thai', 'Inter', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        display: ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        headline: ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        title: ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        lead: ['clamp(1rem, 1.1vw, 1.1875rem)', { lineHeight: '1.7' }],
        /**
         * ── CORPORATE DISPLAY SCALE ──────────────────────────────────────────
         * Deliberately capped. An earlier pass ran `giant` up to 11rem / 11vw,
         * which put the homepage H1 at 158px and made it 1007px tall at
         * 1440x900 — taller than the viewport, pushing the product visual
         * entirely below the fold. Typography now supports the product shots
         * instead of replacing them.
         *
         * Ceilings: hero 96px, large section 72px, normal section 52px.
         *
         * Thai needs more vertical room than Latin (ascenders plus tone marks
         * stack above the x-height), so line-heights stay at 1.06-1.25 and
         * tracking stays shallow — tight negative tracking collapses vowel
         * marks into their consonants.
         * ─────────────────────────────────────────────────────────────────────
         */
        giant: ['clamp(3rem, 6vw, 6rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        mega: ['clamp(2.625rem, 4.5vw, 4.5rem)', { lineHeight: '1.12', letterSpacing: '-0.018em' }],
        statement: ['clamp(2rem, 3vw, 3.25rem)', { lineHeight: '1.22', letterSpacing: '-0.015em' }],
        /** Marquee is an accent strip, not content: 36px to 64px. */
        marquee: ['clamp(2.25rem, 4vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        /** Section numerals, used as quiet structure rather than as a visual. */
        numeral: ['clamp(1.75rem, 3vw, 3rem)', { lineHeight: '1', letterSpacing: '-0.03em' }]
      },
      spacing: {
        /** Tightened from clamp(5rem,10vw,9rem): the old rhythm left big voids. */
        section: 'clamp(3.75rem, 6vw, 6.5rem)',
        gutter: 'clamp(1.25rem, 4vw, 3rem)',
        /** Floating-contact dock: 52px, a comfortable thumb target. */
        13: '3.25rem'
      },
      borderRadius: {
        xs: '0.375rem',
        card: '1.25rem',
        panel: '1.75rem',
        pill: '999px'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(6,59,42,0.05), 0 8px 24px -12px rgba(6,59,42,0.14)',
        lift: '0 24px 60px -28px rgba(6,59,42,0.32)',
        'lift-lg': '0 40px 90px -40px rgba(6,59,42,0.45)',
        ring: '0 0 0 1px rgba(6,59,42,0.07)',
        'brand-glow': '0 0 48px -12px rgba(29,170,97,0.55)',
        'brand-inset': 'inset 0 1px 0 rgba(255,255,255,0.08)',
        // A&I glows, all built from the primary #7EC8FF.
        glow: '0 0 60px -12px rgba(126,200,255,0.45)',
        'glow-sm': '0 0 24px -8px rgba(126,200,255,0.5)',
        'glow-lg': '0 0 120px -20px rgba(126,200,255,0.55)',
        'ai-card': '0 20px 60px -30px rgba(12,27,41,0.9), 0 0 0 1px rgba(220,239,255,0.12)'
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        fast: '160ms',
        base: '280ms',
        slow: '520ms',
        cinematic: '1200ms'
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 90%)',
        'brand-sheen':
          'linear-gradient(120deg, rgba(29,170,97,0.14) 0%, rgba(29,170,97,0) 45%, rgba(29,170,97,0.1) 100%)'
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          to: { opacity: '1', transform: 'none' }
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.85' }
        },
        // Slow "breathing" used by the A&I mark and glass plates.
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.035)' }
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%,-3%,0) scale(1.08)' },
          '66%': { transform: 'translate3d(-3%,2%,0) scale(0.96)' }
        },
        'beam-sweep': {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' }
        },
        'dash-flow': {
          to: { strokeDashoffset: '-1000' }
        },
        /** Corporate: horizontal marquee travel. */
        'marquee-x': {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' }
        },
        /** Corporate: data travelling along a connection path. */
        'data-run': {
          from: { strokeDashoffset: '120' },
          to: { strokeDashoffset: '0' }
        },
        /** Corporate: status light. */
        'status-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' }
        },
        /** Corporate: slow vertical drift for hero planes. */
        'plane-float': {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' }
        },
        /** Corporate: green beam travelling across a dark surface. */
        'beam-x': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'sweep-ring': {
          '0%': { transform: 'rotate(0deg)', opacity: '0' },
          '12%': { opacity: '1' },
          '46%': { opacity: '1' },
          '60%, 100%': { transform: 'rotate(360deg)', opacity: '0' }
        }
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.16,1,0.3,1) both',
        drift: 'drift 9s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'spin-slow': 'spin-slow 42s linear infinite',
        'spin-slower': 'spin-slow 90s linear infinite',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        breathe: 'breathe 7s ease-in-out infinite',
        'aurora-drift': 'aurora-drift 34s ease-in-out infinite',
        'beam-sweep': 'beam-sweep 6s ease-in-out infinite',
        'dash-flow': 'dash-flow 18s linear infinite',
        'sweep-ring': 'sweep-ring 11s cubic-bezier(0.45,0,0.55,1) infinite',
        'marquee-x': 'marquee-x 38s linear infinite',
        'marquee-x-slow': 'marquee-x 64s linear infinite',
        'data-run': 'data-run 2.4s linear infinite',
        'status-blink': 'status-blink 2.8s ease-in-out infinite',
        'plane-float': 'plane-float 7s ease-in-out infinite',
        'beam-x': 'beam-x 7s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;

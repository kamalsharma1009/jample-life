/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // ── Jample Life Brand ──────────────────────────────────
        jample: {
          dark:            '#0f172a',
          burgundy:        '#853953',
          purple:          '#612D53',
          light:           '#f8fafc',
          'burgundy-light':'#A04D6A',
          'purple-light':  '#7A3D6A',
          'burgundy-dark': '#6B2D42',
          'purple-dark':   '#4A1F3E',
        },
        // Full burgundy scale
        burgundy: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d2da',
          300: '#f4adb9',
          400: '#ec7f93',
          500: '#e05270',
          600: '#853953',
          700: '#6b2d42',
          800: '#522232',
          900: '#3d1825',
          950: '#260b14',
        },
        // Full dark-purple scale
        darkPurple: {
          50:  '#fbf4f9',
          100: '#f5e7f2',
          200: '#ecd0e6',
          300: '#dfadd3',
          400: '#ca7fba',
          500: '#b0599d',
          600: '#612D53',
          700: '#4a1f3e',
          800: '#38162f',
          900: '#2D0A1E',
          950: '#1c0412',
        },

        // ── shadcn/ui CSS variable tokens ──────────────────────
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },

        // ── Status colors ──────────────────────────────────────
        status: {
          active:    '#16a34a',
          inactive:  '#94a3b8',
          pending:   '#d97706',
          blocked:   '#dc2626',
          suspended: '#ea580c',
          verified:  '#2563eb',
          rejected:  '#dc2626',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
      },

      backgroundImage: {
        'jample-gradient':       'linear-gradient(135deg, #853953 0%, #612D53 100%)',
        'jample-gradient-light': 'linear-gradient(135deg, #A04D6A 0%, #7A3D6A 100%)',
        'jample-gradient-dark':  'linear-gradient(135deg, #6B2D42 0%, #4A1F3E 100%)',
        'jample-gradient-warm':  'linear-gradient(135deg, #853953 0%, #c0392b 100%)',
        'sidebar-gradient':      'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        'hero-gradient':         'linear-gradient(135deg, #0f172a 0%, #2D0A1E 50%, #853953 100%)',
        'gold-gradient':         'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },

      boxShadow: {
        'xs':          '0 1px 2px rgba(0,0,0,0.05)',
        'sm':          '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card':        '0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)',
        'card-hover':  '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        'dropdown':    '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.05)',
        'modal':       '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        'jample':      '0 4px 20px rgba(133,57,83,0.30)',
        'jample-lg':   '0 8px 40px rgba(133,57,83,0.45)',
        'gold':        '0 4px 20px rgba(245,158,11,0.30)',
        'sidebar':     '4px 0 20px rgba(0,0,0,0.25)',
        'glass':       '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
        'none':        'none',
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.25s ease-out',
        'slide-in':       'slide-in 0.2s ease-out',
        'slide-up':       'slide-up 0.3s ease-out',
        'scale-in':       'scale-in 0.15s ease-out',
        'pulse-soft':     'pulse-soft 2s infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'float':          'float 3s ease-in-out infinite',
        'spin-slow':      'spin 3s linear infinite',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.65' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

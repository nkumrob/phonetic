/** @type {import('tailwindcss').Config} */
const { tokens } = require('./lib/design/tokens');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Use design tokens for consistent theming
      colors: {
        // Map CSS variables for dynamic theming
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        // Primary color system
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        // Import color tokens
        warmNeutral: tokens.colors.warmNeutral,
        coolBlue: tokens.colors.coolBlue,
        warmAmber: tokens.colors.warmAmber,
        // Semantic colors
        success: tokens.colors.semantic.success,
        error: tokens.colors.semantic.error,
        warning: tokens.colors.semantic.warning,
        info: tokens.colors.semantic.info,
      },
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      letterSpacing: tokens.typography.letterSpacing,
      lineHeight: tokens.typography.lineHeight,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
      animation: {
        // Define animations using proper timing functions
        'fade-in': `fadeIn ${tokens.animations.duration[300]} ${tokens.animations.timing.easeOutCubic}`,
        'slide-up': `slideUp ${tokens.animations.duration[300]} ${tokens.animations.timing.easeOutCubic}`,
        'scale-in': `scaleIn ${tokens.animations.duration[200]} ${tokens.animations.timing.easeOutBack}`,
        'lift': `lift ${tokens.animations.duration[200]} ${tokens.animations.timing.easeOutCubic}`,
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        lift: {
          '0%': { transform: 'translateY(0)', boxShadow: tokens.shadows.DEFAULT },
          '100%': { transform: 'translateY(-2px)', boxShadow: tokens.shadows.hover },
        },
      },
      transitionTimingFunction: tokens.animations.timing,
      transitionDuration: tokens.animations.duration,
      screens: tokens.breakpoints,
      zIndex: tokens.zIndex,
    },
  },
  plugins: [],
};
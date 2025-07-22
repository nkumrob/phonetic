/**
 * Design Token System
 * Based on the Complete AI Design Intelligence System Style Guide
 * 
 * Key Principles:
 * - Typography: Inter at 900 weight for headlines, perfect fourth scale
 * - Colors: Warm/cool balance, proper opacity hierarchy
 * - Spacing: 8px grid system with mathematical progression
 * - Animations: Proper easing curves, never linear
 */

export const tokens = {
  // Typography System - Perfect Fourth Scale (1.333 ratio)
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif'], // For headlines
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem',  // 72px
      '8xl': '6rem',    // 96px
      '9xl': '8rem',    // 128px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900', // Required for headlines
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    // Letter spacing algorithm from style guide
    letterSpacing: {
      headlines: '-0.04em',    // For 48px+ headlines
      largeText: '-0.025em',   // For 24-48px
      bodyText: '-0.01em',     // For 16-24px
      smallText: '0.01em',     // For 12-16px
      widest: '0.1em',         // For uppercase labels
    },
  },

  // Color System with Proper Temperature Mixing
  colors: {
    // Warm Base Palette (Primary neutrals)
    warmNeutral: {
      50: '#FEF7ED',    // Cream
      100: '#FEF3E2',
      200: '#FAE5D3',
      300: '#F8D5B4',
      400: '#E8B68D',
      500: '#D09062',
      600: '#B67148',
      700: '#925538',
      800: '#744231',
      900: '#5C3626',
      950: '#3B1F14',   // Dark brown
    },
    // Cool Accent (Primary action)
    coolBlue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',   // Main action color
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
    // Warm Accent (Secondary, attention)
    warmAmber: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',   // Secondary accent
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    // Semantic Colors
    semantic: {
      success: '#10B981',  // Green
      error: '#EF4444',    // Red
      warning: '#F59E0B',  // Amber
      info: '#3B82F6',     // Blue
    },
    // Backgrounds - Based on warm neutrals
    background: {
      primary: '#FFFFFF',
      secondary: '#FEF7ED', // warmNeutral.50
      tertiary: '#FEF3E2',  // warmNeutral.100
      elevated: '#FFFFFF',
      overlay: 'rgba(28, 25, 23, 0.5)',
    },
    // Text - Proper opacity hierarchy
    text: {
      primary: 'rgba(28, 25, 23, 1)',      // 100% warmNeutral.900
      secondary: 'rgba(28, 25, 23, 0.7)',  // 70%
      tertiary: 'rgba(28, 25, 23, 0.5)',   // 50%
      disabled: 'rgba(28, 25, 23, 0.3)',   // 30%
      inverse: 'rgba(255, 255, 255, 0.95)',
    },
  },

  // Spacing System - Base 8px Grid
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    48: '12rem',     // 192px
    56: '14rem',     // 224px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem',     // 384px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    full: '9999px',
  },

  // Shadow System - Z-axis layering with 8px, 16px, 32px depths
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 25px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 40px rgba(0, 0, 0, 0.18)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Interactive states
    hover: '0 4px 12px rgba(0, 0, 0, 0.15)',
    active: '0 2px 6px rgba(0, 0, 0, 0.1)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // Animation System - Proper easing curves from style guide
  animations: {
    timing: {
      // Primary timing functions
      easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
      // Fallback timing
      default: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // easeOutCubic
      linear: 'linear', // Avoid except for continuous animations
    },
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index Scale
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },
} as const;

// Helper functions

// Golden ratio for layouts
export const goldenRatio = 1.618;

// Get golden ratio grid columns
export const getGoldenSplit = (reverse = false) => 
  reverse ? `${goldenRatio}fr 1fr` : `1fr ${goldenRatio}fr`;

// Get proper text opacity based on hierarchy
export const getTextOpacity = (level: 'primary' | 'secondary' | 'tertiary' | 'disabled', isDark = false) => {
  const lightOpacities = { primary: 1, secondary: 0.7, tertiary: 0.5, disabled: 0.3 };
  const darkOpacities = { primary: 0.95, secondary: 0.75, tertiary: 0.55, disabled: 0.35 };
  return isDark ? darkOpacities[level] : lightOpacities[level];
};

// Get proper letter spacing based on font size
export const getLetterSpacing = (fontSize: number) => {
  if (fontSize >= 48) return tokens.typography.letterSpacing.headlines; // -0.04em
  if (fontSize >= 24) return tokens.typography.letterSpacing.largeText; // -0.025em
  if (fontSize >= 16) return tokens.typography.letterSpacing.bodyText;  // -0.01em
  return tokens.typography.letterSpacing.smallText; // 0.01em
};

// Default export for convenience
export default tokens;
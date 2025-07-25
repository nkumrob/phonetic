import { Inter } from 'next/font/google';

// Optimize Inter font loading with variable font
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});

// Font loading optimization settings
export const fontOptimization = {
  // Critical font weights for initial load
  criticalWeights: ['400', '600', '900'] as const,
  
  // Preload only essential characters for initial render
  unicodeRange: 'U+0020-007F, U+00A0-00FF', // Basic Latin + Latin-1
  
  // Font display strategy
  fontDisplay: 'swap' as const, // Show fallback immediately, swap when loaded
};
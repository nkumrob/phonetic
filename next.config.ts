import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Security headers
  async headers() {
    const headers = [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self "https://page.famewall.io"), microphone=(self "https://page.famewall.io"), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://page.famewall.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://www.google.com https://vitals.vercel-insights.com https://page.famewall.io; media-src 'self'; object-src 'none'; child-src 'self' https://page.famewall.io; frame-src 'self' https://page.famewall.io; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self'; worker-src 'self';`.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
    
    // Add HSTS header only in production
    if (process.env.NODE_ENV === 'production') {
      headers[0].headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      });
    }
    
    return headers;
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Production optimizations
  reactStrictMode: true,

  // ESLint configuration - allow warnings but fail on errors
  eslint: {
    ignoreDuringBuilds: false, // Run ESLint during builds
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Fail on TypeScript errors
  },

  // Optimize bundle size
  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
  },
};

export default nextConfig;

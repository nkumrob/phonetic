import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/widget-demo', // Internal demo page, not for public indexing
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
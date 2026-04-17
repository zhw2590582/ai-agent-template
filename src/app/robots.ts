import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      allow: '/',
      disallow: ['/api/', '/auth/', '/en-US/auth/', '/zh-CN/auth/'],
      userAgent: '*',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

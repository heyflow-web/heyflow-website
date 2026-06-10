import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    // TODO: 추후 실제 도메인으로 수정하세요
    sitemap: 'https://heyflow.kr/sitemap.xml',
  };
}

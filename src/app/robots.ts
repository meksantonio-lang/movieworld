import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/chisom/',     // Secures your specific admin portal and dashboard
        '/api/',        // Prevents crawlers from hitting your backend data endpoints
        '/_next/',      // Standard Next.js internal build files
      ],
    },
    sitemap: 'https://moviewrld.com/sitemap.xml',
  }
}
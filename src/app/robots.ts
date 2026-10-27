import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/chisom/',     // Secures your specific admin portal and dashboard
        '/api/',        // Prevents crawlers from hitting your backend AI/data endpoints
        // Removed /_next/ so crawlers can access your JS/CSS and render the page
      ],
    },
    sitemap: 'https://moviewrld.com/sitemap.xml',
  }
}
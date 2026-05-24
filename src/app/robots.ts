import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/private/'], // Hide any private dashboard routes
    },
    sitemap: 'https://moviewrld.com/sitemap.xml',
  }
}
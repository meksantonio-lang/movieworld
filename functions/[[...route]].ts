import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import type { PagesFunction, KVNamespace, D1Database } from '@cloudflare/workers-types';

interface Env {
  __ASSETS: KVNamespace;
  MOVIEDB: D1Database;
}

// This catch-all route handler delegates all non-API routes to the Next.js built app
export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    // Skip API routes - let them be handled by functions/api
    if (context.request.url.includes('/api/')) {
      return new Response('Not Found', { status: 404 });
    }

    // Try to serve from static assets first
    try {
      const res = await getAssetFromKV(context as any, { ASSET_NAMESPACE: context.env.__ASSETS });
      return res as any; // Cast to bypass the DOM vs Workers Response type mismatch
    } catch {
      // Asset not found in KV, return 404
      return new Response('Not Found', { status: 404 });
    }
  } catch (error: any) { // Explicitly type as 'any' to fix template literal errors
   return new Response(`Internal Error: ${error?.message || error}`, { status: 500 });
  }
}
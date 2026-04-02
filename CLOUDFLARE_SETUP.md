# Cloudflare Pages + D1 Setup Guide

## Problem
Your Next.js app is trying to fetch movies from an external PHP API instead of directly from D1 database.

## Solution
I've created a Next.js API route that connects directly to your D1 database.

## Configuration Steps

### 1. Configure D1 Binding in Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Navigate to your Pages project: **mediahub**
3. Click **Settings** → **Functions**
4. Scroll to **D1 database bindings**
5. Click **Add binding**:
   - Variable name: `DB`
   - D1 database: Select your database (ID: ca2d92bc-8c59-48ec-9d72-1561e4627cdf)
6. Click **Save**

### 2. Verify Movies Exist in D1

Check your database has movies:

```bash
npx wrangler d1 execute ca2d92bc-8c59-48ec-9d72-1561e4627cdf --remote --command "SELECT * FROM movies LIMIT 5"
```

If empty, add some movies:

```bash
npx wrangler d1 execute ca2d92bc-8c59-48ec-9d72-1561e4627cdf --remote --command "INSERT INTO movies (title, genre, cover, release_year) VALUES ('Inception', 'Sci-Fi', 'https://image.url', 2010)"
```

### 3. Deploy Your Changes

```bash
git add .
git commit -m "Add D1 database integration"
git push origin main
```

### 4. Test Locally (Optional)

```bash
npm run dev
# In another terminal:
npx wrangler pages dev .next --d1 DB=ca2d92bc-8c59-48ec-9d72-1561e4627cdf
```

## Changes Made

1. ✅ Created `/api/movies` endpoint that queries D1
2. ✅ Updated movies page to fetch from `/api/movies` instead of external PHP
3. ✅ Added `wrangler.toml` with D1 binding configuration
4. ✅ Updated package.json with Cloudflare deploy scripts

## Troubleshooting

### Movies still not showing?

1. **Check browser console** for errors (F12)
2. **Verify D1 binding** is configured in Cloudflare dashboard
3. **Check D1 has data**: Use wrangler command above
4. **Check deployment logs** in Cloudflare Pages dashboard

### API returning "Database not configured"?

- D1 binding not set up in Cloudflare dashboard
- Variable name must be exactly `DB`

### Need to switch back to PHP API temporarily?

Change line 22 in `/src/app/movies/page.tsx` back to:
```tsx
fetch('https://movieworld.wuaze.com/api.php?action=getMovies')
```

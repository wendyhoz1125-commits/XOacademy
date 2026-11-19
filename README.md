# XO Academy

Redesign of the XO Scheduler help center (helpcenter.xoscheduler.com), built with React, Vite, Tailwind CSS
and shadcn/ui. The visual system follows xoscheduler.com and is documented in [DESIGN.md](DESIGN.md).

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

- `npm run dev`: development server.
- `npm run build`: type-check and production build into `dist/`.
- `node scripts/fetch-content.mjs`: refresh the content snapshot in `src/data/content.json` from the live help center API.

## Structure

- `src/pages`: home, category, article, search and 404 pages. Routes match the live site.
- `src/components`: layout, search box and shared pieces. `src/components/ui` holds the shadcn/ui components.
- `src/lib/content.ts`: categories, articles, search and the per-category artwork.
- `src/lib/article.ts`: normalises the CMS article HTML into real headings, lists and callouts.

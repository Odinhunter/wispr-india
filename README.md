# ishankabra.com/wisprflow

Ishan Kabra's entry for the Wispr Flow India hiring challenge. Static site on Vercel.

## Editing the page

1. Edit `src/index.html`, or replace it with a fresh export of the Claude artifact.
2. `node scripts/build.mjs` builds `public/wisprflow/index.html` (Vercel runs this on every deploy).
3. Preview: `cd public && python3 -m http.server 4173`, then open http://localhost:4173/wisprflow/
4. Push to `main` to deploy.

The build moves the inlined fonts into `public/fonts/`, points three.js and Lenis at
`public/vendor/`, and adds share-preview, icon and analytics tags.

## Layout

- `src/index.html`: page source
- `scripts/build.mjs`: build step
- `public/`: everything served (OG image, icons, 404, vendored scripts)
- `vercel.json`: redirects (`/` to `/wisprflow`, `www` to apex), headers, caching
- `design/`: icon sources and `qa/` browser checks (`cd design/qa && npm i && node shot.mjs <url>`)

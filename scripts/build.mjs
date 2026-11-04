// Turns src/index.html (the page as exported from the Claude artifact) into the
// production page at public/wisprflow/index.html:
//   - inlined base64 fonts become hashed .woff2 files, cached forever
//   - CDN scripts point at copies in public/vendor
//   - share-preview, icon and analytics tags go into <head>
// Re-run after replacing src/index.html with a fresh artifact export.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const SITE = 'https://ishankabra.com';
const PAGE = `${SITE}/wisprflow`;
const PRELOAD = ['Rec', 'Fraunces']; // fonts used above the fold

let html = readFileSync('src/index.html', 'utf8');
const fail = (msg) => { console.error(`build: ${msg}`); process.exit(1); };

// Fonts
rmSync('public/fonts', { recursive: true, force: true });
mkdirSync('public/fonts', { recursive: true });
const fonts = [];
html = html.replace(
  /(@font-face\s*\{\s*font-family:\s*"([^"]+)";\s*src:\s*url\()"?data:font\/woff2;base64,([A-Za-z0-9+/=]+)"?\)/g,
  (_, pre, family, b64) => {
    const buf = Buffer.from(b64, 'base64');
    const name = `${family.toLowerCase()}-${createHash('sha256').update(buf).digest('hex').slice(0, 10)}.woff2`;
    writeFileSync(`public/fonts/${name}`, buf);
    fonts.push({ family, name, kb: Math.round(buf.length / 1024) });
    return `${pre}"/fonts/${name}")`;
  },
);
if (html.includes('data:font/')) fail('an inline font was not extracted');

// Vendor scripts
const VENDOR = {
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js': '/vendor/three-r128.min.js',
  'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js': '/vendor/lenis-1.1.13.min.js',
};
for (const [cdn, local] of Object.entries(VENDOR)) {
  if (!html.includes(`src="${cdn}"`)) fail(`expected script ${cdn}`);
  html = html.replace(`src="${cdn}"`, `src="${local}"`);
}
const stray = html.match(/<script[^>]+src="https?:\/\/[^"]+"/g);
if (stray) fail(`unvendored external script: ${stray.join(', ')}`);

// Head tags
const attr = (re) => (html.match(re) || fail(`missing ${re}`))[1];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const title = attr(/<title>([^<]+)<\/title>/);
const desc = attr(/<meta name="description" content="([^"]+)"/);
const preloads = fonts
  .filter((f) => PRELOAD.includes(f.family))
  .map((f) => `<link rel="preload" href="/fonts/${f.name}" as="font" type="font/woff2" crossorigin>`);
const head = [
  ...preloads,
  `<link rel="canonical" href="${PAGE}">`,
  '<meta name="theme-color" content="#05060E">',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  '<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<meta property="og:type" content="profile">',
  '<meta property="og:site_name" content="Ishan Kabra">',
  `<meta property="og:url" content="${PAGE}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(desc)}">`,
  `<meta property="og:image" content="${SITE}/og.png">`,
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  `<meta property="og:image:alt" content="${esc(title)}">`,
  '<meta property="profile:first_name" content="Ishan">',
  '<meta property="profile:last_name" content="Kabra">',
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${esc(title)}">`,
  `<meta name="twitter:description" content="${esc(desc)}">`,
  `<meta name="twitter:image" content="${SITE}/og.png">`,
  '<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>',
  '<script defer src="/_vercel/insights/script.js"></script>',
].join('\n');
if (html.includes('og:image')) fail('source already has share tags; update build.mjs');
html = html.replace(/(<meta name="description"[^>]*>)/, `$1\n${head}`);

mkdirSync('public/wisprflow', { recursive: true });
writeFileSync('public/wisprflow/index.html', html);
console.log(`build: page ${Math.round(html.length / 1024)} KB, fonts ${fonts.map((f) => `${f.family} ${f.kb} KB`).join(', ')}`);

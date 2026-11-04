import puppeteer from 'puppeteer-core';
const [url, tag, frac] = [process.argv[2], process.argv[3], +process.argv[4]];
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
await p.goto(url, { waitUntil: 'networkidle0' });
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const target = Math.round((H - 900) * frac);
// scroll there in steps, like a reader
for (let y = target - 3000; y <= target; y += 150) { await p.evaluate(y => window.lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y), Math.max(0, y)); await new Promise(r => setTimeout(r, 60)); }
for (const t of [1200, 6000]) { await new Promise(r => setTimeout(r, t)); await p.screenshot({ path: `out/${tag}-${t}.png` }); }
await b.close();

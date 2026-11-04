// usage: node el.mjs <url> <selector> <tag>  -> screenshots the element area, desktop + mobile, after a gradual scroll
import puppeteer from 'puppeteer-core';
const [url, sel, tag] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  await p.goto(url, { waitUntil: 'networkidle0' });
  const go = (y) => p.evaluate(y => window.lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y), y);
  const target = await p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return r.top + scrollY + r.height / 2 - innerHeight / 2; }, sel);
  for (let y = Math.max(0, target - 2500); y <= target; y += 125) { await go(y); await new Promise(r => setTimeout(r, 40)); }
  await go(target); await new Promise(r => setTimeout(r, 2500));
  await p.screenshot({ path: `out/${tag}-${name}.png` });
  await p.close();
}
await b.close();

import puppeteer from 'puppeteer-core';
const url = process.argv[2] || 'https://ishankabra.com/wisprflow';
const tag = process.argv[3] || 'live';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await b.newPage(); await p.setViewport(vp);
  const logs = [];
  p.on('console', m => ['error','warning'].includes(m.type()) && logs.push(`${m.type()}: ${m.text()}`));
  p.on('pageerror', e => logs.push('pageerror: ' + e.message));
  p.on('requestfailed', r => logs.push('reqfail: ' + r.url().slice(0,100) + ' ' + r.failure()?.errorText));
  const t0 = Date.now();
  await p.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  console.log(`[${name}] loaded in ${Date.now()-t0}ms`);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const W = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  console.log(`[${name}] scrollHeight=${H} scrollWidth/innerWidth=${W}`);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const y = Math.round((H - vp.height) * i / (n - 1));
    await p.evaluate(y => { window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y); }, y);
    await new Promise(r => setTimeout(r, 1200));
    await p.screenshot({ path: `out/${tag}-${name}-${i}.png` });
  }
  console.log(`[${name}] issues:\n  ` + (logs.join('\n  ') || 'none'));
  await p.close();
}
await b.close();

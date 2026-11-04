import puppeteer from 'puppeteer-core';
const url = process.argv[2], tag = process.argv[3] || 'p';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
const info = await p.evaluate(() => { const s = document.getElementById('plan'); const r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, panels: [...s.querySelectorAll('.fl-panel')].map(x => Math.round(x.getBoundingClientRect().height)), vh: innerHeight }; });
console.log(JSON.stringify(info));
let k = 0;
for (let y = info.top; y < info.top + info.h; y += 420) {
  await p.evaluate(y => window.scrollTo(0, y), y);
  await new Promise(r => setTimeout(r, 900));
  if (k % 3 === 0) await p.screenshot({ path: `out/${tag}-${k}.png` });
  k++;
}
const st = await p.evaluate(() => [...document.querySelectorAll('#plan .fl-panel')].map(x => x.className));
console.log(st.join('\n'));
await b.close();

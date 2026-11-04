import puppeteer from 'puppeteer-core';
const [url, sel] = [process.argv[2], process.argv[3]];
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.goto(url, { waitUntil: 'networkidle0' });
const y = await p.evaluate(s => { const e = document.querySelector(s); return e.getBoundingClientRect().top + scrollY - 60; }, sel);
await p.evaluate(y => scrollTo(0, y), y);
for (const t of [300, 1500, 4000]) { await new Promise(r => setTimeout(r, t)); await p.screenshot({ path: `out/wait-${t}.png` }); }
const d = await p.evaluate(s => { const e = document.querySelector(s); return [...e.querySelectorAll('*')].filter(x => getComputedStyle(x).opacity === '0' && x.getBoundingClientRect().height > 40).slice(0, 8).map(x => x.tagName + '.' + x.className + ' h=' + Math.round(x.getBoundingClientRect().height)); }, sel);
console.log(d.join('\n')); await b.close();

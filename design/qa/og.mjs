import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await p.goto('http://localhost:4173/wisprflow/', { waitUntil: 'networkidle0' });
await p.addStyleTag({ content: `
  .topbar, .hero .lede, .hero .cta, .hero .ctas, .hero .btns, .hero .agent, .hero p:not(.kicker):not(.eyebrow) , .hero a, .hero .actions { display:none !important }
  .hero h1 { font-size: 78px !important; } .hero .eyebrow { font-size: 21px !important; }
  #ogtag { position:fixed; left:0; right:0; bottom:46px; text-align:center; z-index:99; font: 600 22px/1 "Rec", sans-serif; letter-spacing:.02em; color: rgba(244,240,232,.82) }
  #ogtag b { color:#FFD27A; font-weight:600 }` });
await p.evaluate(() => { const d = document.createElement('div'); d.id = 'ogtag'; d.innerHTML = 'ishankabra.com/wisprflow &nbsp;·&nbsp; <b>for Wispr Flow India</b>'; document.body.appendChild(d); });
await new Promise(r => setTimeout(r, 5000));
await p.screenshot({ path: '../../public/og.png' });
console.log(await p.evaluate(() => [...document.querySelector('.hero').querySelectorAll(':scope *')].filter(e => e.children.length === 0 && e.offsetParent).map(e => e.tagName + '.' + e.className).join(' | ')));
await b.close();

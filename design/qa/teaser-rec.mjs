import puppeteer from 'puppeteer-core';
const OUT = 'out/teaser';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false,
  args: ['--window-size=1280,860', '--hide-scrollbars'], defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1.5 }});
const p = await b.newPage();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const smooth = (to, ms) => p.evaluate((to, ms) => new Promise(res => { const from = scrollY, t0 = performance.now();
  const e = k => k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2)/2;
  const f = t => { const k = Math.min(1, (t - t0) / ms); window.scrollTo(0, from + (to - from) * e(k)); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }), to, ms);
const opts = n => ({ path: `${OUT}/clip-${n}.webm`, ffmpegPath: '/opt/homebrew/bin/ffmpeg' });

// 1: hero intro, recorded from first paint
await p.goto('about:blank');
let r = await p.screencast(opts(1));
await p.goto('https://ishankabra.com/wisprflow', { waitUntil: 'networkidle0', timeout: 60000 });
await sleep(5000);
await r.stop();

const clips = [[2, 2350, 2900, 2200], [3, 10200, 10800, 2000], [4, 12300, 13100, 2000], [5, 14300, 14900, 2000], [6, 17750, 18150, 2600]];
for (const [n, from, to, ms] of clips) {
  await smooth(from, 1500); await sleep(3000);
  r = await p.screencast(opts(n));
  await smooth(to, ms); await sleep(n === 6 ? 1500 : 200);
  await r.stop();
}
await b.close();

import puppeteer from 'puppeteer-core';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false, args: ['--window-size=1440,1000'] });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:4173/wisprflow/', { waitUntil: 'load' }); await sleep(3500);
const info = await p.evaluate(() => ({ stops: Snap.all.map(s => s.y + (s.r === 2 ? 'P' : s.r === 0 ? 's' : '')), on: Snap.on, z: [Snap.pg.z0, Snap.pg.z1], H: document.documentElement.scrollHeight, planH: document.getElementById('plan').offsetHeight }));
console.log(JSON.stringify(info));
await p.mouse.move(720, 450);
// 1) a trackpad-like flick in the story, then let it settle
const flick = async (dir, n = 30, start = 40) => { for (let i = 0; i < n; i++) { await p.mouse.wheel({ deltaY: dir * Math.max(1, start * Math.pow(0.88, i)) }); await sleep(16); } };
for (const at of [1200, 3000, 15600]) {
  await p.evaluate(y => { window.scrollTo(0, y); }, at); await sleep(800);
  await flick(1, 12, 25); await sleep(1800);
  const r = await p.evaluate(() => { const y = scrollY, n = Snap.all.reduce((b, s) => Math.abs(s.y - y) < Math.abs(b - y) ? s.y : b, 1e9); return [y, n]; });
  console.log(`settle from ${at}: rest=${Math.round(r[0])} nearestStop=${r[1]} ${Math.abs(r[0]-r[1]) < 4 ? 'ON STOP' : 'free'}`);
}
// 2) plan: arrive above it, then one big inertial trackpad gesture per page
const ys = await p.evaluate(() => Snap.pg.ys);
await p.evaluate(y => window.scrollTo(0, y), ys[0] - 700); await sleep(900);
const panel = () => p.evaluate(() => [PlanFX.cur, Math.round(scrollY), Snap.pg.on]);
await flick(1, 60, 60); await sleep(1600); console.log('enter plan ->', JSON.stringify(await panel()));
for (let g = 0; g < 7; g++) { await flick(1, 70, 70); await sleep(1500); console.log(`gesture ${g+1} ->`, JSON.stringify(await panel())); }
for (let g = 0; g < 2; g++) { await flick(-1, 70, 70); await sleep(1500); console.log(`back ${g+1} ->`, JSON.stringify(await panel())); }
// 3) keyboard
await p.evaluate(() => window.scrollTo(0, 0)); await sleep(1000);
for (let i = 0; i < 4; i++) { await p.keyboard.press('PageDown'); await sleep(1500); console.log('PageDown ->', await p.evaluate(() => Math.round(scrollY))); }
await p.screenshot({ path: 'out/snap-chevron.png' });
console.log('errors:', errs.length ? errs : 'none');
await b.close();

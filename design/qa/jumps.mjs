// usage: node jumps.mjs [url]  -> flags sudden camera jumps (a step far bigger than its neighbours) on desktop and mobile
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 500 });
  await p.goto(process.argv[2] || 'http://localhost:4173/wisprflow', { waitUntil: 'networkidle0' });
  const res = await p.evaluate(() => {
    const H = document.documentElement.scrollHeight, out = []; let prev = null, prevY = 0;
    const secAt = (y) => { let k = ''; __qa.SECS.forEach((s) => { if (y >= s.d0 && y < s.d1) k = s.key; }); return k; };
    const D = [];
    for (let y = 0; y < H; y += 2) { const q = __qa.poseAt(y); if (!q) { prev = null; continue; }
      const d = prev && q.env === prev.env ? Math.hypot(q.p[0] - prev.p[0], q.p[1] - prev.p[1], q.p[2] - prev.p[2]) + Math.hypot(q.l[0] - prev.l[0], q.l[1] - prev.l[1], q.l[2] - prev.l[2]) : 0;
      D.push([y, d]); prev = q; }
    for (let i = 10; i < D.length - 10; i++) { const [y, d] = D[i]; const nb = D.slice(i - 10, i).concat(D.slice(i + 1, i + 11)).map((x) => x[1]).sort((a, b) => a - b); const med = nb[10]; if (d > 1 && d > 6 * Math.max(med, 0.05)) out.push(`y=${y} (${secAt(y)}) jump ${d.toFixed(1)} vs typical ${med.toFixed(2)}`); }
    return out; });
  console.log(w, res.length ? res.slice(0, 15).join('\n') : 'no jumps');
  await p.close();
}
await b.close();

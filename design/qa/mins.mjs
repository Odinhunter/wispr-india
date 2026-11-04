import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const u of process.argv.slice(2)) for (let k = 0; k < 3; k++) {
  const p = await b.newPage(); await p.setViewport({width:1440,height:900}); await p.goto(u, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500));
  const r = await p.evaluate(() => { const P = __qa.PlanFX; const before = P.horiz; P.tooShort = false; P.horiz = true; P.sec.classList.add('horiz'); const s = P.fit(); P.measure(); return { before, minS: +s.toFixed(3), after: P.horiz }; });
  console.log(u.split('/').slice(-2,-1)[0], JSON.stringify(r)); await p.close();
}
await b.close();

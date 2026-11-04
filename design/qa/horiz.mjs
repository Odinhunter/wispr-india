import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
for (const u of process.argv.slice(2)) for (const vp of [{width:1440,height:900},{width:1280,height:720},{width:1920,height:1080}]) {
  const p = await b.newPage(); await p.setViewport(vp); await p.goto(u, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500));
  const r = await p.evaluate(() => { const s = document.getElementById('plan'); return { horiz: s.classList.contains('horiz'), H: document.documentElement.scrollHeight, planH: Math.round(s.getBoundingClientRect().height) }; });
  console.log(u.replace('http://localhost:4173',''), vp.width+'x'+vp.height, JSON.stringify(r)); await p.close();
}
await b.close();

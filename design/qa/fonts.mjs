import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const p = await b.newPage(); await p.goto(process.argv[2], { waitUntil: 'networkidle0' });
console.log(await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].map(f => `${f.family} ${f.weight} ${f.style}: ${f.status}`).join('\n'); }));
await b.close();

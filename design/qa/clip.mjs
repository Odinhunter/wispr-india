// usage: node clip.mjs [url]  -> for every gradient-text title, counts letter pixels that fall outside its box
// (gradient text is invisible outside the box, so any such pixel is a clipped letter)
import puppeteer from 'puppeteer-core';
const url = process.argv[2] || 'http://localhost:4173/wisprflow';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
let bad = 0;
for (const [w, h] of [[2560, 1440], [1920, 1080], [1440, 900], [1280, 720], [1024, 768], [820, 1180], [430, 932], [390, 844], [360, 740], [320, 640]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: w < 500 });
  await p.goto(url, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
  const n = await p.evaluate(() => document.querySelectorAll('.place').length);
  for (let i = 0; i < n; i++) {
    // copy the title, in solid white, onto a black overlay at the same size and width
    const box = await p.evaluate((i) => {
      document.getElementById('__ov')?.remove();
      const el = document.querySelectorAll('.place')[i], cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const ov = document.createElement('div'); ov.id = '__ov'; Object.assign(ov.style, { position: 'fixed', inset: '0', background: '#000', zIndex: 2147483647 });
      const c = el.cloneNode(true); c.className = ''; c.removeAttribute('style');
      for (const k of ['font', 'fontFamily', 'fontSize', 'fontWeight', 'fontVariationSettings', 'letterSpacing', 'lineHeight', 'whiteSpace', 'padding', 'textAlign', 'wordSpacing', 'textTransform']) c.style[k] = cs[k];
      Object.assign(c.style, { position: 'absolute', left: '200px', top: '200px', width: r.width + 'px', margin: 0, color: '#fff', background: 'none', webkitTextFillColor: '#fff', boxSizing: 'border-box', opacity: 1, transform: 'none', filter: 'none', animation: 'none', textShadow: 'none' });
      ov.appendChild(c); document.body.appendChild(ov);
      const cr = c.getBoundingClientRect(); return { x: cr.left, y: cr.top, w: cr.width, h: cr.height, text: el.innerText.replace(/\n/g, ' ') };
    }, i);
    const pad = 60, clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.w + pad * 2, height: box.h + pad * 2 };
    const vpW = Math.max(w, Math.ceil(clip.x + clip.width)), vpH = Math.max(h, Math.ceil(clip.y + clip.height));
    if (vpW > w || vpH > h) await p.setViewport({ width: vpW, height: vpH, isMobile: w < 500 });
    const png = await p.screenshot({ clip, encoding: 'base64', captureBeyondViewport: false });
    const out = await p.evaluate(async (png, pad, bw, bh) => { const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height).data; const sx = img.width / (bw + pad * 2); let outside = 0, where = new Set(); for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) { const v = d[(y * cv.width + x) * 4]; if (v < 90) continue; const X = x / sx - pad, Y = y / sx - pad; if (X < -0.5 || Y < -0.5 || X > bw + 0.5 || Y > bh + 0.5) { outside++; where.add(Y < 0 ? 'top' : Y > bh ? 'bottom' : X < 0 ? 'left' : 'right'); } } return { outside, where: [...where] }; }, png, pad, box.w, box.h);
    if (vpW > w || vpH > h) await p.setViewport({ width: w, height: h, isMobile: w < 500 });
    if (out.outside > 3) { bad++; console.log(`${w}px  CLIPPED  "${box.text}"  ${out.outside}px outside (${out.where.join(', ')})`); }
  }
  await p.close();
}
console.log(bad ? `${bad} clipped titles` : 'no clipped letters'); await b.close();

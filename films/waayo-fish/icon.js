// Fahaan channel icon: a fresh blue-teal tile, a low-poly hexagon block (three flat-shaded faces) with a bold "F" standing on it,
// and a small yellow spark (an idea). No faces, no figures. drawIcon(g, cx, cy, size) draws it centred; used by the end card and icon.html.
window.drawIcon = function drawIcon(g, cx, cy, S, o = {}) {
  g.save(); g.translate(cx - S / 2, cy - S / 2);
  const r = S * .23;
  // tile background
  const rr = () => { g.beginPath(); g.moveTo(r, 0); g.arcTo(S, 0, S, S, r); g.arcTo(S, S, 0, S, r); g.arcTo(0, S, 0, 0, r); g.arcTo(0, 0, S, 0, r); g.closePath(); };
  if (o.shadow !== false) { g.save(); g.shadowColor = 'rgba(15,35,70,.35)'; g.shadowBlur = S * .08; g.shadowOffsetY = S * .03; rr(); g.fillStyle = '#3d8ee0'; g.fill(); g.restore(); }
  rr(); const bg = g.createLinearGradient(0, 0, S, S); bg.addColorStop(0, '#4a9be8'); bg.addColorStop(1, '#25b5a5'); g.fillStyle = bg; g.fill();
  g.save(); rr(); g.clip();
  // faceted light: two soft triangles
  g.fillStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(S, 0); g.lineTo(0, S * .75); g.closePath(); g.fill();
  g.fillStyle = 'rgba(10,40,80,.08)'; g.beginPath(); g.moveTo(S, S * .35); g.lineTo(S, S); g.lineTo(S * .3, S); g.closePath(); g.fill();
  // hex block (isometric), centred low
  const hx = S * .5, hy = S * .7, R = S * .33, sq = .52, dh = S * .11;
  const P = i => { const a = Math.PI / 3 * i; return [hx + Math.cos(a) * R, hy + Math.sin(a) * R * sq]; };
  const p = [0, 1, 2, 3, 4, 5].map(P);
  const side = (a, b, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(...p[a]); g.lineTo(p[a][0], p[a][1] + dh); g.lineTo(p[b][0], p[b][1] + dh); g.lineTo(...p[b]); g.closePath(); g.fill(); };
  side(0, 1, '#1d6f86'); side(1, 2, '#2a86a0'); side(2, 3, '#3b9cb5');
  g.fillStyle = '#9ff0d2'; g.beginPath(); p.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(...p[3]); g.lineTo(...p[4]); g.lineTo(...p[5]); g.closePath(); g.fill();
  // the F, standing on the block
  g.font = `800 ${Math.round(S * .52)}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(20,80,90,.28)'; g.beginPath(); g.ellipse(hx + S * .035, hy + S * .012, S * .13, S * .035, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.shadowColor = 'rgba(10,50,80,.35)'; g.shadowBlur = S * .03; g.shadowOffsetY = S * .012; g.fillStyle = '#ffffff'; g.fillText('F', hx, hy + S * .01); g.restore();
  g.restore();
  // spark (four points), upper right
  const sx = S * .76, sy = S * .26, k = S * .1;
  g.fillStyle = '#ffd45c'; g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, rr2 = i % 2 ? k * .28 : k; const x = sx + Math.cos(a) * rr2, y = sy + Math.sin(a) * rr2; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath(); g.fill();
  g.beginPath(); g.arc(S * .86, S * .14, S * .025, 0, Math.PI * 2); g.fill();
  g.restore();
}

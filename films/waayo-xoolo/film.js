// Waayo? · Xoolaha: the film (it loops: the last frame is the first) on one timeline. Scene times come from timeline.js (voice lengths), card changes from the
// spoken words (voices/words.js). render(t) draws film second t; EV lists the sound events; TEXTS(t) reports visible text.
(function () {
  const { W, H, PAL, E, clamp, lerp, inv, disc, seg, rrect, poly, ring, mix, rgba } = G;
  const SC = window.SC, WD = window.WORDS, DUR = window.DUR, INK = G.INK, CREAM = G.CREAM;
  const S = (id) => SC.find((s) => s.id === id);
  // absolute time of the n-th word (in scene id) that starts with `p`
  const wt = (id, p, n = 0) => {
    let k = 0;
    for (const x of WD[id]) if (x.w.toLowerCase().startsWith(p.toLowerCase()) && k++ === n) return S(id).v + x.t0;
    throw new Error(`word ${p}#${n} not in ${id}`);
  };
  const HUE = { s01: 'sand', s02: 'brown', s03: 'sand', s04: 'sky', s05: 'gold', s06: 'sand' };
  const sceneAt = (t) => { let s = SC[0]; for (const x of SC) if (t >= x.t) s = x; return s; };
  const SUN = PAL.sun.t[2], SUNL = '#ffc93c';
  const CX = 540, CY = 740, R = 360;          // the stage disc
  const TY = 1252;                            // title baseline

  // ───────── cards: [start time, scene, draw(ctx, lt, P, t), title, title start] ─────────
  const C = [];
  const card = (t0, sc, draw, title, ev = []) => C.push({ t0, sc, draw, title, ev });

  // ═════════ the livestock story's cards (spliced into film.js by tools/splice.py) ═════════
  const SANDC = '#e8d5b0', CAMEL = '#a0785a', NAVY = '#1b2a41', SKY = '#4189dd', GOLD = '#ffc93c', WHITE = '#fbf7ee';
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;
  const pill = (ctx, s, x, y, bg, fg, k = 1, px = 38) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.font = `800 ${px}px Montserrat`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s).width; rrect(ctx, x - tw / 2 - 22, y - px * 0.8, tw + 44, px * 1.6, px * 0.8, bg);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 2); ctx.restore();
  };
  const source = (ctx, s, k = 1) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.75 * clamp(k); ctx.font = '500 24px "DM Mono"'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s, CX, 1128); ctx.restore(); };
  const bigNum = (ctx, to, x, y, px, p, col, fmt = (v) => Math.round(v).toLocaleString('en-US')) => {
    if (p <= 0) return; const k = E.oBack(clamp(p * 3), 1.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(to * E.o3(p)), 0, 0); ctx.restore();
  };
  const bigText = (ctx, s, x, y, px, k, col) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); };
  const label = (ctx, s, x, y, k = 1, px = 30, col = INK) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = col; ctx.font = `800 ${px}px Montserrat`; ctx.textAlign = 'center'; ctx.fillText(s, x, y); ctx.restore(); };
  const clipStage = (ctx, f) => { ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip(); f(); ctx.restore(); };
  const shadowText = (ctx, s, x, y, px, col) => { ctx.save(); ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba(NAVY, 0.25); ctx.fillText(s, x + 5, y + 6); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); };
  // flat, faceless animal silhouettes; (x, y) = ground under the body, s = size, step = leg swing
  const camel = (ctx, x, y, s, col, step = 0, dir = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    const L = (dx, ph) => G.seg(ctx, [dx * s, -s * 0.55], [dx * s + Math.sin(step + ph) * s * 0.12, 0], s * 0.07, col);
    L(-0.28, 0); L(-0.18, Math.PI); L(0.2, Math.PI); L(0.3, 0);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -s * 0.62, s * 0.38, s * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-s * 0.02, -s * 0.78, s * 0.18, s * 0.15, 0, Math.PI, 0); ctx.fill();          // hump
    G.seg(ctx, [s * 0.32, -s * 0.66], [s * 0.48, -s * 1.0], s * 0.09, col);                                         // neck
    ctx.beginPath(); ctx.ellipse(s * 0.55, -s * 1.02, s * 0.1, s * 0.055, 0.2, 0, Math.PI * 2); ctx.fill();         // head (no face)
    G.seg(ctx, [-s * 0.38, -s * 0.62], [-s * 0.45, -s * 0.42], s * 0.025, col); ctx.restore();                     // tail
  };
  const cow = (ctx, x, y, s, col) => { for (const dx of [-0.28, -0.16, 0.18, 0.3]) G.seg(ctx, [x + dx * s, y - s * 0.4], [x + dx * s, y], s * 0.07, col);
    rrect(ctx, x - s * 0.38, y - s * 0.62, s * 0.76, s * 0.3, s * 0.1, col); rrect(ctx, x + s * 0.34, y - s * 0.72, s * 0.2, s * 0.2, s * 0.06, col);
    G.seg(ctx, [x + s * 0.38, y - s * 0.72], [x + s * 0.32, y - s * 0.84], s * 0.035, col); G.seg(ctx, [x + s * 0.5, y - s * 0.72], [x + s * 0.56, y - s * 0.84], s * 0.035, col); };
  const sheep = (ctx, x, y, s, col, head = NAVY) => { for (const dx of [-0.2, -0.08, 0.1, 0.2]) G.seg(ctx, [x + dx * s, y - s * 0.3], [x + dx * s, y], s * 0.06, head);
    for (const [dx, dy, r] of [[-0.15, -0.45, 0.17], [0.05, -0.5, 0.18], [0.2, -0.42, 0.15], [-0.02, -0.36, 0.17]]) disc(ctx, x + dx * s, y + dy * s, r * s, col);
    ctx.fillStyle = head; ctx.beginPath(); ctx.ellipse(x + s * 0.38, y - s * 0.5, s * 0.1, s * 0.07, 0.4, 0, Math.PI * 2); ctx.fill(); };
  const goat = (ctx, x, y, s, col) => { for (const dx of [-0.22, -0.1, 0.12, 0.22]) G.seg(ctx, [x + dx * s, y - s * 0.32], [x + dx * s, y], s * 0.05, col);
    rrect(ctx, x - s * 0.3, y - s * 0.52, s * 0.6, s * 0.24, s * 0.1, col); G.seg(ctx, [x + s * 0.26, y - s * 0.5], [x + s * 0.36, y - s * 0.7], s * 0.07, col);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + s * 0.42, y - s * 0.72, s * 0.09, s * 0.06, 0.3, 0, Math.PI * 2); ctx.fill();
    G.seg(ctx, [x + s * 0.36, y - s * 0.76], [x + s * 0.3, y - s * 0.92], s * 0.03, col); };
  const coin = (ctx, x, y, r, col = GOLD) => { disc(ctx, x, y, r, col); G.ring(ctx, x, y, r * 0.72, r * 0.1, mix(col, '#000', 0.25)); bigText(ctx, '$', x, y + r * 0.05, r * 1.0, 1, mix(col, '#000', 0.3)); };
  const ANIM = [(c, x, y, s, k) => camel(c, x, y, s, CAMEL), (c, x, y, s) => cow(c, x, y, s, '#7a5a40'), (c, x, y, s) => sheep(c, x, y, s, WHITE), (c, x, y, s) => goat(c, x, y, s, '#5b4636')];

  // ——— the opening (also what the film loops into): a gold counter spinning to $1,000,000,000 over walking camels ———
  const opening = (ctx, lt) => {
    for (let i = 0; i < 5; i++) { const x = ((((lt + 3) * 130 + i * 260) % 1400) + 1400) % 1400 - 180; camel(ctx, x, 1060, 210, CAMEL, (lt + 3) * 6 + i, 1); }
    const p = clamp((lt + 0.7) / 1.9), v = 1e9 * E.o3(p);
    ctx.save(); ctx.globalAlpha = 0.92; rrect(ctx, 70, 560, 940, 230, 50, NAVY); ctx.restore();
    shadowText(ctx, '$' + Math.round(v).toLocaleString('en-US'), CX, 675, 92, GOLD);
    for (let i = 0; i < 4; i++) { const u = (((lt + 3) * 0.9 + i * 0.25) % 1); coin(ctx, 150 + i * 260, 470 - Math.sin(u * Math.PI) * 60, 34); }
  };

  // ——— 1 · hook: a billion dollars… in live animals ———
  card(0, 's01', (ctx, lt) => opening(ctx, lt), '$1 BILYAN', [[0.05, 'coins'], [0.1, 'hooves', { dur: 1.8, gain: 0.7 }], [0.9, 'coins', { gain: 0.6 }]]);

  // ——— 2 · that's what Somalia sells a year; up to 57 million animals: camels, cattle, sheep, goats ———
  const sp = ([lon, lat]) => [CX + (lon - 46) * 32, CY - (lat - 5.5) * 32];
  card(S('s02').t, 's02', (ctx, lt) => {
    G.geo(ctx, window.SOM, sp, SANDC);
    for (let i = 0; i < 6; i++) { const k = E.oBack(inv(0.2 + i * 0.12, 0.45 + i * 0.12, lt)); if (k > 0) coin(ctx, CX - 180 + (i % 3) * 140, 560 + Math.floor(i / 3) * 140, 50 * k); }
    pill(ctx, 'SANADKII', CX, 1060, NAVY, WHITE, E.oBack(inv(0.3, 0.6, lt)), 30);
  }, 'SOOMAALIYA', [[0.2, 'coins']]);
  card(wt('s02', 'waxaa') - 0.1, 's02', (ctx, lt) => {
    G.geo(ctx, window.SOM, sp, SANDC);
    for (let i = 0; i < 60; i++) { const k = E.oBack(inv(i * 0.012, 0.2 + i * 0.012, lt)); if (k <= 0) continue;
      const lon = 41.5 + G.hash(i + 3) * 9.5, lat = -1 + G.hash(i + 9) * 12; if (lat > 2 + (lon - 41) * 1.0 + 2 && lon < 47) continue; const q = sp([lon, lat]); ANIM[i % 4](ctx, q[0], q[1], 46 * k); }
    ctx.save(); ctx.globalAlpha = 0.92; rrect(ctx, CX - 330, 470, 660, 130, 40, NAVY); ctx.restore();
    bigNum(ctx, 57000000, CX, 538, 92, inv(0, 1.3, lt), GOLD);
    source(ctx, 'Somali Government', E.o3(inv(0.3, 0.7, lt)));
  }, '57 MILYAN XOOLO', [[0, 'tick', { dur: 1.2 }], [0.1, 'pop']]);
  card(wt('s02', 'geel,') - 0.1, 's02', (ctx, lt) => {
    const b0 = sinceW('s02', 'geel,') - 0.1, T = ['geel,', "lo',", 'ido', 'riyo.'].map((w) => sinceW('s02', w) - b0 - 0.1);
    [['GEEL', 270, 700], ['LO\'', 810, 700], ['IDO', 270, 1020], ['RIYO', 810, 1020]].forEach(([s, x, y], i) => {
      const k = E.oBack(inv(T[i], T[i] + 0.25, lt)); if (k <= 0) return; disc(ctx, x, y - 120, 150 * k, WHITE); ANIM[i](ctx, x, y - 40, 230 * k); label(ctx, s, x, y + 70, k, 32);
    });
    source(ctx, 'Somali Government', 1);
  }, '57 MILYAN XOOLO', [[0, 'pop', { gain: 0.6 }], [0.25, 'pop', { gain: 0.6 }], [0.5, 'pop', { gain: 0.6 }], [0.8, 'pop', { gain: 0.6 }]]);

  // ——— 3 · camels alone: ~7 million, among the most in the world; nearly 1 in 6 camels on Earth is Somali ———
  card(S('s03').t, 's03', (ctx, lt) => {
    camel(ctx, CX - 20, 1060, 560, CAMEL, lt * 3);
    ctx.save(); ctx.globalAlpha = 0.92; rrect(ctx, CX - 320, 420, 640, 130, 40, NAVY); ctx.restore();
    bigNum(ctx, 7000000, CX, 488, 92, inv(sinceW('s03', '7') - 0.3, sinceW('s03', '7') + 0.8, lt), GOLD);
    source(ctx, 'FAO', E.o3(inv(0.6, 1.0, lt)));
  }, '7 MILYAN GEEL', [[0.1, 'grunt'], [sinceW('s03', '7') - 0.3, 'tick', { dur: 1.0 }]]);
  const wp = ([lon, lat]) => [CX + (lon - 20) * 6.2, CY - (lat - 12) * 6.8];
  card(wt('s03', 'oo') - 0.1, 's03', (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = '#d9e7f5'; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.LAND, wp, SANDC); });
    [[18.7, 15.5, 'CHAD'], [46, 6, 'SOOMAALIYA'], [30, 15.5, ''], [38, 1, ''], [40, 9, '']].forEach(([lon, lat, lab], i) => {
      const q = wp([lon, lat]), k = E.oBack(inv(0.1 + i * 0.12, 0.4 + i * 0.12, lt)); if (k <= 0) return; camel(ctx, q[0], q[1] + 30, (i < 2 ? 120 : 80) * k, i === 1 ? GOLD : CAMEL);
      if (lab) pill(ctx, lab, q[0], q[1] + 70, i === 1 ? NAVY : rgba(NAVY, 0.7), WHITE, k, 22); });
    source(ctx, 'FAO', 1);
  }, '7 MILYAN GEEL', [[0, 'whoosh', { dur: 0.6 }], [0.2, 'pop']]);
  card(wt('s03', 'ku', 2) - 0.1, 's03', (ctx, lt) => {
    for (let i = 0; i < 6; i++) { const k = E.oBack(inv(i * 0.12, 0.25 + i * 0.12, lt)), x = 160 + (i % 3) * 380 - (i > 2 ? 0 : 0), y = i < 3 ? 760 : 1060;
      if (k > 0) camel(ctx, 220 + (i % 3) * 320, y, 200 * k, i === 2 && lt > 1.2 ? GOLD : CAMEL, lt * 3 + i); }
    bigText(ctx, '~1/6', CX, 470, 120, E.oBack(inv(1.1, 1.45, lt), 2), GOLD);
    source(ctx, 'FAO', 1);
  }, '1 KA MID AH 6', [[0.1, 'pop'], [0.4, 'pop'], [0.7, 'pop'], [1.15, 'grunt', { gain: 0.8 }], [1.2, 'ding', { gain: 0.5 }]]);

  // ——— 4 · millions shipped to the Gulf, especially Saudi Arabia; Hajj takes most of the sheep and goats ———
  const ap = ([lon, lat]) => [CX + (lon - 44) * 34, CY - (lat - 17) * 34];
  const ROUTE = [[45.0, 10.45], [44, 12.0], [43.3, 12.8], [41.5, 15], [39.8, 18], [39.15, 21.5]];
  const routeAt = (u) => { const n = ROUTE.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), a = ap(ROUTE[i]), b = ap(ROUTE[i + 1]); return [lerp(a[0], b[0], f - i), lerp(a[1], b[1], f - i)]; };
  const ship = (ctx, x, y, s) => { poly(ctx, [[x - s, y], [x + s, y], [x + s * 0.75, y + s * 0.35], [x - s * 0.8, y + s * 0.35]], NAVY); rrect(ctx, x - s * 0.7, y - s * 0.35, s * 0.9, s * 0.35, s * 0.05, SKY); rrect(ctx, x + s * 0.3, y - s * 0.65, s * 0.28, s * 0.65, s * 0.05, WHITE); for (let i = 0; i < 3; i++) disc(ctx, x - s * 0.55 + i * s * 0.28, y - s * 0.18, s * 0.09, WHITE); };
  card(S('s04').t, 's04', (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = '#cfe2f6'; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.LAND, ap, SANDC); G.geo(ctx, window.SOM, ap, mix(SANDC, CAMEL, 0.4)); });
    const p = routeAt(E.io(inv(0.3, 2.6, lt))); ship(ctx, p[0], p[1] - 20, 60);
    pill(ctx, 'BERBERA', ap([45, 10.4])[0] + 40, ap([45, 10.4])[1] + 60, NAVY, WHITE, E.oBack(inv(0.1, 0.4, lt)), 24);
    pill(ctx, 'SACUUDIGA', ap([44, 22])[0] + 40, ap([44, 22])[1], NAVY, WHITE, E.oBack(inv(sinceW('s04', 'sacuudiga.') - 0.2, sinceW('s04', 'sacuudiga.') + 0.1, lt)), 24);
    ctx.save(); ctx.globalAlpha = 0.92; rrect(ctx, CX - 260, 400, 520, 120, 40, NAVY); ctx.restore();
    bigText(ctx, '4–6M / SANADKII', CX, 462, 58, E.oBack(inv(0.4, 0.7, lt)), GOLD);
    source(ctx, 'Somali Government', E.o3(inv(0.6, 1.0, lt)));
  }, 'KHALIIJKA', [[0.3, 'horn', { dur: 1.4, gain: 0.7 }], [0.4, 'sea', { dur: 2.6, gain: 0.6 }]]);
  card(wt('s04', 'xajka') - 0.1, 's04', (ctx, lt) => {
    const p = E.io(inv(0.3, 1.3, lt));
    disc(ctx, CX - 130, 720, 230, WHITE); if (p > 0) { ctx.save(); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(CX - 130, 720); ctx.arc(CX - 130, 720, 220, -Math.PI / 2, -Math.PI / 2 + p * 0.8 * Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.save(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(CX + 280, 560, 60, 0, Math.PI * 2); ctx.arc(CX + 305, 545, 52, 0, Math.PI * 2, true); ctx.fill('evenodd'); ctx.restore();
    sheep(ctx, CX + 200, 1060, 200, WHITE); goat(ctx, CX + 360, 1060, 180, '#5b4636');
    bigNum(ctx, 80, CX - 130, 720, 110, inv(0.3, 1.3, lt), NAVY, (v) => Math.round(v) + '%+');
    source(ctx, 'Central Bank of Somalia', E.o3(inv(0.5, 0.9, lt)));
  }, 'XAJKA', [[0.1, 'pop'], [0.3, 'tick', { dur: 1.0 }]]);

  // ——— 5 · revenue nearly doubled in three years ($523M → $974M); livestock is most of the export earnings ———
  card(S('s05').t, 's05', (ctx, lt) => {
    const a = E.o3(inv(0.1, 0.6, lt)), b = E.o3(inv(0.8, 1.6, lt));
    rrect(ctx, CX - 330, 1040 - 300 * a, 240, 300 * a + 1, 26, mix(GOLD, CAMEL, 0.35)); rrect(ctx, CX + 90, 1040 - 560 * b, 240, 560 * b + 1, 26, GOLD);
    bigNum(ctx, 523, CX - 210, 1040 - 300 * a - 60, 64, inv(0.1, 0.6, lt), NAVY, (v) => '$' + Math.round(v) + 'M');
    bigNum(ctx, 974, CX + 210, 1040 - 560 * b - 60, 72, inv(0.8, 1.6, lt), NAVY, (v) => '$' + Math.round(v) + 'M');
    label(ctx, '2021', CX - 210, 1090, a, 30); label(ctx, '2024', CX + 210, 1090, b, 30);
    source(ctx, 'Somali Government', E.o3(inv(0.4, 0.8, lt)));
  }, '×2 DAKHLI', [[0.1, 'pop'], [0.8, 'tick', { dur: 0.8 }], [1.6, 'ding']]);
  card(wt('s05', 'xooluhu') - 0.1, 's05', (ctx, lt) => {
    const p = E.io(inv(0.2, 1.1, lt));
    disc(ctx, CX, 740, 280, WHITE); if (p > 0) { ctx.save(); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(CX, 740); ctx.arc(CX, 740, 270, -Math.PI / 2, -Math.PI / 2 + p * 0.6 * Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
    camel(ctx, CX + 90, 700, 170, NAVY);
    bigNum(ctx, 60, CX - 100, 880, 100, inv(0.2, 1.1, lt), NAVY, (v) => Math.round(v) + '%+');
    label(ctx, 'DHOOFINTA', CX, 1080, 1, 30); source(ctx, 'Somali Government · Central Bank', E.o3(inv(0.4, 0.8, lt)));
  }, 'INTA BADAN', [[0.2, 'coins'], [0.3, 'tick', { dur: 0.8 }]]);

  // ——— 6 · 'Maandeeq', the milk-camel; and that's why Somalia sells every year… (loop) ———
  card(S('s06').t, 's06', (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, W, H); ctx.fillStyle = SANDC; ctx.fillRect(0, 960, W, 300); });
    const st = E.io(inv(0.2, 1.6, lt)), sy = lerp(980, 560, st);
    ctx.save(); ctx.fillStyle = '#ffffff'; ctx.translate(CX + 170, sy); ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 40 : 100; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    camel(ctx, CX - 80, 1000, 430, '#ffffff', 0);
    pill(ctx, '1960', CX - 220, 470, NAVY, WHITE, E.oBack(inv(0.1, 0.4, lt)), 30);
  }, 'MAANDEEQ', [[0.1, 'whoosh', { dur: 0.8 }], [sinceW('s06', "'maandeeq',"), 'grunt', { gain: 0.6 }], [sinceW('s06', "'maandeeq',"), 'ding', { gain: 0.5 }]]);
  card(wt('s06', 'waana') - 0.1, 's06', (ctx, lt, P, t) => {
    // zoom back into the opening: the last frame runs straight into the first
    const p = E.io(inv(t - lt, DUR, t)), z = lerp(0.3, 1, p);
    ctx.save(); ctx.globalAlpha = 1 - p; camel(ctx, CX - 80, 1000, 430, '#ffffff', 0); ctx.restore();
    ctx.save(); ctx.translate(CX, 760); ctx.scale(z, z); ctx.translate(-CX, -760); opening(ctx, t - DUR); ctx.restore();
  }, '$1 BILYAN', [[0.1, 'whoosh', { dur: 0.8 }], [DUR - (wt('s06', 'waana') - 0.1) - 0.5, 'coins', { gain: 0.7 }]]);
  C[C.length - 1].loop = true;
  // the bouncing arrow lives outside the card (it points down at the comments, under the captions)

  C.forEach((c, i) => (c.t1 = i + 1 < C.length ? C[i + 1].t0 : DUR));

  // ───────── frame ─────────
  const layerA = G.canvas(), layerB = G.canvas();
  const bgPat = (key) => G.pattern(key, 11, { spread: 0.13, density: 0.38, set: 'sun', base: PAL[key].bg });
  const fullPat = (key) => G.pattern(key, 23, { spread: 1, density: 0.55, set: 'sun' });
  const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * 90 * Math.sin(2 * Math.PI * t / DUR);

  function background(ctx, key, t) {
    ctx.fillStyle = PAL[key].bg; ctx.fillRect(0, 0, W, H);
    G.drawPattern(ctx, bgPat(key), rowDrift(t));
    ctx.fillStyle = rgba(PAL[key].bg, 0.55); ctx.fillRect(0, 0, W, H);
    disc(ctx, CX, CY, R, PAL[key].t[4]);
    // one soft light sweep across the stage
    const g = ctx.createLinearGradient(CX - R, CY - R, CX + R, CY + R); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.fill();
  }
  function drawCard(ctx, c, t) {
    ctx.clearRect(0, 0, W, H);
    c.draw(ctx, t - c.t0, PAL[HUE[c.sc]], t);
  }
  const titleOf = (c, t) => (typeof c.title === 'function' ? c.title(t - c.t0) : c.title);
  function title(ctx, c, t, P) {
    const s = titleOf(c, t); if (!s) return;
    // the mask slide restarts whenever the title text changes
    let since = c.t0; for (let u = c.t0; u < t; u += 0.05) if (titleOf(c, u) !== titleOf(c, u - 0.05)) since = u;
    if (c.t0 === 0) since = -1;
    ctx.save(); ctx.font = '900 140px Montserrat'; ctx.letterSpacing = '-2px';
    const px = Math.min(140, Math.floor(140 * 960 / ctx.measureText(s).width)); ctx.restore();
    G.maskText(ctx, s, CX, TY, `900 ${px}px Montserrat`, INK, inv(since, since + 0.35, t), { align: 'center', ls: '-2px' });
    if (c.sc === 's01' || c.loop) G.maskText(ctx, KICK, CX, TY - 138, '800 40px Montserrat', PAL.sun.t[0], 1, { align: 'center', ls: '3px' });
  }
  const KICK = 'GANACSIGA XOOLAHA SOOMAALIYA';
  function hud(ctx, t, sc, P) {
    const n = SC.indexOf(sc) + 1, y = 318;
    ctx.save(); ctx.font = '500 26px "DM Mono"'; ctx.letterSpacing = '4px'; ctx.fillStyle = rgba(INK, 0.75); ctx.textBaseline = 'alphabetic';
    ctx.fillText('WAAYO? · XOOLAHA', 70, y);
    ctx.textAlign = 'right'; ctx.fillText(`${String(n).padStart(2, '0')} / ${String(SC.length).padStart(2, '0')}`, W - 70, y);
    ctx.restore();
    for (let i = 0; i < SC.length; i++) {
      const x = 70 + i * ((W - 140) / SC.length), w = (W - 140) / SC.length - 10;
      rrect(ctx, x, y + 18, w, i === n - 1 ? 10 : 6, 4, i < n - 1 ? rgba(INK, 0.35) : i === n - 1 ? INK : rgba(INK, 0.12));
    }
  }
  // karaoke captions: the line in phrase chunks of ≤ 2 lines, the spoken word in yellow
  const CAPF = '800 68px Montserrat', CAPY = 1310, LH = 86, CW = 940;
  const mctx = G.canvas(10, 10).getContext('2d'); mctx.font = CAPF;
  const CH = {};
  for (const s of SC) {
    const words = WD[s.id].map((x) => ({ ...x, t0: s.v + x.t0, t1: s.v + x.t1 })), chunks = [];
    let cur = [];
    const width = (ws) => mctx.measureText(ws.map((x) => x.w).join(' ')).width;
    const lines = (ws) => { const L = []; let l = []; for (const x of ws) { if (l.length && width([...l, x]) > CW) { L.push(l); l = []; } l.push(x); } if (l.length) L.push(l); return L; };
    words.forEach((x, i) => {
      cur.push(x);
      const nxt = words[i + 1], punct = /[,.…?]$/.test(x.w);
      if (!nxt) { chunks.push(cur); return; }
      if (lines([...cur, nxt]).length > 2 || (punct && cur.length >= 3)) { chunks.push(cur); cur = []; }
    });
    CH[s.id] = chunks.map((ws) => ({ ws, L: lines(ws), t0: ws[0].t0 }));
  }
  function captions(ctx, t, P, sc) {
    const list = CH[sc.id]; let ch = list[0];
    for (const c of list) if (t >= c.t0 - 0.05) ch = c;
    const n = ch.L.length, bh = n * LH + 56, y0 = CAPY + (2 - n) * LH * 0.5;
    rrect(ctx, 60, y0, W - 120, bh, 34, P.band);
    ctx.save(); ctx.font = CAPF; ctx.textBaseline = 'alphabetic';
    const sp = ctx.measureText(' ').width;
    ch.L.forEach((ln, i) => {
      const lw = ln.reduce((a, x) => a + ctx.measureText(x.w).width, 0) + sp * (ln.length - 1);
      let x = CX - lw / 2; const y = y0 + 28 + LH * (i + 0.78);
      for (const w of ln) {
        const ww = ctx.measureText(w.w).width, on = t >= w.t0 && t < w.t1 + 0.02, said = t >= w.t1;
        ctx.fillStyle = on ? SUNL : said ? CREAM : rgba(CREAM, 0.72);
        if (on) { const s = 1 + 0.06 * (1 - E.oExp(inv(w.t0, w.t0 + 0.18, t))); ctx.save(); ctx.translate(x + ww / 2, y - 20); ctx.scale(s, s); ctx.fillText(w.w, -ww / 2, 20); ctx.restore(); }
        else ctx.fillText(w.w, x, y);
        x += ww + sp;
      }
    });
    ctx.restore();
    return { y0, y1: y0 + bh, text: ch.ws.map((x) => x.w).join(' ') };
  }

  // chapter changes: full-contrast pattern rows slide across (in, then out), alternating directions
  const WIPES = SC.filter((s, i) => i > 0 && HUE[s.id] !== HUE[SC[i - 1].id]).map((s) => ({ t: s.t, key: HUE[s.id] }));
  const WIN = 0.24;
  function wipe(ctx, t) {
    for (const w of WIPES) {
      const a = t - (w.t - WIN), b = t - w.t;
      if (a < 0 || b > WIN) continue;
      const pin = E.ioExp(clamp(a / WIN)), pout = E.ioExp(clamp(b / WIN));
      const pat = fullPat(w.key), S0 = G.CELL;
      for (let j = 0; j < Math.ceil(H / S0) + 1; j++) {
        const dir = j % 2 ? 1 : -1, off = (1 - pin) * W * dir + pout * W * -dir;
        ctx.save(); ctx.beginPath(); ctx.rect(off, j * S0, W, S0); ctx.clip();
        ctx.drawImage(pat, -S0 + off, j * S0, pat.width, S0, -S0 + off, j * S0, pat.width, S0 + 0.5);
        ctx.restore();
      }
    }
  }
  // which content to show: during a chapter wipe the cut happens at its middle (t = scene start)
  const cardAt = (t) => { let c = C[0]; for (const x of C) if (t >= x.t0) c = x; return c; };
  const BAND = 0.32;
  function frame(ctx, t) {
    const sc = sceneAt(t), key = HUE[sc.id], P = PAL[key], c = cardAt(t), i = C.indexOf(c);
    background(ctx, key, t);
    // a card change inside a chapter: the old card slides out in bands while the new one slides in
    const prev = C[i - 1], lt = t - c.t0, isWipe = WIPES.some((w) => Math.abs(w.t - c.t0) < 0.01);
    if (prev && lt < BAND && !isWipe) {
      drawCard(layerA.getContext('2d'), prev, t); drawCard(layerB.getContext('2d'), c, t);
      const p = E.ioExp(lt / BAND), nb = 6, bh = 900 / nb;
      for (let j = 0; j < nb; j++) {
        const dir = j % 2 ? 1 : -1, y = 330 + j * bh;
        ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, bh + 1); ctx.clip();
        ctx.drawImage(layerA, -p * W * dir, 0); ctx.drawImage(layerB, (1 - p) * W * dir, 0); ctx.restore();
      }
    } else { drawCard(layerB.getContext('2d'), c, t); ctx.drawImage(layerB, 0, 0); }
    title(ctx, c, t, P);
    hud(ctx, t, sc, P);
    const cap = captions(ctx, t, P, sc);
    if (false) {   // the arrow points down to the comments
      const k = E.oBack(inv(0 + 0.6, 0 + 0.9, t));
      G.arrowDown(ctx, CX, cap.y1 + 66 + Math.abs(Math.sin(0 * 4)) * 14, 44 * k, INK);
    }
    wipe(ctx, t);
    watermark(ctx);
    return cap;
  }

  // channel watermark, top left (clear of the Shorts buttons on the right and at the bottom)
  function watermark(ctx) {
    ctx.save(); ctx.globalAlpha = 0.92;
    window.drawIcon(ctx, 70 + 42, 206, 84, { shadow: true });
    ctx.font = '800 36px Montserrat'; ctx.letterSpacing = '6px'; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
    ctx.fillText('FAHAAN', 172, 209); ctx.restore();
  }
  // ───────── sound events ─────────
  const EV = [];
  for (const s of SC) EV.push({ t: s.v, type: 'voice', id: s.id });
  for (const w of WIPES) EV.push({ t: +(w.t - WIN).toFixed(3), type: 'whoosh', dur: 0.6 });
  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));
  C.forEach((c, i) => { if (i && !WIPES.some((w) => Math.abs(w.t - c.t0) < 0.01)) EV.push({ t: +(c.t0 - 0.04).toFixed(3), type: 'whoosh', dur: 0.45, gain: 0.55 }); });
  EV.sort((a, b) => a.t - b.t);

  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  window.EV = EV;
  window.render = (t) => { frame(ctx, Math.min(t, DUR - 1e-3)); };
  window.TEXTS = (t) => {
    const out = [], sc = sceneAt(t), c = cardAt(t), s = titleOf(c, t);
    if (s) out.push({ id: 'title:' + s, text: s, x0: 60, y0: TY - 130, x1: W - 60, y1: TY + 20 });
    out.push({ id: 'wm', text: 'FAHAAN', x0: 70, y0: 160, x1: 360, y1: 250 });
    if (c.sc === 's01') out.push({ id: 'kick', text: KICK, x0: 100, y0: TY - 180, x1: W - 100, y1: TY - 125 });
    const list = CH[sc.id]; let ch = list[0]; for (const q of list) if (t >= q.t0 - 0.05) ch = q;
    out.push({ id: 'cap:' + sc.id + ':' + ch.t0, text: ch.ws.map((x) => x.w).join(' '), x0: 60, y0: 1300, x1: W - 60, y1: 1560 });
    return out;
  };
  window.CUES = SC.flatMap((s) => CH[s.id].map((c, i, a) => ({ t0: c.t0, t1: i + 1 < a.length ? a[i + 1].t0 : s.end, text: c.ws.map((x) => x.w).join(' ') })));
})();

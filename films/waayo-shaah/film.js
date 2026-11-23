// Waayo? · Shaah: the film (it loops: the last frame is the first) on one timeline. Scene times come from timeline.js (voice lengths), card changes from the
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
  const HUE = { s01: 'brown', s02: 'cream', s03: 'green', s04: 'red', s05: 'red', s06: 'brown', s07: 'red', s08: 'green', s09: 'brown' };
  const sceneAt = (t) => { let s = SC[0]; for (const x of SC) if (t >= x.t) s = x; return s; };
  const SUN = PAL.sun.t[2], SUNL = '#f2b25c';
  const CX = 540, CY = 740, R = 360;          // the stage disc
  const TY = 1252;                            // title baseline

  // ───────── cards: [start time, scene, draw(ctx, lt, P, t), title, title start] ─────────
  const C = [];
  const card = (t0, sc, draw, title, ev = []) => C.push({ t0, sc, draw, title, ev });

  // ═════════ the shaah story's cards (spliced into film.js by tools/splice.py) ═════════
  const BROWN = '#8b5a2b', CRM = '#f5e6d3', GREEN = '#6b8e4e', RED = '#b23a48', TEA = '#b5743c', SUGAR = '#ffffff';
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;
  const pill = (ctx, s, x, y, bg, fg, k = 1, px = 38) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.font = `800 ${px}px Montserrat`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s).width; rrect(ctx, x - tw / 2 - 22, y - px * 0.8, tw + 44, px * 1.6, px * 0.8, bg);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 2); ctx.restore();
  };
  const source = (ctx, s, k = 1) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.7 * clamp(k); ctx.font = '500 24px "DM Mono"'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s, CX, 1128); ctx.restore(); };
  const bigNum = (ctx, to, x, y, px, p, col, fmt = (v) => String(Math.round(v))) => {
    if (p <= 0) return; const k = E.oBack(clamp(p * 3), 1.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(to * E.o3(p)), 0, 0); ctx.restore();
  };
  const bigText = (ctx, s, x, y, px, k, col) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); };
  // a tea glass: (x, y) = bottom centre, h = height; sugar 0..1 is the mound at the bottom
  const glass = (ctx, x, y, h, sugar = 0, tea = TEA) => {
    const wt0 = h * 0.62, wb = h * 0.46;
    const path = () => { ctx.beginPath(); ctx.moveTo(x - wt0 / 2, y - h); ctx.lineTo(x + wt0 / 2, y - h); ctx.lineTo(x + wb / 2, y); ctx.lineTo(x - wb / 2, y); ctx.closePath(); };
    ctx.save(); path(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill(); ctx.clip();
    ctx.fillStyle = tea; ctx.fillRect(x - h, y - h * 0.86, h * 2, h);
    ctx.fillStyle = mix(tea, '#ffffff', 0.35); ctx.fillRect(x - h, y - h * 0.86, h * 2, h * 0.06);
    if (sugar > 0) { ctx.fillStyle = SUGAR; ctx.beginPath(); ctx.ellipse(x, y, wb * 0.45 * Math.min(1, 0.4 + sugar), h * 0.22 * sugar, 0, Math.PI, 0); ctx.fill(); }
    ctx.restore();
    ctx.save(); path(); ctx.strokeStyle = rgba(INK, 0.35); ctx.lineWidth = h * 0.02; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.5; G.seg(ctx, [x - wt0 * 0.36, y - h * 0.8], [x - wb * 0.33, y - h * 0.15], h * 0.03, '#ffffff'); ctx.restore();
  };
  // a spoon: bowl + handle; (x, y) = bowl centre, ang = tilt, sugar 0..1 heap
  const spoon = (ctx, x, y, s, ang, sugar = 1, col = '#b9bec7') => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    G.seg(ctx, [s * 0.35, 0], [s * 1.5, 0], s * 0.14, col);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    if (sugar > 0) { ctx.fillStyle = SUGAR; ctx.beginPath(); ctx.ellipse(0, -s * 0.08, s * 0.36, s * 0.24 * sugar, 0, Math.PI, 0); ctx.fill(); }
    ctx.restore();
  };
  const grains = (ctx, x, y0, y1, p, n = 14) => { if (p <= 0 || p >= 1) return; for (let i = 0; i < n; i++) { const u = clamp(p * 1.4 - G.hash(i) * 0.4); if (u <= 0 || u >= 1) continue; disc(ctx, x + (G.hash(i + 5) - 0.5) * 50, lerp(y0, y1, u), 5, SUGAR); } };
  const counter = (ctx, x, y, n, pop) => {
    disc(ctx, x, y, 110 * (1 + 0.12 * pop), INK);
    ctx.save(); ctx.fillStyle = CREAM; ctx.font = '900 130px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), x, y + 6); ctx.restore();
  };
  // ——— the opening shot (also the last shot: the film loops) ———
  const DROP = [0.35, 1.1, 1.85, 2.6];
  const opening = (ctx, lt) => {
    const gx = CX - 110, gy = 1080, gh = 460;
    let n = 0, pop = 0; DROP.forEach((d) => { if (lt >= d + 0.4) n++; pop = Math.max(pop, Math.exp(-Math.max(0, lt - d - 0.4) * 9) * (lt >= d + 0.4 ? 1 : 0)); });
    glass(ctx, gx, gy, gh, n / 5);
    // the current spoon: hovers, tips, pours, goes back up
    const cur = DROP.findIndex((d) => lt < d + 0.6), d = cur < 0 ? null : DROP[cur];
    if (d !== null && n < DROP.length) {
      const tip = E.io(inv(d, d + 0.25, lt)), up = E.io(inv(d + 0.45, d + 0.6, lt));
      spoon(ctx, gx - 20 + up * 30, 520 - up * 60, 110, -0.25 - tip * 0.9, 1 - E.o3(inv(d + 0.1, d + 0.4, lt)));
      grains(ctx, gx - 30, 560, gy - 80, inv(d + 0.1, d + 0.5, lt));
    }
    counter(ctx, CX + 270, 540, n, pop);
  };
  const clinks = (base = 0) => DROP.flatMap((d) => [[base + d + 0.12, 'sugar'], [base + d + 0.4, 'clink']]);

  // ——— 1 · hook: one glass of shaah… how many spoons? ———
  card(0, 's01', (ctx, lt) => opening(ctx, lt), 'WAAYO?', [[0.05, 'pour', { dur: 0.5, gain: 0.6 }], ...clinks()]);

  // ——— 2 · one teaspoon ≈ 4 g ———
  card(S('s02').t, 's02', (ctx, lt) => {
    const ta = sinceW('s02', 'afar') - 0.1;
    rrect(ctx, CX - 260, 860, 520, 220, 40, PAL.cream.t[0]); rrect(ctx, CX - 300, 820, 600, 50, 25, PAL.cream.t[1]);   // the scale
    rrect(ctx, CX - 170, 920, 340, 120, 24, INK);
    bigNum(ctx, 4, CX, 982, 84, inv(ta, ta + 0.7, lt), '#9fe0a0', (v) => '≈' + Math.round(v) + 'g');
    if (lt < ta) { ctx.save(); ctx.fillStyle = '#9fe0a0'; ctx.font = '900 84px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('0g', CX, 982); ctx.restore(); }
    const k = E.oBack(inv(0.1, 0.45, lt)); if (k > 0) spoon(ctx, CX - 60, lerp(560, 790, k), 130, 0);
  }, '1 QAADO ≈ 4g', [[0, 'pop'], [0.4, 'clink', { gain: 0.6 }], [sinceW('s02', 'afar') + 0.5, 'ding']]);

  // ——— 3 · the daily limit: 30 g, about 7 spoons (NHS) ———
  card(S('s03').t, 's03', (ctx, lt) => {
    const t30 = sinceW('s03', '30') - 0.1, t7 = sinceW('s03', '7') - 0.2;
    bigNum(ctx, 30, CX, 520, 170, inv(t30, t30 + 0.8, lt), GREEN, (v) => Math.round(v) + 'g');
    const b = E.o3(inv(t30, t30 + 0.6, lt));
    if (b > 0) { rrect(ctx, 120, 650, 840 * b, 74, 37, GREEN);
      ctx.save(); ctx.globalAlpha = clamp(b * 2 - 1); ctx.fillStyle = CREAM; ctx.font = '800 34px Montserrat'; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('XADKA MAALINTA: 30g', CX, 689); ctx.restore(); }
    for (let i = 0; i < 7; i++) { const k = E.oBack(inv(t7 + i * 0.07, t7 + 0.25 + i * 0.07, lt)); if (k > 0) spoon(ctx, 175 + i * 122, 800, 80 * k, -Math.PI / 2, 1); }
    const k0 = E.oBack(inv(0.1, 0.4, lt)) * (1 - E.o3(inv(t30 - 0.2, t30, lt)));
    if (k0 > 0) { ctx.save(); ctx.globalAlpha = k0; disc(ctx, CX, 760, 150, GREEN); ctx.fillStyle = CREAM; ctx.font = '900 70px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NHS', CX, 764); ctx.restore(); }
    source(ctx, 'NHS', E.o3(inv(t30 + 0.4, t30 + 0.8, lt)));
  }, 'XADKA MAALINTA', [[0.1, 'pop'], [sinceW('s03', '30') - 0.1, 'tick', { dur: 0.8 }], [sinceW('s03', '7') - 0.2, 'sugar'], [sinceW('s03', '7') + 0.4, 'pop']]);

  // ——— 4 · the maths: 3 glasses × 3 spoons = 9, past the limit ———
  card(S('s04').t, 's04', (ctx, lt) => {
    const tg = sinceW('s04', 'saddex') - 0.1, ts = sinceW('s04', 'saddex', 1) - 0.1, t9 = sinceW('s04', 'sagaal') - 0.1;
    const n = Math.min(9, Math.floor(Math.max(0, lt - ts) / ((t9 - ts) / 9)) + (lt > ts ? 1 : 0));
    // the limit bar under slots 1–7
    const over = n > 7, shake = over ? Math.sin(lt * 40) * 6 * Math.exp(-(lt - t9) * 2) : 0;
    rrect(ctx, 60 + shake, 620, 7 * 106 - 10, 26, 13, over ? RED : GREEN);
    for (let i = 0; i < 9; i++) { const k = i < n ? E.oBack(clamp((lt - ts - i * (t9 - ts) / 9) / 0.2)) : 0; if (k > 0) spoon(ctx, 105 + i * 106, 500, 66 * k, -Math.PI / 2, 1, i >= 7 ? mix('#b9bec7', RED, 0.6) : '#b9bec7'); }
    for (let g = 0; g < 3; g++) { const k = E.oBack(inv(tg + g * 0.15, tg + 0.4 + g * 0.15, lt)); if (k > 0) { ctx.save(); ctx.translate(240 + g * 300, 1090); ctx.scale(k, k); glass(ctx, 0, 0, 280, clamp((n - g * 3) / 3) * 0.7); ctx.restore(); } }
    bigNum(ctx, 9, CX, 760, 190, inv(t9, t9 + 0.5, lt), RED);
  }, (lt) => (lt < sinceW('s04', 'waa') - 0.1 ? 'SADDEX KOOB' : 'SHAAH KELIYA!'),
  [[sinceW('s04', 'saddex') - 0.1, 'pop'], [sinceW('s04', 'saddex', 1) - 0.1, 'sugar', { dur: 1.4 }], [sinceW('s04', 'sagaal') - 0.1, 'pop'], [sinceW('s04', 'sagaal'), 'whoosh', { dur: 0.6 }]]);

  // ——— 5 · too much sugar adds weight; sugary drinks raise type 2 diabetes risk (SACN) ———
  card(S('s05').t, 's05', (ctx, lt) => {
    const tc = sinceW('s05', 'cabitaannada') - 0.1, wide = 1 + 0.55 * E.io(inv(0.3, 1.6, lt)), m = E.oBack(inv(tc, tc + 0.35, lt));
    G.figure(ctx, CX - 190 + 40 * m * 0, 1090, 500, { skin: G.SKIN_D, cloth: PAL.red.t[1], wide });
    if (m > 0) {
      ctx.save(); ctx.translate(CX + 210, 700); ctx.scale(m, m); G.drop(ctx, 0, 40, 80, RED); ctx.restore();
      const lv = E.io(inv(tc + 0.4, tc + 2.4, lt));
      rrect(ctx, CX + 330, 560, 60, 420, 30, rgba(INK, 0.12)); rrect(ctx, CX + 330, 980 - 420 * (0.2 + 0.7 * lv), 60, 420 * (0.2 + 0.7 * lv), 30, mix(GREEN, RED, lv));
      G.arrowDown(ctx, CX + 360, 500 - 6 * Math.sin(lt * 5), -28 * clamp(lv * 3), RED);
    }
    source(ctx, 'SACN', E.o3(inv(tc + 0.6, tc + 1.0, lt)));
  }, (lt) => (lt < sinceW('s05', 'cabitaannada') - 0.1 ? 'MIISAAN' : 'SONKOROW'), [[0.05, 'pop'], [sinceW('s05', 'cabitaannada') - 0.1, 'pop'], [sinceW('s05', 'khatarta'), 'tick', { dur: 0.8 }]]);

  // ——— 6 · our risk: Minnesota 12% vs 5%; UK: 2–4× in Black Africans, from age 25 ———
  card(S('s06').t, 's06', (ctx, lt) => {
    const t12 = sinceW('s06', '12%') - 0.1, t5 = sinceW('s06', '5%') - 0.1;
    [[CX - 180, 12, RED, 'SOOMAALI', t12], [CX + 180, 5, BROWN, 'KUWA KALE', t5]].forEach(([x, v, col, lab, tt]) => {
      const p = E.o3(inv(tt, tt + 0.7, lt)), h = v * 34 * p;
      rrect(ctx, x - 90, 1010 - h, 180, Math.max(1, h), 24, col);
      bigNum(ctx, v, x, 1010 - h - 70, 96, inv(tt, tt + 0.7, lt), col, (q) => Math.round(q) + '%');
      ctx.save(); ctx.globalAlpha = clamp(p * 3); ctx.fillStyle = INK; ctx.font = '800 32px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(lab, x, 1058); ctx.restore();
    });
    pill(ctx, 'MINNESOTA', CX, 440, INK, CREAM, E.oBack(inv(0.1, 0.4, lt)), 28);
    source(ctx, 'Mayo Clinic', E.o3(inv(t12 + 0.3, t12 + 0.7, lt)));
  }, (lt) => (lt < sinceW('s06', '12%') - 0.1 ? 'DARAASAD' : 'SOOMAALIDA'), [[0.1, 'pop'], [sinceW('s06', '12%') - 0.1, 'tick', { dur: 0.7 }], [sinceW('s06', '5%') - 0.1, 'tick', { dur: 0.5 }]]);
  const UKL = window.LAND.filter((r) => { const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2; return cx > -11 && cx < 2 && cy > 49 && cy < 61; });
  const ukp = ([lon, lat]) => [260 + (lon + 5) * 34, 830 - (lat - 54) * 34 * 1.65];
  card(wt('s06', 'uk-gana') - 0.1, 's06', (ctx, lt) => {
    const b0 = sinceW('s06', 'uk-gana') - 0.1, tl = sinceW('s06', 'laba') - b0 - 0.1, tk = sinceW('s06', 'khatartuna') - b0 - 0.1;
    ctx.save(); ctx.globalAlpha = E.oExp(inv(0, 0.4, lt)); G.geo(ctx, UKL, ukp, BROWN); ctx.restore();
    bigText(ctx, '2–4×', 760, 720, 150, E.oBack(inv(tl, tl + 0.4, lt), 1.8), RED);
    const k = E.oBack(inv(tk, tk + 0.4, lt), 2);
    if (k > 0) { disc(ctx, 760, 960, 105 * k, GREEN); bigText(ctx, '25+', 760, 966, 84, k, CREAM); }
    source(ctx, 'Diabetes UK', E.o3(inv(tl + 0.3, tl + 0.7, lt)));
  }, (lt) => { const b0 = sinceW('s06', 'uk-gana') - 0.1; return lt < sinceW('s06', 'khatartuna') - b0 - 0.1 ? 'UK' : "DA'DA 25"; },
  [[0, 'whoosh', { dur: 0.7 }], [sinceW('s06', 'laba') - sinceW('s06', 'uk-gana'), 'pop'], [sinceW('s06', 'khatartuna') - sinceW('s06', 'uk-gana'), 'pop']]);

  // ——— 7 · diabetes can damage the eyes, kidneys, feet and heart ———
  const eye = (ctx, x, y, s) => {
    ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x, y - s * 0.9, x + s, y); ctx.quadraticCurveTo(x, y + s * 0.9, x - s, y); ctx.fill();
    ctx.lineWidth = s * 0.08; ctx.strokeStyle = INK; ctx.stroke(); disc(ctx, x, y, s * 0.36, BROWN); disc(ctx, x, y, s * 0.16, INK); ctx.restore();
  };
  const heart = (ctx, x, y, s, col) => { disc(ctx, x - s * 0.26, y - s * 0.12, s * 0.3, col); disc(ctx, x + s * 0.26, y - s * 0.12, s * 0.3, col); poly(ctx, [[x - s * 0.55, y - s * 0.02], [x + s * 0.55, y - s * 0.02], [x, y + s * 0.58]], col); };
  const kidneys = (ctx, x, y, s, col) => { for (const m of [-1, 1]) { ctx.save(); ctx.translate(x + m * s * 0.3, y); ctx.scale(m, 1); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.22, s * 0.36, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } };
  card(S('s07').t, 's07', (ctx, lt) => {
    const T = ['indhaha', 'kelyaha', 'cagaha', 'wadnaha'].map((w) => sinceW('s07', w) - 0.15);
    const P = [[CX - 225, 560], [CX + 225, 560], [CX - 225, 935], [CX + 225, 935]];
    P.forEach(([x, y], i) => {
      const k = E.oBack(inv(T[i], T[i] + 0.3, lt)); if (k <= 0) return;
      disc(ctx, x, y, 140 * k, '#ffffff');
      if (i === 0) eye(ctx, x, y, 115 * k);
      if (i === 1) kidneys(ctx, x, y, 215 * k, '#b5523f');
      if (i === 2) G.foot(ctx, x, y + 10, 115 * k, 0.4, BROWN);
      if (i === 3) heart(ctx, x, y, 210 * k, RED);
      const c = E.o3(inv(T[i] + 0.2, T[i] + 0.5, lt)); if (c > 0) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x + 70, y - 110); ctx.lineTo(x + 70 + 30 * c, y - 80 * c); ctx.lineTo(x + 50 + 40 * c, y - 40 * c); ctx.stroke(); ctx.restore(); }
    });
  }, 'DHAAWAC', [[sinceW('s07', 'indhaha') - 0.15, 'pop'], [sinceW('s07', 'kelyaha') - 0.15, 'pop'], [sinceW('s07', 'cagaha') - 0.15, 'pop'], [sinceW('s07', 'wadnaha') - 0.15, 'pop']]);

  // ——— 8 · small swaps: keep shaah; one spoon less each week; a smaller glass; cardamom and cinnamon; get checked ———
  card(S('s08').t, 's08', (ctx, lt) => {
    glass(ctx, CX - 80, 1080, 460, 0.4);
    const k = E.oBack(inv(0.15, 0.45, lt)); if (k > 0) { disc(ctx, CX + 240, 560, 90 * k, GREEN); G.tick(ctx, CX + 240, 560, 100 * k, CREAM, E.oExp(inv(0.25, 0.55, lt))); }
  }, 'HA JOOJIN!', [[0.15, 'pop'], [0.3, 'ding', { gain: 0.6 }]]);
  card(wt('s08', 'toddobaad') - 0.1, 's08', (ctx, lt) => {
    const b0 = sinceW('s08', 'toddobaad') - 0.1, th = sinceW('s08', 'hal') - b0;
    for (let i = 0; i < 3; i++) { const gone = i === 2 ? E.io(inv(th, th + 0.5, lt)) : 0; ctx.save(); ctx.globalAlpha = 1 - gone; spoon(ctx, 230 + i * 210, 760 - gone * 80, 80, -Math.PI / 2, 1); ctx.restore(); }
    const k = E.oBack(inv(th + 0.3, th + 0.6, lt)); if (k > 0) { disc(ctx, 860, 720, 90 * k, GREEN); bigText(ctx, '−1', 860, 726, 80, k, CREAM); }
    pill(ctx, 'TODDOBAAD KASTA', CX, 1000, INK, CREAM, E.oBack(inv(0.1, 0.4, lt)), 30);
  }, 'HA JOOJIN!', [[0, 'swipe'], [sinceW('s08', 'hal') - sinceW('s08', 'toddobaad') + 0.1, 'whoosh', { dur: 0.5 }], [sinceW('s08', 'hal') - sinceW('s08', 'toddobaad') + 0.4, 'pop']]);
  card(wt('s08', 'koob') - 0.1, 's08', (ctx, lt) => {
    const b0 = sinceW('s08', 'koob') - 0.1, th = sinceW('s08', 'hayl') - b0 - 0.1;
    const sz = lerp(460, 330, E.io(inv(0, 0.5, lt)));
    glass(ctx, CX, 1080, sz, 0.15);
    for (let i = 0; i < 3; i++) { const u = E.i3(inv(th + i * 0.15, th + 0.5 + i * 0.15, lt)); if (u <= 0 || u >= 1) continue; const x = CX - 50 + i * 50, y = lerp(420, 900, u);
      if (i === 1) rrect(ctx, x - 10, y - 60, 22, 120, 10, '#8a4f22'); else { ctx.save(); ctx.translate(x, y); ctx.rotate(0.6 * i); ctx.fillStyle = GREEN; ctx.beginPath(); ctx.ellipse(0, 0, 18, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
    const h = E.oBack(inv(th + 0.7, th + 1.0, lt)); if (h > 0) { ctx.save(); ctx.translate(CX + 260, 660); ctx.scale(h, h);
      ctx.fillStyle = GREEN; ctx.beginPath(); ctx.ellipse(-40, 0, 26, 44, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(10, 10, 26, 44, 0.3, 0, Math.PI * 2); ctx.fill();
      rrect(ctx, 50, -60, 26, 130, 12, '#8a4f22'); rrect(ctx, 82, -50, 26, 130, 12, '#a0612d'); ctx.restore(); }
  }, 'KOOB YAR · HAYL',
  [[0, 'whoosh', { dur: 0.5 }], [sinceW('s08', 'hayl') - sinceW('s08', 'koob'), 'sugar', { dur: 0.6 }], [sinceW('s08', 'hayl') - sinceW('s08', 'koob') + 0.7, 'pop']]);
  card(wt('s08', 'sidoo') - 0.1, 's08', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt));
    ctx.save(); ctx.translate(CX - 80, 1060); ctx.scale(k, k); G.tube(ctx, 0, 0, 480, CREAM, RED, GREEN, E.io3(inv(0.3, 1.2, lt)) * 0.6); ctx.restore();
    const c = E.oBack(inv(1.0, 1.3, lt)); if (c > 0) { disc(ctx, CX + 200, 760, 90 * c, GREEN); G.tick(ctx, CX + 200, 760, 100 * c, CREAM, E.oExp(inv(1.1, 1.4, lt))); }
  }, 'BAAR SONKORTA', [[0, 'pop'], [1.0, 'ding', { gain: 0.6 }]]);

  // ——— 9 · not medical advice… then back to the opening shot (the loop) ———
  card(S('s09').t, 's09', (ctx, lt) => {
    const k = E.oBack(inv(0.05, 0.4, lt));
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k);
    rrect(ctx, -380, -150, 760, 300, 40, CREAM);
    disc(ctx, -260, 0, 62, PAL.amber.t[2]);
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 80px Montserrat'; ctx.fillText('i', -260, 4);
    ctx.textAlign = 'left'; ctx.font = '800 40px Montserrat'; ctx.fillText('Talo caafimaad', -170, -30); ctx.fillText('maaha.', -170, 22);
    ctx.font = '800 30px Montserrat'; ctx.fillStyle = rgba(INK, 0.75); ctx.fillText('La tasho dhakhtarkaaga.', -170, 84);
    ctx.restore();
  }, '', [[0.05, 'pop']]);
  card(wt('s09', 'adiga…') - 0.1, 's09', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : Math.min(lt, 3.3)), 'WAAYO?', [[0, 'whoosh', { dur: 0.5 }], ...clinks(), [DUR - 0.5 - (wt('s09', 'adiga…') - 0.1), 'pour', { dur: 0.45, gain: 0.6 }]]);
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
  const KICK = 'SHAAH · SONKOR';
  function hud(ctx, t, sc, P) {
    const n = SC.indexOf(sc) + 1, y = 318;
    ctx.save(); ctx.font = '500 26px "DM Mono"'; ctx.letterSpacing = '4px'; ctx.fillStyle = rgba(INK, 0.75); ctx.textBaseline = 'alphabetic';
    ctx.fillText('WAAYO? · SHAAH', 70, y);
    ctx.textAlign = 'right'; ctx.fillText(`${String(n).padStart(2, '0')} / ${String(SC.length).padStart(2, '0')}`, W - 70, y);
    ctx.restore();
    for (let i = 0; i < SC.length; i++) {
      const x = 70 + i * ((W - 140) / SC.length), w = (W - 140) / SC.length - 10;
      rrect(ctx, x, y + 18, w, i === n - 1 ? 10 : 6, 4, i < n - 1 ? rgba(INK, 0.35) : i === n - 1 ? INK : rgba(INK, 0.12));
    }
  }
  // karaoke captions: the line in phrase chunks of ≤ 2 lines, the spoken word in yellow
  const CAPF = '800 58px Montserrat', CAPY = 1330, LH = 76, CW = 900;
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
    const edge = Math.min(inv(0, 0.2, t), 1 - inv(DUR - 0.55, DUR - 0.15, t));
    ctx.save(); ctx.globalAlpha = edge; hud(ctx, t, sc, P);
    const cap = captions(ctx, t, P, sc); ctx.restore();
    if (false) {   // the arrow points down to the comments
      const k = E.oBack(inv(wt('s08', 'maxaad') + 0.6, wt('s08', 'maxaad') + 0.9, t));
      G.arrowDown(ctx, CX, cap.y1 + 66 + Math.abs(Math.sin((t - s8.t) * 4)) * 14, 44 * k, INK);
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

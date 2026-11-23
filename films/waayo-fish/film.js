// Waayo? · Kalluunka: the film (it loops: the last frame is the first) on one timeline. Scene times come from timeline.js (voice lengths), card changes from the
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
  const HUE = { s01: 'aqua', s02: 'sand', s03: 'teal', s04: 'navy', s05: 'teal', s06: 'coral', s07: 'sand', s08: 'aqua' };
  const sceneAt = (t) => { let s = SC[0]; for (const x of SC) if (t >= x.t) s = x; return s; };
  const SUN = PAL.sun.t[2], SUNL = '#ee6c4d';
  const CX = 540, CY = 740, R = 360;          // the stage disc
  const TY = 1252;                            // title baseline

  // ───────── cards: [start time, scene, draw(ctx, lt, P, t), title, title start] ─────────
  const C = [];
  const card = (t0, sc, draw, title, ev = []) => C.push({ t0, sc, draw, title, ev });

  // ═════════ the fish story's cards (spliced into film.js by tools/splice.py) ═════════
  const NAVY = '#0b2545', TEAL = '#13a89e', AQUA = '#8fe3e0', SAND = '#e9d8a6', CORAL = '#ee6c4d', GLOW = '#d6fff4';
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
  const flow = (ctx, a, b, lt, col, p = 1, w = 10) => {
    if (p <= 0) return;
    const e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash([w * 2.6, w * 2.2]); ctx.lineDashOffset = -lt * 110;
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...e); ctx.stroke(); ctx.setLineDash([]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = w * 2.6;
    ctx.beginPath(); ctx.moveTo(e[0] - Math.cos(ang - 0.6) * h, e[1] - Math.sin(ang - 0.6) * h); ctx.lineTo(...e); ctx.lineTo(e[0] - Math.cos(ang + 0.6) * h, e[1] - Math.sin(ang + 0.6) * h); ctx.stroke();
    ctx.restore();
  };
  // fish: an oval body and a tail (no eyes); ang = heading
  const fish = (ctx, x, y, s, ang, col, tail = col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    poly(ctx, [[-s * 0.7, 0], [-s * 1.15, -s * 0.42], [-s * 1.15, s * 0.42]], tail);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  // tuna: long body, forked tail, fins, a row of finlets
  const tuna = (ctx, x, y, s, col, belly) => {
    ctx.save(); ctx.translate(x, y);
    poly(ctx, [[-s * 0.9, 0], [-s * 1.35, -s * 0.5], [-s * 1.12, 0], [-s * 1.35, s * 0.5]], col);
    poly(ctx, [[-s * 0.1, -s * 0.28], [s * 0.15, -s * 0.62], [s * 0.3, -s * 0.24]], col);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.34, 0, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = belly; ctx.fillRect(-s, s * 0.04, s * 2, s); ctx.restore();
    for (let i = 0; i < 4; i++) disc(ctx, -s * (0.45 + i * 0.12), -s * 0.3 + i * 0.03 * s, s * 0.04, CORAL);
    poly(ctx, [[s * 0.2, s * 0.1], [-s * 0.15, s * 0.42], [s * 0.05, s * 0.12]], mix(col, '#000', 0.2));
    ctx.restore();
  };
  const plankton = (ctx, x, y, s, lt, a = 1) => {
    for (let i = 0; i < 26; i++) { const r = G.hash(i + 5), q = G.hash(i + 61), ang = r * 6.28 + lt * 0.4 * (q - 0.5);
      const d = s * Math.sqrt(q) * 0.9; disc(ctx, x + Math.cos(ang) * d, y + Math.sin(ang) * d, s * (0.05 + 0.04 * G.hash(i + 9)) * a, i % 3 ? TEAL : PAL.teal.t[0]); }
  };
  const horn = ([lon, lat]) => [CX + (lon - 46.5) * 40, CY - (lat - 5.5) * 40];
  const clipStage = (ctx, f) => { ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip(); f(); ctx.restore(); };
  const hornMap = (ctx, land = SAND, som = mix(SAND, '#c9a86a', 0.5)) => clipStage(ctx, () => { G.geo(ctx, window.HORN, horn, land); G.geo(ctx, window.SOM, horn, som); });
  const coastLine = (ctx, p, col, w = 14) => {
    const C = window.COAST, n = Math.floor((C.length - 1) * clamp(p)); if (n < 1) return;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const q = horn(C[i]); i ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke(); ctx.restore();
    return horn(C[n]);
  };
  const OFF = [[44.5, 12.6], [48.5, 12.4], [51.9, 11.6], [51.3, 8.6], [49.6, 5.6], [47.0, 2.4], [44.0, -0.6]];   // a path just offshore

  // ——— 1 · hook: one of the world's richest seas… why? ———
  const opening = (ctx, lt) => {
    hornMap(ctx);
    // a shoal bursts across, curving round the Horn
    for (let i = 0; i < 34; i++) {
      const u = (lt * 0.55 + G.hash(i) * 0.25) % 1.4 - 0.2, off = (G.hash(i + 7) - 0.5) * 140;
      const x = lerp(-80, W + 80, u), y = 760 + Math.sin(u * 5) * 160 + off, y2 = 760 + Math.sin((u + 0.01) * 5) * 160 + off;
      if (lt < G.hash(i + 3) * 0.4) continue;
      fish(ctx, x, y, 26 + 10 * G.hash(i + 11), Math.atan2(y2 - y, 10), i % 4 ? TEAL : NAVY);
    }
  };
  card(0, 's01', (ctx, lt) => opening(ctx, lt), 'WAAYO?', [[0.05, 'splash'], [0.1, 'whoosh', { dur: 1.0 }], [0.2, 'sea', { dur: 4.0, gain: 0.8 }]]);
  card(wt('s01', 'kalluunka') - 0.15, 's01', (ctx, lt) => {
    // the stage fills with fish circling
    clipStage(ctx, () => { ctx.fillStyle = PAL.aqua.t[3]; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { const r = 60 + G.hash(i) * 300, a = G.hash(i + 30) * 6.28 + lt * (0.6 + 0.4 * G.hash(i + 2)), k = E.oBack(inv(G.hash(i + 4) * 0.5, 0.3 + G.hash(i + 4) * 0.5, lt));
        if (k > 0) fish(ctx, CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.9, (20 + 14 * G.hash(i + 8)) * k, a + Math.PI / 2, i % 3 ? TEAL : NAVY); } });
  }, 'WAAYO?', [[0, 'bubbles', { dur: 1.2 }], [0.2, 'pop']]);
  card(wt('s01', 'waayo?') - 0.1, 's01', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt), 2.2);
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k); disc(ctx, 0, 0, 290, CORAL);
    ctx.fillStyle = CREAM; ctx.font = '900 400px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 8, 18); ctx.restore();
    const f = E.oBack(inv(0.3, 0.6, lt)); if (f > 0) fish(ctx, CX + 240, CY + 250, 70 * f, -0.3, TEAL);
  }, 'WAAYO?', [[0, 'pop'], [0.3, 'splash', { gain: 0.6 }]]);

  // ——— 2 · the longest coast in mainland Africa: about 3,333 km ———
  const coastD = (ctx, lt) => {
    const t0 = sinceW('s02', 'xeebta') - 0.2, tn = sinceW('s02', '3,333');
    hornMap(ctx);
    clipStage(ctx, () => { const e = coastLine(ctx, E.io(inv(t0, tn + 0.8, lt)), CORAL); if (e && lt < tn + 0.8) disc(ctx, e[0], e[1], 18, CORAL); });
    pill(ctx, 'GACANKA CADMEED', CX - 170, 430, NAVY, CREAM, E.oBack(inv(t0, t0 + 0.3, lt)), 26);
    pill(ctx, 'RAS CASEYR', 880, 600, NAVY, CREAM, E.oBack(inv(t0 + 1.2, t0 + 1.5, lt)), 24);
    pill(ctx, 'BADWEYNTA HINDIYA', CX + 130, 1010, NAVY, CREAM, E.oBack(inv(t0 + 2.2, t0 + 2.5, lt)), 24);
    const p = inv(tn - 0.1, tn + 1.4, lt);
    if (p > 0) { ctx.save(); ctx.globalAlpha = clamp(p * 4) * 0.82; disc(ctx, CX, 760, 250, CREAM); ctx.restore(); }
    bigNum(ctx, 3333, CX, 730, 150, p, CORAL, (v) => Math.round(v).toLocaleString('en-US'));
    if (p > 0) { ctx.save(); ctx.globalAlpha = clamp(p * 3); ctx.fillStyle = NAVY; ctx.font = '900 70px Montserrat'; ctx.textAlign = 'center'; ctx.fillText('KM', CX, 850); ctx.restore(); }
  };
  card(S('s02').t, 's02', coastD, 'XEEBTA UGU DHEER', [[sinceW('s02', 'xeebta') - 0.2, 'whoosh', { dur: 2.0, gain: 0.6 }]]);
  const coastDo = wt('s02', '3,333', 0) - 0.1 - S('s02').t;
  card(S('s02').t + coastDo, 's02', (ctx, lt) => coastD(ctx, lt + coastDo), 'AFRIKA #1', [[0, 'tick', { dur: 1.2 }], [1.3, 'pop']]);

  // ——— 3 · Xagaa: strong south-west monsoon winds along the coast ———
  card(S('s03').t, 's03', (ctx, lt) => {
    const td = sinceW('s03', 'dabaylo') - 0.2;
    hornMap(ctx);
    for (let r = 0; r < 3; r++) for (let i = OFF.length - 1; i > 3; i--) {
      const a = horn([OFF[i][0] + r * 1.1, OFF[i][1] - r * 0.4]), b = horn([OFF[i - 1][0] + r * 1.1, OFF[i - 1][1] - r * 0.4]);
      flow(ctx, a, b, lt, CORAL, E.o3(inv(td + (6 - i) * 0.15 + r * 0.1, td + 0.5 + (6 - i) * 0.15 + r * 0.1, lt)), 11);
    }
    pill(ctx, 'MAY–SEP', CX + 250, 470, NAVY, CREAM, E.oBack(inv(0.2, 0.5, lt)), 30);
  }, 'XAGAA', [[0.1, 'pop'], [sinceW('s03', 'dabaylo') - 0.2, 'gust', { dur: 1.6 }], [sinceW('s03', 'dabaylo') + 0.3, 'wind', { dur: 3.5, gain: 0.7 }]]);
  card(wt('s03', 'ayaa') - 0.1, 's03', (ctx, lt) => {
    // close up: the shore, waves, wind streaming along it
    clipStage(ctx, () => {
      ctx.fillStyle = PAL.aqua.t[3]; ctx.fillRect(0, 0, W, H);
      poly(ctx, [[0, 1150], [0, 560], [380, 1150]], SAND);
      for (let j = 0; j < 6; j++) { const y = 560 + j * 95, x0 = 300 + j * 60, o = (lt * 60 + j * 40) % 120;
        ctx.save(); ctx.strokeStyle = CREAM; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
        for (let x = x0 - o; x < W; x += 120) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 22, x + 60, y); } ctx.stroke(); ctx.restore(); }
    });
    for (let i = 0; i < 4; i++) flow(ctx, [400 + i * 90, 1080 - i * 30], [760 + i * 90, 440 - i * 30], lt, CORAL, E.o3(inv(0.1 + i * 0.1, 0.6 + i * 0.1, lt)), 12);
  }, 'KOONFUR-GALBEED', [[0, 'swipe'], [0.1, 'gust', { dur: 1.4 }]]);

  // ——— 4 · upwelling: the wind pushes warm water away; cold, nutrient-rich water rises ———
  const upD = (ctx, lt) => {
    const tm = sinceW('s04', 'markaas'), push = E.io(inv(0.4, tm, lt)), rise = E.io(inv(tm - 0.1, tm + 1.8, lt));
    clipStage(ctx, () => {
      ctx.fillStyle = '#eaf6fb'; ctx.fillRect(0, 0, W, 560);
      ctx.fillStyle = PAL.navy.t[1]; ctx.fillRect(0, 560, W, 700);                       // deep cold water
      // warm surface layer, slid away from the shore
      const wx = 300 + push * 250; rrect(ctx, wx, 560, W, 120, 0, AQUA);
      // the cold water rising into the gap near the shore, with nutrients
      if (rise > 0) { ctx.fillStyle = PAL.navy.t[2]; ctx.beginPath(); ctx.moveTo(260, 1150); ctx.lineTo(260, lerp(1150, 560, rise)); ctx.lineTo(wx + 10, 560 + (1 - rise) * 120); ctx.lineTo(wx + 10, 1150); ctx.closePath(); ctx.fill(); }
      for (let i = 0; i < 40; i++) { const u = ((lt * 0.25 + G.hash(i)) % 1), y = lerp(1120, 580, u) , x = 300 + G.hash(i + 9) * 380 + Math.sin(lt * 2 + i) * 10;
        if (y > lerp(1150, 560, rise) - 10) disc(ctx, x, y, 5 + 4 * G.hash(i + 2), rgba(GLOW, 0.9)); }
      poly(ctx, [[0, 470], [300, 560], [260, 1150], [0, 1150]], SAND);                      // the shore and shelf
    });
    flow(ctx, [380, 500], [800, 500], lt, CORAL, E.o3(inv(0.1, 0.6, lt)), 12);               // the wind, offshore
    for (let i = 0; i < 3; i++) flow(ctx, [380 + i * 110, 1060], [380 + i * 110, 760], lt, GLOW, E.o3(inv(tm + i * 0.15, tm + 0.7 + i * 0.15, lt)), 11);
    pill(ctx, 'BIYO KULUL', 820, 640, CORAL, CREAM, E.oBack(inv(sinceW('s04', 'kulul') - 0.1, sinceW('s04', 'kulul') + 0.2, lt)), 26);
    pill(ctx, 'BIYO QABOW + NAFAQO', CX + 40, 1060, CREAM, NAVY, E.oBack(inv(sinceW('s04', 'qabow') - 0.1, sinceW('s04', 'qabow') + 0.2, lt)), 26);
    pill(ctx, 'XEEB', 150, 470, NAVY, CREAM, 1, 24);
  };
  card(S('s04').t, 's04', upD, 'BIYO KULUL', [[0.2, 'sea', { dur: 3.0, gain: 0.7 }], [0.4, 'whoosh', { dur: 1.0 }]]);
  const upDo = wt('s04', 'markaas', 0) - 0.1 - S('s04').t;
  card(S('s04').t + upDo, 's04', (ctx, lt) => upD(ctx, lt + upDo), 'BIYO QABOW', [[0, 'bubbles', { dur: 2.0 }]]);

  // ——— 5 · the food chain: plankton → small fish → bigger fish → tuna ———
  card(S('s05').t, 's05', (ctx, lt) => {
    const T = [0.1, sinceW('s05', 'dhir') - 0.1, sinceW('s05', 'quudiya') - 0.1, sinceW('s05', 'kadibna') - 0.1, sinceW('s05', 'tuunada') - 0.2];
    const P = [[290, 540, 120], [790, 540, 130], [290, 930, 150], [790, 930, 170]];
    // nutrients gather into the first disc
    for (let i = 0; i < 14; i++) { const u = E.io3(inv(0, T[1] + 0.2, lt)), a = G.hash(i) * 6.28; disc(ctx, lerp(CX + Math.cos(a) * 420, 290, u), lerp(760 + Math.sin(a) * 380, 540, u), 8, rgba(GLOW, 1 - inv(T[1] + 0.1, T[1] + 0.4, lt)) ); }
    P.forEach(([x, y, r], i) => {
      const k = E.oBack(inv(T[i + 1], T[i + 1] + 0.3, lt)); if (k <= 0) return;
      disc(ctx, x, y, r * k, i === 3 ? PAL.coral.t[4] : CREAM);
      if (i === 0) plankton(ctx, x, y, r * 0.8 * k, lt);
      if (i === 1) for (let j = 0; j < 3; j++) fish(ctx, x - 30 + j * 30, y - 55 + j * 55, 40 * k, 0, TEAL);
      if (i === 2) fish(ctx, x + 15, y, 85 * k, 0, PAL.teal.t[0]);
      if (i === 3) tuna(ctx, x + 20, y, 115 * k, NAVY, PAL.navy.t[3]);
      if (i > 0) { const [px, py] = P[i - 1], a = E.o3(inv(T[i + 1] - 0.1, T[i + 1] + 0.3, lt));
        const from = i === 2 ? [px - 60, py + 140] : [px + P[i - 1][2] + 10, py], to = i === 2 ? [x + 60, y - 160] : [x - r - 20, y];
        if (i === 2) flow(ctx, [px, py + P[i - 1][2] + 10], [x, y - r - 20], lt, CORAL, a, 12); else flow(ctx, from, to, lt, CORAL, a, 12); }
    });
  }, (lt) => { const a = sinceW('s05', 'kuwaasoo') - 0.1, b = sinceW('s05', 'kadibna') - 0.1; return lt < a ? 'DHIR YARYAR' : lt < b ? 'KALLUUN YARYAR' : 'TUUNA'; },
  [[sinceW('s05', 'dhir') - 0.1, 'pop'], [sinceW('s05', 'quudiya') - 0.1, 'pop'], [sinceW('s05', 'kadibna') - 0.1, 'pop'], [sinceW('s05', 'tuunada') - 0.2, 'pop'], [sinceW('s05', 'tuunada'), 'splash', { gain: 0.5 }]]);

  // ——— 6 · the strongest upwelling in the world at its peak ———
  const wp = ([lon, lat]) => [CX + (lon - 30) * 5.2, CY - (lat - 5) * 5.2 * 1.12];
  const worldD = (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = PAL.aqua.t[4]; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.LAND, wp, SAND); G.geo(ctx, window.SOM, wp, mix(SAND, '#c9a86a', 0.6)); });
    const s = wp([55.5, 8]);
    for (let i = 0; i < 3; i++) { const u = (lt * 0.7 + i / 3) % 1; G.ring(ctx, s[0], s[1], 20 + u * 95, 10 * (1 - u), rgba(CORAL, 1 - u)); }
    disc(ctx, s[0], s[1], 24, CORAL);
    const tx = sinceW('s06', 'xoogga') - 0.2, k = E.oBack(inv(tx, tx + 0.35, lt), 2.2);
    if (k > 0) { disc(ctx, s[0] + 150, s[1] - 170, 105 * k, CORAL); ctx.save(); ctx.fillStyle = CREAM; ctx.font = `900 ${Math.round(110 * k)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('#1', s[0] + 150, s[1] - 162); ctx.restore(); }
    source(ctx, 'NOC', E.o3(inv(tx + 0.4, tx + 0.8, lt)));
  };
  card(S('s06').t, 's06', worldD, 'SAYNISKA', [[0.4, 'bubbles', { dur: 1.0, gain: 0.6 }]]);
  const worldDo = wt('s06', 'xoogga', 0) - 0.1 - S('s06').t;
  card(S('s06').t + worldDo, 's06', (ctx, lt) => worldD(ctx, lt + worldDo), 'UGU XOOGGA BADAN', [[0.1, 'pop'], [0.3, 'sparkle', { dur: 0.7 }]]);

  // ——— 7 · the twist: Somalis eat among the least fish in the world ———
  card(S('s07').t, 's07', (ctx, lt) => {
    const ty = sinceW('s07', 'kalluun') - 0.1;
    // a sea full of fish (left)
    const a = E.oBack(inv(0, 0.35, lt));
    if (a > 0) { ctx.save(); ctx.beginPath(); ctx.arc(300, 760, 230 * a, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = PAL.teal.t[3]; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) { const x = 100 + ((G.hash(i) * 400 + lt * 40 * (i % 2 ? 1 : -1)) % 420 + 420) % 420, y = 560 + G.hash(i + 20) * 400; fish(ctx, x, y, 24, i % 2 ? 0 : Math.PI, i % 3 ? TEAL : NAVY); }
      ctx.restore(); }
    // a nearly empty plate (right)
    const b = E.oBack(inv(0.5, 0.85, lt));
    if (b > 0) { disc(ctx, 790, 760, 200 * b, '#ffffff'); G.ring(ctx, 790, 760, 150 * b, 8, rgba(NAVY, 0.12));
      ctx.save(); ctx.strokeStyle = rgba(NAVY, 0.55); ctx.lineWidth = 6; ctx.lineCap = 'round'; const fx = 800, fy = 770;
      ctx.beginPath(); ctx.moveTo(fx - 40 * b, fy); ctx.lineTo(fx + 40 * b, fy); for (let j = -1; j <= 1; j++) { ctx.moveTo(fx + j * 20 * b, fy - 14 * b); ctx.lineTo(fx + j * 20 * b, fy + 14 * b); } ctx.stroke(); ctx.restore(); }
    const q = E.oBack(inv(ty, ty + 0.35, lt), 2.2);
    if (q > 0) { disc(ctx, CX, 1000, 80 * q, CORAL); ctx.save(); ctx.fillStyle = CREAM; ctx.font = `900 ${Math.round(110 * q)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', CX + 3, 1006); ctx.restore(); }
    source(ctx, 'FAO', E.o3(inv(ty + 0.3, ty + 0.7, lt)));
  }, 'LA YAAB!', [[0, 'pop'], [0.5, 'pop'], [sinceW('s07', 'kalluun') - 0.1, 'pop']]);

  // ——— 8 · do you eat fish? tell us (+ subscribe on screen) ———
  const s8 = S('s08');
  card(S('s08').t, 's08', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.4, lt), 1.8), b = E.oBack(inv(0.3, 0.6, lt));
    if (b > 0) { ctx.save(); ctx.translate(CX, 600); ctx.scale(b, b); G.bubble(ctx, 0, 0, 700, 260, CREAM);
      fish(ctx, -150, 0, 46, 0, TEAL); for (let i = 0; i < 3; i++) disc(ctx, 20 + i * 90, 0, 24 * (0.75 + 0.25 * Math.sin(lt * 6 - i)), CORAL); ctx.restore(); }
    ctx.save(); ctx.translate(CX, 930); ctx.scale(k, k); ctx.fillStyle = INK; ctx.font = '900 170px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('WAAYO?', 0, 0); ctx.restore();
    const s = E.oBack(inv(0.5, 0.85, lt), 1.6);
    if (s > 0) {
      ctx.save(); ctx.translate(CX, 1150); ctx.scale(s, s);
      disc(ctx, -300, 0, 62, AQUA); ctx.save(); ctx.translate(-300, 10); ctx.scale(0.5, 0.5); G.thumb(ctx, 0, 0, 170, CREAM, INK, TEAL); ctx.restore();
      const done = lt > 1.25; rrect(ctx, -210, -52, 470, 104, 52, done ? INK : CORAL);
      G.bell(ctx, -150, -2, 44, CREAM); ctx.fillStyle = CREAM; ctx.font = '900 40px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SUBSCRIBE', -100, 3);
      if (done) { const q = E.oBack(inv(1.25, 1.5, lt)); disc(ctx, 262, -50, 34 * q, TEAL); G.tick(ctx, 262, -50, 40 * q, CREAM, E.oExp(inv(1.3, 1.6, lt))); }
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.7 * E.o3(inv(0.6, 1.0, lt)); ctx.font = '500 24px "DM Mono"'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('NOC, FAO', CX, 400); ctx.restore();
  }, '', [[0, 'pop'], [0.3, 'pop'], [0.5, 'pop'], [1.25, 'click'], [1.4, 'sparkle', { dur: 0.6 }]]);
  card(S('s08').v + S('s08').vd + 0.15, 's08', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : lt), 'WAAYO?', [[0.05, 'splash', { gain: 0.6 }]]);
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
  const KICK = 'BADDA SOOMAALIYA · KALLUUNKA';
  function hud(ctx, t, sc, P) {
    const n = SC.indexOf(sc) + 1, y = 318;
    ctx.save(); ctx.font = '500 26px "DM Mono"'; ctx.letterSpacing = '4px'; ctx.fillStyle = rgba(INK, 0.75); ctx.textBaseline = 'alphabetic';
    ctx.fillText('WAAYO? · KALLUUN', 70, y);
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

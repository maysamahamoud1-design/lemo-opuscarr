// Waayo? · Beeyo: the film (it loops: the last frame is the first) on one timeline. Scene times come from timeline.js (voice lengths), card changes from the
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
  const HUE = { s01: 'sand', s02: 'amber', s03: 'olive', s04: 'amber', s05: 'terra', s06: 'olive', s07: 'terra', s08: 'sand' };
  const sceneAt = (t) => { let s = SC[0]; for (const x of SC) if (t >= x.t) s = x; return s; };
  const SUN = PAL.sun.t[2], SUNL = '#f0b347';
  const CX = 540, CY = 740, R = 360;          // the stage disc
  const TY = 1252;                            // title baseline

  // ───────── cards: [start time, scene, draw(ctx, lt, P, t), title, title start] ─────────
  const C = [];
  const card = (t0, sc, draw, title, ev = []) => C.push({ t0, sc, draw, title, ev });

  // ═════════ the frankincense story's cards (spliced into film.js by tools/splice.py) ═════════
  const SANDC = '#e8d5b0', AMB = '#d99a2b', OLV = '#6b7a3a', TER = '#b5523b', DBR = '#3e2c23', BARK = '#8a6f55', PAPER = '#d8c8ad', MILK = '#fbf6ea';
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;
  const split2 = (tw, t0, sc, D, T, ev = [], ev2 = []) => { card(t0, sc, D, T, ev); const off = tw - 0.1 - t0;
    card(t0 + off, sc, (ctx, lt, P, t) => D(ctx, lt + off, P, t), typeof T === 'function' ? (lt) => T(lt + off) : T, ev2); };
  const pill = (ctx, s, x, y, bg, fg, k = 1, px = 38) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.font = `800 ${px}px Montserrat`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s).width; rrect(ctx, x - tw / 2 - 22, y - px * 0.8, tw + 44, px * 1.6, px * 0.8, bg);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 2); ctx.restore();
  };
  const source = (ctx, s, k = 1) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.7 * clamp(k); ctx.font = '500 24px "DM Mono"'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s, CX, 1128); ctx.restore(); };
  const bigText = (ctx, s, x, y, px, k, col) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); };
  const clipStage = (ctx, f) => { ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip(); f(); ctx.restore(); };
  // the frankincense tree: gnarled trunk, papery bark, leaf clusters. (x, y) = base, s = height. droop/fade 0..1, cuts = number of cuts
  const tree = (ctx, x, y, s, o = {}) => {
    const dr = o.droop || 0, fade = o.fade || 0, cuts = o.cuts || 0, sway = o.sway || 0;
    const top = [x + s * 0.06 + sway, y - s * 0.78];
    ctx.save(); ctx.strokeStyle = mix(BARK, '#c9c0b4', fade * 0.7); ctx.lineWidth = s * 0.15; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - s * 0.22, y - s * 0.4, top[0], top[1]); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 5; i++) { const u = 0.15 + i * 0.14; ctx.save(); ctx.globalAlpha = 0.75 * (1 - fade); ctx.fillStyle = PAPER; ctx.beginPath(); ctx.ellipse(x - s * 0.12 * Math.sin(u * 3) + s * 0.02, y - s * u * 0.95, s * 0.035, s * 0.06, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    for (let i = 0; i < cuts; i++) { const u = 0.18 + (i % 6) * 0.1, yy = y - s * u * 0.95, xx = x - s * 0.12 * Math.sin(u * 3) + (i >= 6 ? s * 0.04 : -s * 0.02);
      G.seg(ctx, [xx - s * 0.04, yy], [xx + s * 0.04, yy + s * 0.01], s * 0.012, MILK); disc(ctx, xx, yy + s * 0.025, s * 0.012, AMB); }
    const ends = [[-0.5, -1.02], [0.12, -1.22], [0.55, -0.98], [-0.25, -1.18]];
    ends.forEach(([dx, dy], i) => {
      const e = [top[0] + dx * s * 0.75, top[1] + (dy + 0.78) * s * 0.9 + dr * s * (0.35 + 0.1 * i)];
      G.seg(ctx, top, e, s * 0.055, mix(BARK, '#c9c0b4', fade * 0.7));
      ctx.save(); ctx.globalAlpha = 1 - fade * 0.85;
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + i; ctx.fillStyle = k % 2 ? OLV : mix(OLV, '#ffffff', 0.18); ctx.beginPath(); ctx.ellipse(e[0] + Math.cos(a) * s * 0.07, e[1] + Math.sin(a) * s * 0.05 + dr * s * 0.04, s * 0.05, s * 0.025, a, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
  };
  const cliff = (ctx) => clipStage(ctx, () => { ctx.beginPath(); ctx.rect(0, 0, W, 1040); ctx.clip(); ctx.translate(0, -80); poly(ctx, [[CX - 120, 1120], [CX - 60, 1010], [CX + 60, 975], [CX + 400, 960], [CX + 400, 1120]], mix(TER, DBR, 0.25)); poly(ctx, [[CX - 60, 1010], [CX + 60, 975], [CX + 400, 960], [CX + 400, 1000], [CX + 80, 1015]], TER); });
  const coin = (ctx, x, y, r, glint) => {
    disc(ctx, x, y, r, PAL.amber.t[2]); G.ring(ctx, x, y, r * 0.74, r * 0.1, PAL.amber.t[0]); disc(ctx, x, y, r * 0.42, PAL.amber.t[3]);
    if (glint > 0) { ctx.save(); ctx.globalAlpha = glint; ctx.fillStyle = '#ffffff'; ctx.translate(x + r * 0.45, y - r * 0.45); ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = i % 2 ? r * 0.08 : r * 0.38; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); ctx.restore(); }
  };
  const wind = (ctx, lt, a = 1) => { ctx.save(); ctx.globalAlpha = 0.7 * a; ctx.strokeStyle = PAL.sand.t[0]; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const y = 470 + i * 110, x = ((lt * 260 + i * 230) % 1300) - 200; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 80, y - 20, x + 170, y); ctx.stroke(); } ctx.restore(); };
  const tears = (ctx, x, y, s, n, col = AMB) => { for (let i = 0; i < n; i++) { const a = G.hash(i + 3) * 6.28, d = s * Math.sqrt(G.hash(i + 9)) * 0.9, k = 1 - d / s * 0.4;
      ctx.save(); ctx.fillStyle = i % 3 ? col : mix(col, '#ffffff', 0.3); ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.45 - (1 - d / s) * s * 0.35, s * 0.2 * k, s * 0.15 * k, a, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } };

  // ——— the opening (also the last shot: the film loops): the tree on the cliff edge, wind, a gold coin ———
  const opening = (ctx, lt) => {
    cliff(ctx);
    wind(ctx, lt);
    tree(ctx, CX + 150, 905, 450, { sway: Math.sin(lt * 2.2) * 10 });
    coin(ctx, 330, 700, 115, 0.5 + 0.5 * Math.sin(lt * 4));
  };

  // ——— 1 · hook: a small tree on Somalia's mountains… once worth as much as gold. Why? ———
  card(0, 's01', (ctx, lt) => opening(ctx, lt), 'WAAYO?', [[0.05, 'wind', { dur: 4.5, gain: 0.8 }]]);
  card(wt('s01', 'waagii') - 0.1, 's01', (ctx, lt) => {
    // a balance: resin tears on one pan, a gold coin on the other, level
    const k = E.oBack(inv(0, 0.35, lt)), tilt = 0.25 * Math.cos(lt * 3) * Math.exp(-lt * 1.6);
    ctx.save(); ctx.translate(0, -90);
    G.seg(ctx, [CX, 1080], [CX, 640], 22, DBR); poly(ctx, [[CX - 110, 1090], [CX + 110, 1090], [CX, 1030]], DBR);
    ctx.save(); ctx.translate(CX, 640); ctx.rotate(tilt); G.seg(ctx, [-300, 0], [300, 0], 18, DBR);
    for (const s of [-1, 1]) { G.seg(ctx, [s * 300, 0], [s * 300 - 70, 160], 5, DBR); G.seg(ctx, [s * 300, 0], [s * 300 + 70, 160], 5, DBR); ctx.save(); ctx.fillStyle = mix(DBR, '#ffffff', 0.4); ctx.beginPath(); ctx.ellipse(s * 300, 165, 110, 22, 0, 0, Math.PI); ctx.fill(); ctx.restore(); }
    ctx.restore();
    const ly = 640 - 300 * Math.sin(tilt), ry = 640 + 300 * Math.sin(tilt);
    if (k > 0) { tears(ctx, CX - 300, ly + 130, 95 * k, 9); coin(ctx, CX + 300, ry + 105, 62 * k, 0.6 + 0.4 * Math.sin(lt * 5)); }
    ctx.restore();
    bigText(ctx, '= DAHAB', CX, 430, 90, E.oBack(inv(sinceW('s01', 'dahab.') - (sinceW('s01', 'waagii') - 0.1) - 0.1, sinceW('s01', 'dahab.') - (sinceW('s01', 'waagii') - 0.1) + 0.25, lt)), AMB);
  }, 'SIDA DAHAB', [[0.1, 'pop'], [sinceW('s01', 'dahab.') - sinceW('s01', 'waagii'), 'pop']]);
  card(wt('s01', 'waayo?') - 0.1, 's01', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt), 2.2);
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k); disc(ctx, 0, 0, 290, AMB);
    ctx.fillStyle = CREAM; ctx.font = '900 400px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 8, 18); ctx.restore();
  }, 'WAAYO?', [[0, 'pop']]);

  // ——— 2 · what it is: cut the bark lightly, sap seeps out and hardens: that is frankincense ———
  card(S('s02').t, 's02', (ctx, lt) => { cliff(ctx); tree(ctx, CX + 140, 910, 420, { sway: Math.sin(lt * 2) * 6 }); },
    'GEEDKA BEEYADA', [[0.1, 'pop']]);
  card(wt('s02', 'jirridda') - 0.1, 's02', (ctx, lt) => {
    const b0 = sinceW('s02', 'jirridda') - 0.1, tj = sinceW('s02', 'jaro,') - b0 - 0.2, td = sinceW('s02', 'dheecaan') - b0, te = sinceW('s02', 'engega.') - b0;
    // the trunk close up
    rrect(ctx, CX - 170, 390, 340, 690, 60, BARK);
    for (let i = 0; i < 7; i++) { ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = PAPER; ctx.beginPath(); ctx.ellipse(CX - 110 + (i % 3) * 100, 440 + i * 92, 40, 22, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    const c = E.io(inv(tj, tj + 0.4, lt));
    if (c > 0) G.seg(ctx, [CX - 90, 720], [CX - 90 + 170 * c, 735], 12, MILK);
    // a faceless hand with a small knife
    const hx = lerp(CX + 330, CX + 110, E.o3(inv(0, 0.4, lt))) - 170 * c + (lt > tj + 0.5 ? E.io(inv(tj + 0.5, tj + 0.9, lt)) * 300 : 0), hy = 700;
    rrect(ctx, hx + 40, hy - 20, 160, 110, 40, G.SKIN_D); for (let f = 0; f < 3; f++) G.seg(ctx, [hx + 60, hy + 5 + f * 30], [hx + 20, hy + 5 + f * 30], 26, G.SKIN_D);
    poly(ctx, [[hx + 10, hy + 20], [hx - 110, hy + 32], [hx + 10, hy + 46]], '#c9ced6'); rrect(ctx, hx + 5, hy + 18, 60, 30, 10, DBR);
    // milky drops ooze, then turn to amber tears
    for (let i = 0; i < 4; i++) { const u = clamp((lt - td - i * 0.15) / 0.7); if (u <= 0) continue; const am = E.io(inv(te, te + 0.6, lt));
      ctx.save(); ctx.fillStyle = mix(MILK, AMB, am); ctx.beginPath(); ctx.ellipse(CX - 60 + i * 40, 745 + u * (40 + i * 18), 16, 22 + 8 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }, 'DHEECAAN',
  [[sinceW('s02', 'jaro,') - sinceW('s02', 'jirridda') - 0.1, 'scrape'], [sinceW('s02', 'dheecaan') - sinceW('s02', 'jirridda') + 0.1, 'drip'], [sinceW('s02', 'dheecaan') - sinceW('s02', 'jirridda') + 0.35, 'drip', { gain: 0.8 }], [sinceW('s02', 'dheecaan') - sinceW('s02', 'jirridda') + 0.6, 'drip', { gain: 0.6 }]]);
  card(wt('s02', 'engega.') + 0.4, 's02', (ctx, lt) => { const k = E.oBack(inv(0, 0.35, lt)); disc(ctx, CX, 860, 250 * k, PAL.amber.t[4]); tears(ctx, CX, 860, 210 * k, 30); },
    'BEEYO', [[0, 'pop'], [0.2, 'sparkle', { dur: 0.6 }]]);

  // ——— 3 · where it grows: dry rocky land, mostly the northern mountains ———
  const horn = ([lon, lat]) => [CX + (lon - 46.5) * 40, CY - (lat - 6.5) * 40];
  const NORTH = [[43.2, 10.9], [45, 10.6], [47, 11.0], [49, 11.3], [50.8, 11.7], [51.1, 10.6], [49, 10.2], [47, 9.9], [45, 9.6], [43.3, 9.8]];
  split2(wt('s03', 'meel'), S('s03').t, 's03', (ctx, lt) => {
    const tb = sinceW('s03', 'buuraha') - 0.2, tm = sinceW('s03', 'meel') - 0.1;
    if (lt < tm) {
      clipStage(ctx, () => { G.geo(ctx, window.HORN, horn, SANDC); G.geo(ctx, window.SOM, horn, PAL.sand.t[1]);
        const g = E.o3(inv(tb, tb + 0.5, lt)); if (g > 0) { ctx.save(); ctx.globalAlpha = 0.85 * g; G.geo(ctx, [NORTH], horn, AMB); ctx.restore(); } });
      for (let i = 0; i < 7; i++) { const p = horn([43.8 + i * 1.1, 10.4 + 0.25 * Math.sin(i)]), k = E.oBack(inv(tb + 0.2 + i * 0.08, tb + 0.45 + i * 0.08, lt)); if (k > 0) tree(ctx, p[0], p[1] + 14, 70 * k); }
      pill(ctx, 'BUURAHA WAQOOYIGA', CX, 1060, DBR, CREAM, E.oBack(inv(tb, tb + 0.3, lt)), 28);
    } else {
      poly(ctx, [[160, 1100], [300, 930], [520, 980], [760, 900], [940, 1100]], PAL.sand.t[1]);
      for (const [x, y, r] of [[300, 1000, 40], [640, 1010, 52], [820, 1030, 34]]) disc(ctx, x, y, r, PAL.sand.t[0]);
      tree(ctx, CX + 150, 930, 380);
      const k = E.oBack(inv(tm + 0.1, tm + 0.4, lt)); if (k > 0) { ctx.save(); ctx.translate(CX - 220, 760); ctx.scale(k, k);
        G.seg(ctx, [0, 90], [0, -60], 12, OLV); for (const s of [-1, 1]) { ctx.save(); ctx.fillStyle = OLV; ctx.beginPath(); ctx.ellipse(s * 34, 0, 34, 14, s * -0.5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
        G.seg(ctx, [-90, -90], [90, 110], 18, TER); G.seg(ctx, [90, -90], [-90, 110], 18, TER); ctx.restore(); }
    }
  }, 'DHUL ENGEGAN', [[0.2, 'wind', { dur: 2.5, gain: 0.6 }], [sinceW('s03', 'buuraha') - 0.2, 'whoosh', { dur: 0.6 }], [sinceW('s03', 'buuraha'), 'pop']], [[0.3, 'pop']]);

  // ——— 4 · two famous kinds: Beeyo and Meydi, "the king", only in Somalia ———
  const piles = (ctx, lt, tB, tM, crown = 0) => {
    const kb = E.oBack(inv(tB, tB + 0.3, lt)), km = E.oBack(inv(tM, tM + 0.3, lt));
    if (kb > 0) { tears(ctx, CX - 210, 820, 160 * kb, 18, AMB); pill(ctx, 'BEEYO', CX - 210, 1040, DBR, CREAM, kb, 32); }
    if (km > 0) { tears(ctx, CX + 210, 820, 160 * km, 18, '#e8c977'); pill(ctx, 'MEYDI', CX + 210, 1040, DBR, CREAM, km, 32); }
    if (crown > 0) { const y = lerp(360, 640, E.oBack(clamp(crown), 1.4)); ctx.save(); ctx.translate(CX + 210, y);
      poly(ctx, [[-80, 40], [-90, -40], [-45, 0], [0, -55], [45, 0], [90, -40], [80, 40]], AMB); for (const x of [-90, 0, 90]) disc(ctx, x, x ? -42 : -58, 13, PAL.amber.t[3]); ctx.restore(); }
  };
  card(S('s04').t, 's04', (ctx, lt) => piles(ctx, lt, sinceW('s04', 'beeyo') - 0.1, sinceW('s04', 'meydi.') - 0.1), 'BEEYO & MEYDI',
    [[sinceW('s04', 'beeyo') - 0.1, 'pop'], [sinceW('s04', 'meydi.') - 0.1, 'pop']]);
  card(wt('s04', 'meydiga') - 0.1, 's04', (ctx, lt) => { const tb = sinceW('s04', "'boqorka") - (sinceW('s04', 'meydiga') - 0.1); piles(ctx, lt, -1, -1, inv(tb - 0.2, tb + 0.3, lt)); },
    'BOQORKA BEEYADA', [[sinceW('s04', "'boqorka") - sinceW('s04', 'meydiga') + 0.2, 'ding']]);
  card(wt('s04', 'wuxuuna') - 0.1, 's04', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt)), sp = ([lon, lat]) => [CX - 40 + (lon - 46) * 30 * k, 760 - (lat - 6) * 30 * k];
    G.geo(ctx, window.SOM, sp, PAL.sand.t[1]); tears(ctx, CX + 80, 520, 60 * k, 8, '#e8c977');
    pill(ctx, 'SOOMAALIYA OO KELIYA', CX, 1060, DBR, CREAM, E.oBack(inv(0.4, 0.7, lt)), 28);
  }, 'MEYDI', [[0, 'pop'], [0.4, 'click']]);

  // ——— 5 · ancient trade: Egyptians brought incense from the "Land of Punt" — many historians say the Horn of Africa ———
  const afr = ([lon, lat]) => [CX + (lon - 40) * 18, CY - (lat - 17) * 18];
  const ROUTE = [[49, 11.6], [45, 12.3], [43.4, 12.7], [41, 15.5], [38.5, 19], [36, 23], [34, 26.8]];
  const routeAt = (u) => { const n = ROUTE.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), a = afr(ROUTE[i]), b = afr(ROUTE[i + 1]); return [lerp(a[0], b[0], f - i), lerp(a[1], b[1], f - i), Math.atan2(b[1] - a[1], b[0] - a[0])]; };
  const ship = (ctx, x, y, s, ang) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang * 0.25);
    poly(ctx, [[-s, 0], [s, 0], [s * 0.7, s * 0.4], [-s * 0.7, s * 0.4]], DBR); G.seg(ctx, [0, 0], [0, -s * 1.2], s * 0.08, DBR);
    poly(ctx, [[s * 0.05, -s * 1.15], [s * 0.75, -s * 0.15], [s * 0.05, -s * 0.15]], SANDC); for (const dx of [-0.55, -0.3]) disc(ctx, dx * s, -s * 0.12, s * 0.16, AMB); ctx.restore(); };
  card(S('s05').t, 's05', (ctx, lt) => {
    bigText(ctx, 'KUMANAAN', CX, 600, 130, E.oBack(inv(0.05, 0.35, lt)), TER); bigText(ctx, 'SANO', CX, 740, 130, E.oBack(inv(0.2, 0.5, lt)), TER);
    for (let i = 0; i < 3; i++) { const k = E.oBack(inv(0.6 + i * 0.12, 0.9 + i * 0.12, lt)); if (k > 0) { ctx.save(); ctx.translate(CX - 160 + i * 160, 960); ctx.scale(k, k); rrect(ctx, -60, -70, 120, 130, 40, SANDC); G.seg(ctx, [-40, -70], [40, -70], 16, DBR); tears(ctx, 0, -20, 40, 5); ctx.restore(); } }
  }, 'GANACSI', [[0.05, 'pop'], [0.6, 'pop']]);
  card(wt('s05', 'masaaridii') - 0.1, 's05', (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = '#cfe3e6'; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.AFR, afr, SANDC); G.geo(ctx, window.SOM, afr, PAL.sand.t[1]); });
    const p = routeAt(E.io(inv(0.3, 2.3, lt))); ship(ctx, p[0], p[1] - 10, 46, p[2]);
    pill(ctx, 'MASAR', afr([31, 27])[0] - 20, afr([31, 27])[1] - 50, DBR, CREAM, E.oBack(inv(0.1, 0.4, lt)), 28);
  }, 'MASAR', [[0.3, 'whoosh', { dur: 1.6, gain: 0.7 }], [0.4, 'wind', { dur: 2.0, gain: 0.5 }]]);
  card(wt('s05', 'oo') - 0.1, 's05', (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = '#cfe3e6'; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.AFR, afr, SANDC); G.geo(ctx, window.SOM, afr, AMB); });
    const h = afr([47, 8]); for (let i = 0; i < 3; i++) { const u = (lt * 0.8 + i / 3) % 1; G.ring(ctx, h[0], h[1], 30 + u * 120, 8 * (1 - u), rgba(TER, 1 - u)); }
    pill(ctx, 'PUNT?', h[0] - 230, h[1] - 230, TER, CREAM, E.oBack(inv(0.1, 0.4, lt)), 40);
    pill(ctx, 'GEESKA AFRIKA', CX, 1060, DBR, CREAM, E.oBack(inv(sinceW('s05', 'geeska') - (sinceW('s05', 'oo') - 0.1) - 0.1, sinceW('s05', 'geeska') - (sinceW('s05', 'oo') - 0.1) + 0.2, lt)), 28);
  }, 'PUNT?', [[0.1, 'pop'], [sinceW('s05', 'geeska') - sinceW('s05', 'oo'), 'click']]);

  // ——— 6 · today: incense, perfume, traditional medicine, all over the world ———
  const burner = (ctx, x, y, s, lt) => {
    poly(ctx, [[x - s * 0.5, y - s * 0.35], [x + s * 0.5, y - s * 0.35], [x + s * 0.3, y + s * 0.05], [x - s * 0.3, y + s * 0.05]], TER);
    rrect(ctx, x - s * 0.12, y + s * 0.03, s * 0.24, s * 0.2, s * 0.04, mix(TER, DBR, 0.3)); rrect(ctx, x - s * 0.35, y + s * 0.2, s * 0.7, s * 0.12, s * 0.05, mix(TER, DBR, 0.3));
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.strokeStyle = rgba('#9aa0a6', 0.6); ctx.lineWidth = s * 0.06; ctx.lineCap = 'round'; ctx.beginPath();
      for (let j = 0; j <= 12; j++) { const u = j / 12, yy = y - s * 0.4 - u * s * 1.0, xx = x - s * 0.15 + i * s * 0.15 + Math.sin(u * 6 + lt * 3 + i) * s * 0.1; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore(); }
  };
  card(S('s06').t, 's06', (ctx, lt) => {
    const T = [sinceW('s06', 'uunsiga,'), sinceW('s06', 'cadarka'), sinceW('s06', 'daawooyinka')].map((x) => x - 0.15), ys = 800;
    [[200, 'UUNSI'], [540, 'CADAR'], [880, 'DAAWO']].forEach(([x, lab], i) => {
      const k = E.oBack(inv(T[i], T[i] + 0.3, lt)); if (k <= 0) return;
      disc(ctx, x, ys, 150 * k, '#ffffff');
      ctx.save(); ctx.translate(x, ys); ctx.scale(k * 1.15, k * 1.15);
      if (i === 0) burner(ctx, 0, 55, 110, lt);
      if (i === 1) { rrect(ctx, -55, -50, 110, 140, 30, rgba(AMB, 0.85)); rrect(ctx, -22, -90, 44, 44, 10, DBR); rrect(ctx, -12, -110, 24, 24, 8, mix(DBR, '#fff', 0.3)); }
      if (i === 2) { rrect(ctx, -60, -40, 120, 120, 24, OLV); rrect(ctx, -70, -70, 140, 40, 14, DBR); rrect(ctx, -10, -10, 20, 60, 4, CREAM); rrect(ctx, -30, 10, 60, 20, 4, CREAM); }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = INK; ctx.font = '800 32px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(lab, x, ys + 200); ctx.restore();
    });
  }, 'UUNSI · CADAR · DAAWO', [[sinceW('s06', 'uunsiga,') - 0.15, 'pop'], [sinceW('s06', 'uunsiga,'), 'crackle', { dur: 1.6 }], [sinceW('s06', 'cadarka') - 0.15, 'pop'], [sinceW('s06', 'daawooyinka') - 0.15, 'pop']]);
  card(wt('s06', 'adduunka') - 0.1, 's06', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt)), gp = ([lon, lat]) => [CX + (lon - 30) * 4.2 * k, CY - (lat - 10) * 4.6 * k];
    ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, 230 * k, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = '#cfe3e6'; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.AFR, gp, SANDC); ctx.restore();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + lt * 0.6, r = 300 * k; burner(ctx, CX + Math.cos(a) * r, CY + Math.sin(a) * r, 46 * k, lt); }
  }, 'UUNSI · CADAR · DAAWO', [[0, 'whoosh', { dur: 0.6 }], [0.2, 'crackle', { dur: 1.0, gain: 0.6 }]]);

  // ——— 7 · the warning: over-cut trees can need 10 years or more to recover ———
  card(S('s07').t, 's07', (ctx, lt) => {
    cliff(ctx); tree(ctx, CX + 140, 910, 420, { sway: Math.sin(lt * 2) * 6 });
    const tk = sinceW('s07', 'khatar') - 0.1, k = E.oBack(inv(tk, tk + 0.3, lt));
    if (k > 0) { ctx.save(); ctx.translate(CX - 260, 560); ctx.scale(k, k); ctx.lineJoin = 'round'; ctx.fillStyle = TER; ctx.strokeStyle = TER; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(110, 80); ctx.lineTo(-110, 80); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = CREAM; ctx.font = '900 140px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 16); ctx.restore(); }
  }, 'KHATAR', [[sinceW('s07', 'khatar') - 0.1, 'pop']]);
  card(wt('s07', 'haddii') - 0.1, 's07', (ctx, lt) => {
    const cuts = Math.min(12, Math.floor(lt * 9)), dr = E.io(inv(0.9, 2.2, lt));
    cliff(ctx); tree(ctx, CX + 140, 910, 420, { cuts, droop: dr, fade: dr * 0.8 });
  }, 'XAD-DHAAF', [[0.1, 'scrape', { dur: 0.4 }], [0.5, 'scrape', { dur: 0.4, gain: 0.8 }], [0.9, 'scrape', { dur: 0.4, gain: 0.7 }], [1.0, 'wind', { dur: 1.8, gain: 0.5 }]]);
  card(wt('s07', 'toban') - 0.1, 's07', (ctx, lt) => {
    const yr = Math.min(10, Math.floor(lt * 7) + 1);
    rrect(ctx, CX - 220, 520, 440, 470, 40, CREAM); rrect(ctx, CX - 220, 520, 440, 130, 40, TER); ctx.fillStyle = TER; ctx.fillRect(CX - 220, 590, 440, 60);
    for (const x of [CX - 110, CX + 110]) rrect(ctx, x - 14, 490, 28, 80, 14, INK);
    bigText(ctx, yr < 10 ? '+' + yr : '10+', CX, 790, 170, 1, INK);
    ctx.save(); ctx.fillStyle = INK; ctx.font = '900 70px Montserrat'; ctx.textAlign = 'center'; ctx.fillText('SANO', CX, 930); ctx.restore();
    source(ctx, 'National Geographic', E.o3(inv(0.4, 0.8, lt)));
  }, '10+ SANO', [[0, 'tick', { dur: 1.4 }], [1.4, 'pop']]);

  // ——— 8 · will we protect our gold? do you burn frankincense at home? (+ subscribe on screen), then the loop ———
  const s8 = S('s08');
  card(s8.t, 's08', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.4, lt), 1.8), b = E.oBack(inv(0.3, 0.6, lt));
    if (b > 0) { ctx.save(); ctx.translate(CX, 600); ctx.scale(b, b); G.bubble(ctx, 0, 0, 700, 260, CREAM);
      burner(ctx, -170, 40, 90, lt); for (let i = 0; i < 3; i++) disc(ctx, 20 + i * 90, 0, 24 * (0.75 + 0.25 * Math.sin(lt * 6 - i)), AMB); ctx.restore(); }
    ctx.save(); ctx.translate(CX, 930); ctx.scale(k, k); ctx.fillStyle = INK; ctx.font = '900 170px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('WAAYO?', 0, 0); ctx.restore();
    const s = E.oBack(inv(0.6, 0.95, lt), 1.6);
    if (s > 0) {
      ctx.save(); ctx.translate(CX, 1150); ctx.scale(s, s);
      disc(ctx, -300, 0, 62, AMB); ctx.save(); ctx.translate(-300, 10); ctx.scale(0.5, 0.5); G.thumb(ctx, 0, 0, 170, CREAM, INK, OLV); ctx.restore();
      const done = lt > 1.6; rrect(ctx, -210, -52, 470, 104, 52, done ? INK : TER);
      G.bell(ctx, -150, -2, 44, CREAM); ctx.fillStyle = CREAM; ctx.font = '900 40px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SUBSCRIBE', -100, 3);
      if (done) { const q = E.oBack(inv(1.6, 1.85, lt)); disc(ctx, 262, -50, 34 * q, OLV); G.tick(ctx, 262, -50, 40 * q, CREAM, E.oExp(inv(1.65, 1.95, lt))); }
      ctx.restore();
    }
  }, '', [[0, 'pop'], [0.3, 'pop'], [0.6, 'pop'], [1.6, 'click'], [1.75, 'sparkle', { dur: 0.6 }]]);
  card(s8.v + s8.vd + 0.9, 's08', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : lt), 'WAAYO?', [[0.1, 'wind', { dur: 1.4, gain: 0.7 }]]);
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
  const KICK = 'BEEYADA SOOMAALIYA';
  function hud(ctx, t, sc, P) {
    const n = SC.indexOf(sc) + 1, y = 318;
    ctx.save(); ctx.font = '500 26px "DM Mono"'; ctx.letterSpacing = '4px'; ctx.fillStyle = rgba(INK, 0.75); ctx.textBaseline = 'alphabetic';
    ctx.fillText('WAAYO? · BEEYO', 70, y);
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
    if (sc.id === 's08' && !cardAt(t).loop && t > wt('s08', 'adiga') + 0.6) {   // the arrow points down to the comments
      const k = E.oBack(inv(wt('s08', 'adiga') + 0.6, wt('s08', 'adiga') + 0.9, t));
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

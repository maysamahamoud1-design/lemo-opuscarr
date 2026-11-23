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

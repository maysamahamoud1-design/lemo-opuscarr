  // ═════════ the rain story's cards (spliced into film.js by tools/splice.py) ═════════
  const afr = ([lon, lat]) => [CX + (lon - 32) * 8.6, CY - (lat - 2) * 8.6];
  const horn = ([lon, lat]) => [CX + (lon - 46.5) * 40, CY - (lat - 5.5) * 40];
  const clipStage = (ctx, f) => { ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip(); f(); ctx.restore(); };
  const DRY = '#e9c98f', WET = PAL.green.t[2];
  // the rain belt: a soft band with a row of clouds on it (y = screen row), raining if rain > 0
  const belt = (ctx, y, a, lt, rain = 1) => {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = rgba(PAL.blue.t[2], 0.22); ctx.fillRect(0, y - 46, W, 92);
    for (let i = 0; i < 9; i++) {
      const x = 90 + i * 115 + Math.sin(lt * 0.8 + i) * 8;
      if (rain > 0) for (let k = 0; k < 2; k++) { const u = ((lt * 1.6 + i * 0.37 + k * 0.5) % 1); G.drop(ctx, x - 20 + k * 34, y + 10 + u * 70, 7, rgba(PAL.blue.t[1], rain * (1 - u))); }
      G.cloud(ctx, x, y + 6, 58 + (i % 3) * 8, i % 2 ? '#ffffff' : '#f1f5fa');
    }
    ctx.restore();
  };
  // wind: a line with travelling dashes and an arrowhead
  const flow = (ctx, a, b, lt, col, p = 1, w = 10) => {
    if (p <= 0) return;
    const e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash([w * 2.6, w * 2.2]); ctx.lineDashOffset = -lt * 90;
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...e); ctx.stroke(); ctx.setLineDash([]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = w * 2.6;
    ctx.beginPath(); ctx.moveTo(e[0] - Math.cos(ang - 0.6) * h, e[1] - Math.sin(ang - 0.6) * h); ctx.lineTo(...e); ctx.lineTo(e[0] - Math.cos(ang + 0.6) * h, e[1] - Math.sin(ang + 0.6) * h); ctx.stroke();
    ctx.restore();
  };
  const pill = (ctx, s, x, y, bg, fg, k = 1, px = 38) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.font = `800 ${px}px Montserrat`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s).width; rrect(ctx, x - tw / 2 - 22, y - px * 0.8, tw + 44, px * 1.6, px * 0.8, bg);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 2); ctx.restore();
  };
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;   // a word's time inside its scene

  // ——— 1 · hook: two rainy seasons… why? ———
  const somProj = (cx, cy, s) => ([lon, lat]) => [cx + (lon - 46) * s, cy - (lat - 6) * s];
  card(0, 's01', (ctx, lt) => {
    G.geo(ctx, window.SOM, somProj(500, 820, 27), mix(DRY, WET, E.io(inv(0.6, 1.6, lt))));
    [[330, 520, 0], [690, 470, 1]].forEach(([x, y, i]) => {
      const k = E.oBack(inv(0.1 + i * 0.25, 0.45 + i * 0.25, lt)); if (k <= 0) return;
      for (let j = 0; j < 4; j++) { const u = (lt * 1.5 + j * 0.25) % 1; G.drop(ctx, x - 60 + j * 40, y + 30 + u * 160, 10, rgba(PAL.blue.t[1], k * (1 - u))); }
      G.cloud(ctx, x, y, 120 * k, '#ffffff');
      pill(ctx, i ? 'DEYR' : "GU'", x, y - 150, PAL.blue.t[1], CREAM, E.oBack(inv(0.5 + i * 0.25, 0.8 + i * 0.25, lt)));
    });
  }, 'WAAYO?', [[0.1, 'pop'], [0.35, 'pop'], [0.6, 'rain', { dur: 2.2, gain: 0.7 }]]);
  card(wt('s01', 'waa') - 0.1, 's01', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt), 2.2);
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k); disc(ctx, 0, 0, 290, PAL.sun.t[2]);
    ctx.fillStyle = INK; ctx.font = '900 400px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 8, 18); ctx.restore();
    const c = E.oBack(inv(0.35, 0.65, lt)); if (c > 0) G.cloud(ctx, CX + 250, CY + 250, 110 * c, '#ffffff');
  }, 'WAAYO?', [[0, 'pop'], [0.4, 'pop']]);

  // ——— 2 · the calendar: Gu' April–June, Deyr October–December ———
  const MON = ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'];
  const calendar = (ctx, y, lt, gu, de, mark = -1) => {
    const cw = 74, gap = 8, x0 = CX - (12 * cw + 11 * gap) / 2;
    for (let i = 0; i < 12; i++) {
      const x = x0 + i * (cw + gap), wet = i >= 3 && i <= 5 ? gu : i >= 9 ? de : 0;
      const h = lerp(70, 150, E.oBack(clamp(wet)));
      rrect(ctx, x, y - h, cw, h, 18, mix(DRY, PAL.blue.t[2], clamp(wet)));
      if (wet > 0.5) G.drop(ctx, x + cw / 2, y - h + 52, 12 * clamp((wet - 0.5) * 2), CREAM);
      ctx.save(); ctx.fillStyle = INK; ctx.font = '800 30px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(MON[i], x + cw / 2, y + 44); ctx.restore();
      if (i === mark) { ctx.save(); ctx.strokeStyle = PAL.sun.t[0]; ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(x - 7, y - h - 7, cw + 14, h + 14, 22); ctx.stroke(); ctx.restore(); }
    }
    return [x0, cw + gap];
  };
  card(S('s02').t, 's02', (ctx, lt) => {
    const tg = sinceW('s02', 'gu'), td = sinceW('s02', 'deyr');
    const gu = E.o3(inv(tg, tg + 0.6, lt)), de = E.o3(inv(td, td + 0.6, lt));
    const [x0, st] = calendar(ctx, 900, lt, gu, de);
    pill(ctx, "GU'", x0 + st * 4.5, 640, PAL.blue.t[1], CREAM, E.oBack(inv(tg, tg + 0.3, lt)));
    pill(ctx, 'DEYR', x0 + st * 10.5, 640, PAL.blue.t[1], CREAM, E.oBack(inv(td, td + 0.3, lt)));
    const k = E.oBack(inv(0.1, 0.4, lt)); G.sun(ctx, CX, 470, 46 * k, PAL.sun.t[2], lt * 0.4);
  }, (lt) => (lt < sinceW('s02', 'deyr') ? "GU'" : 'DEYR'), [[0, 'paper'], [sinceW('s02', 'gu'), 'pop'], [sinceW('s02', 'deyr'), 'pop'], [sinceW('s02', 'gu') + 0.3, 'rain', { dur: 1.2, gain: 0.5 }], [sinceW('s02', 'deyr') + 0.3, 'rain', { dur: 1.4, gain: 0.5 }]]);

  // ——— 3 · the ITCZ: the belt where the winds meet ———
  const africa = (ctx, wet = 0) => clipStage(ctx, () => {
    G.geo(ctx, window.AFR, afr, PAL.teal.t[3]);
    G.geo(ctx, window.SOM, afr, mix(DRY, WET, wet));
  });
  const eqY = afr([0, 0])[1];
  const equator = (ctx, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([22, 16]); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CX - R, eqY); ctx.lineTo(CX + R, eqY); ctx.stroke(); ctx.restore(); };
  card(S('s03').t, 's03', (ctx, lt) => {
    africa(ctx);
    const reveal = E.io3(inv(0.2, 1.2, lt));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * reveal, H); ctx.clip(); clipStage(ctx, () => belt(ctx, eqY + 20, 1, lt)); ctx.restore();
    pill(ctx, 'ITCZ', CX, eqY - 120, INK, CREAM, E.oBack(inv(0.6, 0.9, lt)), 46);
  }, 'ITCZ', [[0.2, 'whoosh', { dur: 1.0 }], [0.6, 'pop']]);
  card(S('s04').t, 's04', (ctx, lt) => {
    africa(ctx);
    clipStage(ctx, () => belt(ctx, eqY + 20, 1, lt));
    equator(ctx, E.o3(inv(sinceW('s04', 'dhulbaraha') - 0.2, sinceW('s04', 'dhulbaraha') + 0.3, lt)));
    const tn = sinceW('s04', 'woqooyi'), ts = sinceW('s04', 'koonfur');
    for (let i = 0; i < 3; i++) {
      const x = CX - 200 + i * 200;
      flow(ctx, [x + 120, CY - 330], [x + 30, eqY - 70], lt, PAL.teal.t[0], E.o3(inv(tn + i * 0.1, tn + 0.7 + i * 0.1, lt)));
      flow(ctx, [x + 120, CY + 330], [x + 30, eqY + 90], lt, PAL.teal.t[0], E.o3(inv(ts + i * 0.1, ts + 0.7 + i * 0.1, lt)));
    }
    pill(ctx, 'DHULBARAHA', CX - 180, eqY + 150, INK, CREAM, E.oBack(inv(sinceW('s04', 'dhulbaraha'), sinceW('s04', 'dhulbaraha') + 0.3, lt)), 30);
  }, (lt) => (lt < sinceW('s04', 'dhulbaraha') - 0.2 ? 'DABAYLAHA' : 'DHULBARAHA'), [[0, 'swipe'], [sinceW('s04', 'woqooyi'), 'swipe'], [sinceW('s04', 'koonfur'), 'swipe'], [sinceW('s04', 'dhulbaraha'), 'click'], [0.2, 'wind', { dur: 3.5, gain: 0.6 }]]);

  // ——— 5 · warm moist air rises, cools, becomes rain ———
  card(S('s05').t, 's05', (ctx, lt) => {
    const tq = sinceW('s05', 'qabowdaa'), tr = sinceW('s05', 'roobna');
    rrect(ctx, CX - 330, 1000, 660, 70, 20, DRY);
    for (let i = 0; i < 4; i++) {
      const x = CX - 210 + i * 140, u = (lt * 0.7 + i * 0.27) % 1, y = lerp(980, 600, u);
      const col = mix(PAL.coral.t[2], PAL.blue.t[1], clamp((980 - y) / 380));
      if (lt > 0.2) flow(ctx, [x, y + 90], [x, y], lt, col, 1, 12);
    }
    const c = E.oBack(inv(tq, tq + 0.4, lt));
    if (c > 0) G.cloud(ctx, CX, 560, 230 * c, '#ffffff');
    if (lt > tr) for (let j = 0; j < 9; j++) { const u = ((lt - tr) * 1.4 + j * 0.11) % 1; G.drop(ctx, CX - 200 + j * 50, 600 + u * 360, 11, rgba(PAL.blue.t[1], 1 - u)); }
    pill(ctx, 'HAWO KULUL', CX, 1140 - 120, PAL.coral.t[1], CREAM, E.oBack(inv(0.2, 0.5, lt)), 30);
  }, (lt) => (lt < sinceW('s05', 'qabowdaa') ? 'HAWO KULUL' : lt < sinceW('s05', 'roobna') ? 'QABOW' : 'ROOB'), [[0.2, 'air', { dur: 2.5, gain: 0.8 }], [sinceW('s05', 'qabowdaa'), 'pop'], [sinceW('s05', 'roobna'), 'rain', { dur: 1.6 }]]);

  // ——— 6 · the belt follows the sun: north in July, south in January ———
  card(S('s06').t, 's06', (ctx, lt) => {
    const tn = sinceW('s06', 'woqooyi'), ts = sinceW('s06', 'koonfur');
    const lat = lerp(lerp(0, 22, E.io3(inv(tn, tn + 0.9, lt))), -22, E.io3(inv(ts, ts + 0.9, lt)));
    africa(ctx);
    equator(ctx, 0.5);
    const by = afr([0, lat * 0.6])[1];
    clipStage(ctx, () => belt(ctx, by + 20, 1, lt));
    G.sun(ctx, CX + 260, afr([0, lat])[1], 46, PAL.sun.t[2], lt * 0.5);
    pill(ctx, 'LUULYO', CX - 170, 470, INK, CREAM, E.oBack(inv(tn + 0.4, tn + 0.7, lt)) * (1 - E.o3(inv(ts, ts + 0.2, lt))), 32);
    pill(ctx, 'JANAAYO', CX - 170, 1020, INK, CREAM, E.oBack(inv(ts + 0.4, ts + 0.7, lt)), 32);
  }, 'QORRAXDA', [[0, 'pop'], [sinceW('s06', 'woqooyi'), 'whoosh', { dur: 0.9 }], [sinceW('s06', 'koonfur'), 'whoosh', { dur: 0.9 }]]);

  // ——— 7–8 · Gu': the belt crosses Somalia going north; Deyr: it comes back ———
  const hornMap = (ctx, wet, key) => clipStage(ctx, () => {
    G.geo(ctx, window.HORN, horn, key === 'coral' ? mix(DRY, '#d9a77f', 0.5) : PAL[key].t[3]);
    G.geo(ctx, window.SOM, horn, mix(DRY, WET, wet));
  });
  card(S('s07').t, 's07', (ctx, lt) => {
    const p = E.io(inv(0.3, S('s07').vd, lt)), lat = lerp(-6, 14, p);
    hornMap(ctx, E.io(inv(0.6, 2.6, lt)), 'blue');
    clipStage(ctx, () => belt(ctx, horn([0, lat])[1], 1, lt));
    pill(ctx, "GU' · ABRIIL–JUUN", CX, 470, PAL.blue.t[1], CREAM, E.oBack(inv(0, 0.3, lt)), 32);
    flow(ctx, [CX + 300, 980], [CX + 300, 640], lt, PAL.blue.t[0], E.o3(inv(0.2, 0.8, lt)), 12);
  }, "GU'", [[0, 'pop'], [0.3, 'whoosh', { dur: 1.4 }], [0.6, 'rain', { dur: 2.6, gain: 0.8 }]]);
  card(S('s08').t, 's08', (ctx, lt) => {
    const p = E.io(inv(0.3, S('s08').vd, lt)), lat = lerp(14, -6, p);
    hornMap(ctx, 1 - 0.4 * E.io(inv(0, 0.6, lt)) + 0.4 * E.io(inv(0.8, 2.6, lt)), 'blue');
    clipStage(ctx, () => belt(ctx, horn([0, lat])[1], 1, lt));
    pill(ctx, 'DEYR · OKTOOBAR–DISEEMBAR', CX, 470, PAL.blue.t[1], CREAM, E.oBack(inv(0, 0.3, lt)), 30);
    flow(ctx, [CX + 300, 640], [CX + 300, 980], lt, PAL.blue.t[0], E.o3(inv(0.2, 0.8, lt)), 12);
    const tl = sinceW('s08', 'labaad'), k = E.oBack(inv(tl, tl + 0.3, lt), 2.2);
    if (k > 0) { disc(ctx, CX - 270, 960, 80 * k, PAL.sun.t[2]); ctx.save(); ctx.fillStyle = INK; ctx.font = `900 ${Math.round(76 * k)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('×2', CX - 270, 966); ctx.restore(); }
  }, 'DEYR', [[0, 'swipe'], [0.3, 'whoosh', { dur: 1.4 }], [0.6, 'rain', { dur: 2.4, gain: 0.8 }], [sinceW('s08', 'labaad'), 'pop']]);

  // ——— 9 · Xagaa: the monsoon runs along the coast ———
  const COAST = [[42.6, -0.4], [45.3, 2.0], [48.3, 5.5], [50.8, 9.5], [51.3, 11.8]];
  card(S('s09').t, 's09', (ctx, lt) => {
    hornMap(ctx, 0.1, 'coral');
    const tm = sinceW('s09', 'monsoon');
    for (let r = 0; r < 3; r++) for (let i = 0; i < COAST.length - 1; i++) {
      const a = horn([COAST[i][0] + 1.1 + r * 1.3, COAST[i][1] - 0.6]), b = horn([COAST[i + 1][0] + 1.1 + r * 1.3, COAST[i + 1][1] - 0.6]);
      flow(ctx, a, b, lt, PAL.coral.t[1], E.o3(inv(tm - 0.4 + i * 0.12 + r * 0.1, tm + 0.1 + i * 0.12 + r * 0.1, lt)), 10);
    }
    G.sun(ctx, CX - 230, 500, 50, PAL.sun.t[2], lt * 0.4);
    pill(ctx, 'XAGAA · LUULYO–SEBTEMBAR', CX, 1060, PAL.coral.t[1], CREAM, E.oBack(inv(0, 0.3, lt)), 28);
  }, (lt) => (lt < sinceW('s09', 'monsoon') ? 'XAGAA' : 'MONSOON'), [[0, 'pop'], [sinceW('s09', 'monsoon') - 0.3, 'whoosh', { dur: 1.2 }], [0.5, 'wind', { dur: 4, gain: 0.7 }]]);

  // ——— 10 · the winds lift cold water from the sea; cold air brings no rain ———
  card(S('s10').t, 's10', (ctx, lt) => {
    const th = sinceW('s10', 'hawo');
    clipStage(ctx, () => {
      ctx.fillStyle = '#cfe6f5'; ctx.fillRect(0, 0, W, 760);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = mix('#7fb0ec', PAL.blue.t[0], i / 3); ctx.fillRect(0, 760 + i * 90, W, 92); }
      poly(ctx, [[CX + 120, 760], [CX + 420, 700], [CX + 420, 1200], [CX + 40, 1200]], DRY);   // the shore and the land
      pill(ctx, 'XEEBTA', CX + 280, 650, INK, CREAM, 1, 26);
    });
    for (let i = 0; i < 3; i++) flow(ctx, [CX - 50 + i * 60, 1080], [CX - 10 + i * 60, 800], lt, '#e8f4ff', E.o3(inv(0.2 + i * 0.15, 0.9 + i * 0.15, lt)), 12);
    pill(ctx, 'BIYO QABOW', CX - 170, 1000, PAL.blue.t[0], CREAM, E.oBack(inv(sinceW('s10', 'biyo'), sinceW('s10', 'biyo') + 0.3, lt)), 28);
    const c = E.oBack(inv(th, th + 0.35, lt));
    if (c > 0) {
      G.cloud(ctx, CX - 120, 600, 150 * c, '#ffffff');
      G.drop(ctx, CX - 120, 700, 18 * c, PAL.blue.t[1]);
      const x = E.o3(inv(th + 0.5, th + 0.8, lt)); if (x > 0) { G.seg(ctx, [CX - 175, 645], [lerp(CX - 175, CX - 65, x), lerp(645, 755, x)], 14, PAL.coral.t[1]); G.seg(ctx, [CX - 65, 645], [lerp(CX - 65, CX - 175, x), lerp(645, 755, x)], 14, PAL.coral.t[1]); }
    }
  }, (lt) => (lt < sinceW('s10', 'hawo') ? 'BIYO QABOW' : 'ROOB MA KEENTO'), [[0, 'tear', { dur: 0.8 }], [0.2, 'sea', { dur: 2.6, gain: 0.8 }], [sinceW('s10', 'hawo'), 'pop'], [sinceW('s10', 'hawo') + 0.5, 'click']]);

  // ——— 11 · Jilaal: dry wind from the north-east ———
  card(S('s11').t, 's11', (ctx, lt) => {
    hornMap(ctx, 0.15 * (1 - E.io(inv(0, 1.5, lt))), 'coral');
    for (let i = 0; i < 4; i++) flow(ctx, [CX + 380 - i * 40, 420 + i * 110], [CX - 60 - i * 40, 760 + i * 110], lt, PAL.sun.t[0], E.o3(inv(0.3 + i * 0.12, 1.0 + i * 0.12, lt)), 11);
    G.sun(ctx, CX - 240, 500, 58, PAL.sun.t[2], lt * 0.6, 1.2);
    pill(ctx, 'JILAAL · JANAAYO–MAARSO', CX, 1060, PAL.coral.t[1], CREAM, E.oBack(inv(0, 0.3, lt)), 28);
  }, 'JILAAL', [[0, 'swipe'], [0.3, 'drywind', { dur: 3, gain: 0.8 }]]);

  // ——— 12 · what should I explain next? ———
  card(S('s12').t, 's12', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.4, lt), 1.8), b = E.oBack(inv(0.25, 0.6, lt));
    if (b > 0) { ctx.save(); ctx.translate(CX, 660); ctx.scale(b, b); G.bubble(ctx, 0, 0, 760, 300, CREAM);
      for (let i = 0; i < 3; i++) disc(ctx, -110 + i * 110, 0, 30 * (0.75 + 0.25 * Math.sin(lt * 6 - i)), PAL.sun.t[1]); ctx.restore(); }
    ctx.save(); ctx.translate(CX, 1060); ctx.scale(k, k); ctx.fillStyle = INK; ctx.font = '900 180px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('WAAYO?', 0, 0); ctx.restore();
  }, '', [[0, 'pop'], [0.3, 'pop'], [1.0, 'click']]);

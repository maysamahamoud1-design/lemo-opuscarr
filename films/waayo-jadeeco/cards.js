  // ═════════ the measles story's cards (spliced into film.js by tools/splice.py) ═════════
  const TEAL = '#0f4c5c', NAVY = '#1d2d44', RED = '#d64045', GRN = '#5fad56', WHITE = '#f7f9f9', GREY = '#a9b4bf';
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;
  const split2 = (tw, t0, sc, D, T, ev = [], ev2 = []) => { card(t0, sc, D, T, ev); const off = tw - 0.1 - t0;
    card(t0 + off, sc, (ctx, lt, P, t) => D(ctx, lt + off, P, t), typeof T === 'function' ? (lt) => T(lt + off) : T, ev2); };
  const pill = (ctx, s, x, y, bg, fg, k = 1, px = 38) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.font = `800 ${px}px Montserrat`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s).width; rrect(ctx, x - tw / 2 - 22, y - px * 0.8, tw + 44, px * 1.6, px * 0.8, bg);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 2); ctx.restore();
  };
  const source = (ctx, s, k = 1) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.7 * clamp(k); ctx.font = '500 24px "DM Mono"'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s, CX, 1128); ctx.restore(); };
  const bigNum = (ctx, to, x, y, px, p, col, fmt = (v) => Math.round(v).toLocaleString('en-US')) => {
    if (p <= 0) return; const k = E.oBack(clamp(p * 3), 1.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(to * E.o3(p)), 0, 0); ctx.restore();
  };
  const bigText = (ctx, s, x, y, px, k, col) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); };
  const label = (ctx, s, x, y, k = 1, px = 30) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = INK; ctx.font = `800 ${px}px Montserrat`; ctx.textAlign = 'center'; ctx.fillText(s, x, y); ctx.restore(); };
  const clipStage = (ctx, f) => { ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip(); f(); ctx.restore(); };
  // the virus: a red spiky circle
  const virus = (ctx, x, y, r, a = 1, spin = 0) => {
    if (r <= 0) return; ctx.save(); ctx.globalAlpha = a;
    for (let i = 0; i < 9; i++) { const t = spin + i / 9 * Math.PI * 2; G.seg(ctx, [x + Math.cos(t) * r * 0.8, y + Math.sin(t) * r * 0.8], [x + Math.cos(t) * r * 1.35, y + Math.sin(t) * r * 1.35], r * 0.16, RED); disc(ctx, x + Math.cos(t) * r * 1.4, y + Math.sin(t) * r * 1.4, r * 0.18, RED); }
    disc(ctx, x, y, r, RED); disc(ctx, x - r * 0.3, y - r * 0.25, r * 0.2, mix(RED, '#ffffff', 0.35)); ctx.restore();
  };
  // floating virus dots that drift from (x0, y0) toward the right and hang in the air
  const airDots = (ctx, x0, y0, lt, n = 14, spread = 420, a = 1) => {
    for (let i = 0; i < n; i++) { const st = G.hash(i + 2) * 1.2, u = clamp((lt - st) / 1.6); if (u <= 0) continue;
      const x = x0 + E.o3(u) * spread * (0.4 + 0.6 * G.hash(i + 7)), y = y0 - 40 + (G.hash(i + 11) - 0.5) * 260 * E.o3(u) + Math.sin(lt * 1.5 + i) * 12;
      virus(ctx, x, y, 11 + 6 * G.hash(i + 5), a * Math.min(1, u * 3), lt * 0.5 + i); }
  };
  const fig = (ctx, x, y, h, cloth, o = {}) => G.figure(ctx, x, y, h, { skin: o.skin || G.SKIN_D, cloth, covered: o.covered, child: o.child, arm: o.arm });
  const clock = (ctx, x, y, r, lt) => { disc(ctx, x, y, r, WHITE); G.ring(ctx, x, y, r, r * 0.1, NAVY); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; disc(ctx, x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, r * 0.04, NAVY); }
    const a1 = -Math.PI / 2 + lt * 2.4, a2 = -Math.PI / 2 + lt * 0.2; G.seg(ctx, [x, y], [x + Math.cos(a1) * r * 0.7, y + Math.sin(a1) * r * 0.7], r * 0.07, RED); G.seg(ctx, [x, y], [x + Math.cos(a2) * r * 0.45, y + Math.sin(a2) * r * 0.45], r * 0.1, NAVY); disc(ctx, x, y, r * 0.08, NAVY); };
  const crack = (ctx, x, y, s, p) => { if (p <= 0) return; ctx.save(); ctx.strokeStyle = NAVY; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x + s * 0.4, y - s * 0.6); ctx.lineTo(x + s * (0.4 + 0.15 * p), y - s * 0.6 + s * 0.35 * p); ctx.lineTo(x + s * (0.3 + 0.25 * p), y - s * 0.6 + s * 0.65 * p); ctx.stroke(); ctx.restore(); };
  // organ pictograms
  const lungs = (ctx, x, y, s) => { G.seg(ctx, [x, y - s * 0.5], [x, y - s * 0.1], s * 0.1, '#e88b8b'); for (const m of [-1, 1]) { ctx.save(); ctx.fillStyle = '#f2a3a3'; ctx.beginPath(); ctx.ellipse(x + m * s * 0.24, y + s * 0.08, s * 0.2, s * 0.36, m * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } };
  const stomach = (ctx, x, y, s) => { ctx.save(); ctx.strokeStyle = '#e8a07a'; ctx.lineCap = 'round'; ctx.lineWidth = s * 0.3; ctx.beginPath(); ctx.moveTo(x - s * 0.1, y - s * 0.45); ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.3, x + s * 0.25, y + s * 0.2); ctx.quadraticCurveTo(x, y + s * 0.45, x - s * 0.35, y + s * 0.25); ctx.stroke(); ctx.restore(); };
  const brain = (ctx, x, y, s) => { [[-0.3, -0.1, 0.32], [0, -0.25, 0.34], [0.3, -0.1, 0.32], [-0.18, 0.15, 0.3], [0.18, 0.15, 0.3]].forEach(([dx, dy, r]) => disc(ctx, x + dx * s, y + dy * s, r * s, '#f2a3b4'));
    ctx.save(); ctx.strokeStyle = '#c86a80'; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - s * 0.5); ctx.lineTo(x, y + s * 0.38); ctx.stroke(); ctx.restore(); };
  const eye = (ctx, x, y, s, red = 0) => { ctx.save(); ctx.fillStyle = mix('#ffffff', '#f4b6b6', red); ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x, y - s * 0.9, x + s, y); ctx.quadraticCurveTo(x, y + s * 0.9, x - s, y); ctx.fill();
    ctx.lineWidth = s * 0.08; ctx.strokeStyle = NAVY; ctx.stroke(); disc(ctx, x, y, s * 0.36, '#6b4a33'); disc(ctx, x, y, s * 0.16, NAVY);
    if (red > 0) for (let i = 0; i < 4; i++) G.seg(ctx, [x - s * 0.9 + i * s * 0.05, y - s * 0.1 + i * s * 0.08], [x - s * 0.5, y + (i - 1.5) * s * 0.1], s * 0.03, rgba(RED, red)); ctx.restore(); };
  const thermo = (ctx, x, y, s, lvl) => { rrect(ctx, x - s * 0.12, y - s * 0.6, s * 0.24, s * 0.9, s * 0.12, WHITE); G.ring(ctx, x, y + s * 0.35, s * 0.2, s * 0.04, NAVY); disc(ctx, x, y + s * 0.35, s * 0.17, RED); rrect(ctx, x - s * 0.05, y + s * 0.3 - s * 0.8 * lvl, s * 0.1, s * 0.8 * lvl, s * 0.05, RED); };
  const tissue = (ctx, x, y, s) => { rrect(ctx, x - s * 0.45, y - s * 0.1, s * 0.9, s * 0.45, s * 0.08, TEAL); ctx.save(); ctx.fillStyle = WHITE; ctx.beginPath(); ctx.moveTo(x - s * 0.15, y - s * 0.1); ctx.quadraticCurveTo(x, y - s * 0.55, x + s * 0.2, y - s * 0.1); ctx.fill(); ctx.restore(); };
  const shield = (ctx, x, y, s, col) => { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - s * 0.55); ctx.lineTo(x + s * 0.45, y - s * 0.38); ctx.lineTo(x + s * 0.4, y + s * 0.1); ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.45, x, y + s * 0.6); ctx.quadraticCurveTo(x - s * 0.3, y + s * 0.45, x - s * 0.4, y + s * 0.1); ctx.lineTo(x - s * 0.45, y - s * 0.38); ctx.closePath(); ctx.fill(); ctx.restore(); };
  // the day-by-day timeline along the bottom of the stage
  const timeline = (ctx, day, lt, hl = null) => {
    const x0 = 140, x1 = 940, y = 1005, X = (d) => lerp(x0, x1, d / 14);
    rrect(ctx, x0, y - 10, x1 - x0, 20, 10, rgba(NAVY, 0.18));
    if (hl) rrect(ctx, X(hl[0]), y - 14, X(hl[1]) - X(hl[0]), 28, 14, RED);
    rrect(ctx, x0, y - 10, (X(day) - x0), 20, 10, TEAL);
    for (const d of [0, 10, 14]) { disc(ctx, X(d), y, 14, NAVY); label(ctx, String(d), X(d), y + 52, 1, 28); }
    disc(ctx, X(day), y, 22, RED);
  };
  const SCHOOL = (ctx, x, y, s) => { rrect(ctx, x - s * 0.5, y - s * 0.5, s, s * 0.5, s * 0.04, '#c7d4d4'); poly(ctx, [[x - s * 0.6, y - s * 0.48], [x, y - s * 0.85], [x + s * 0.6, y - s * 0.48]], TEAL); rrect(ctx, x - s * 0.1, y - s * 0.28, s * 0.2, s * 0.28, s * 0.03, NAVY); G.seg(ctx, [x, y - s * 0.85], [x, y - s * 1.1], s * 0.03, NAVY); poly(ctx, [[x, y - s * 1.1], [x + s * 0.2, y - s * 1.03], [x, y - s * 0.96]], RED); };
  const MARKET = (ctx, x, y, s) => { rrect(ctx, x - s * 0.5, y - s * 0.35, s, s * 0.35, s * 0.04, '#c7d4d4'); for (let i = 0; i < 5; i++) { ctx.save(); ctx.fillStyle = i % 2 ? WHITE : GRN; ctx.beginPath(); ctx.moveTo(x - s * 0.55 + i * s * 0.22, y - s * 0.6); ctx.lineTo(x - s * 0.33 + i * s * 0.22, y - s * 0.6); ctx.lineTo(x - s * 0.33 + i * s * 0.22, y - s * 0.4); ctx.arc(x - s * 0.44 + i * s * 0.22, y - s * 0.4, s * 0.11, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.restore(); } for (let i = 0; i < 4; i++) disc(ctx, x - s * 0.3 + i * s * 0.2, y - s * 0.18, s * 0.07, ['#e88b3b', '#5fad56', '#d64045', '#f2c14e'][i]); };

  // ——— the opening (also the last shot: the film loops): one figure coughing virus into the air ———
  const opening = (ctx, lt) => {
    const c = Math.max(0, Math.sin(Math.min(lt, 1.2) * 4)) * (lt > 0.2 ? 1 : 0);
    fig(ctx, 300, 1080, 380, TEAL, { arm: 0.7 * c });
    if (lt > 0.25) airDots(ctx, 370, 780, lt - 0.25, 12, 520);
  };

  // ——— 1 · hook: one sick person can infect 18; the virus stays in the air two hours ———
  card(0, 's01', (ctx, lt) => opening(ctx, lt), 'WAAYO?', [[0.25, 'cough']]);
  card(wt('s01', '18') - 0.1, 's01', (ctx, lt) => {
    fig(ctx, 170, 1000, 260, TEAL);
    for (let i = 0; i < 18; i++) { const x = 330 + (i % 6) * 110, y = 640 + Math.floor(i / 6) * 190, tt = 0.15 + i * 0.09, red = lt > tt + 0.25;
      if (lt > tt && !red) { const u = clamp((lt - tt) / 0.25); virus(ctx, lerp(220, x, u), lerp(800, y - 120, u), 10); }
      fig(ctx, x, y, 150, red ? RED : '#9fb3b3'); }
    bigNum(ctx, 18, CX + 170, 470, 120, inv(0.1, 1.8, lt), RED);
    source(ctx, 'WHO', E.o3(inv(0.4, 0.8, lt)));
  }, '18 QOF', [[0, 'pop'], [0.1, 'tick', { dur: 1.6, gain: 0.5 }]]);
  card(wt('s01', 'hawada') - 0.1, 's01', (ctx, lt) => {
    clock(ctx, CX - 160, 760, 170, lt); airDots(ctx, CX + 20, 700, lt + 1.6, 14, 330);
    bigText(ctx, '2 SAAC', CX + 200, 980, 90, E.oBack(inv(0.2, 0.5, lt)), RED); source(ctx, 'WHO', 1);
  }, '2 SAACADOOD', [[0, 'tick', { dur: 1.5 }]]);
  card(wt('s01', 'waa') - 0.1, 's01', (ctx, lt) => { virus(ctx, CX, CY, 230 * E.oBack(inv(0, 0.35, lt), 2), 1, lt * 0.4); }, 'JADEECO', [[0, 'pop'], [0.2, 'whoosh', { dur: 0.5 }]]);

  // ——— 2 · how it spreads: breath, coughs, sneezes; even a room a sick person has left ———
  card(S('s02').t, 's02', (ctx, lt) => {
    virus(ctx, CX, 680, 120, 1, lt * 0.5);
    [['NEEF', 'neefta,', 220], ['QUFAC', 'qufaca', 540], ['HINDHISO', 'hindhisada.', 860]].forEach(([s, w, x]) => {
      const tw = sinceW('s02', w) - 0.1, k = E.oBack(inv(tw, tw + 0.3, lt)); if (k > 0) { disc(ctx, x, 950, 90 * k, WHITE); airDots(ctx, x - 40, 950, (lt - tw) * 1.5, 5, 90); label(ctx, s, x, 1075, k, 28); } });
  }, 'FAYRAS', [[sinceW('s02', 'neefta,') - 0.1, 'air', { dur: 0.7, gain: 0.7 }], [sinceW('s02', 'qufaca') - 0.1, 'cough', { gain: 0.8 }], [sinceW('s02', 'hindhisada.') - 0.1, 'sneeze']]);
  card(wt('s02', 'xitaa') - 0.1, 's02', (ctx, lt) => {
    const b0 = sinceW('s02', 'xitaa') - 0.1, tq = sinceW('s02', 'qof') - b0, tr = sinceW('s02', 'qaadi') - b0;
    rrect(ctx, 150, 470, 780, 600, 30, WHITE); rrect(ctx, 150, 1040, 780, 30, 10, '#c7d4d4'); rrect(ctx, 760, 700, 130, 340, 10, TEAL); rrect(ctx, 260, 560, 220, 150, 10, '#d6e6ea');
    airDots(ctx, 250, 760, lt + 3, 16, 460);
    const x = lerp(840, 520, E.io(inv(tq - 0.4, tq + 0.6, lt))); fig(ctx, x, 1040, 300, lt > tr ? RED : '#9fb3b3');
  }, 'XITAA QOLKA', [[0, 'whoosh', { dur: 0.6 }], [sinceW('s02', 'qaadi') - sinceW('s02', 'xitaa') + 0.1, 'pop']]);

  // ——— 3 · how it develops: 10–12 days, fever, runny nose, cough, red eyes; rash from the face down; hard to see on darker skin ———
  const s3 = S('s03');
  card(s3.t, 's03', (ctx, lt) => {
    timeline(ctx, lerp(0, 11, E.io(inv(0.1, 1.2, lt))), lt);
    [['qandho,', 'QANDHO', 330, 520], ['duray,', 'DURAY', 750, 520], ['qufac', 'QUFAC', 330, 800], ['indho', 'INDHO CAS', 750, 800]].forEach(([w, s, x, y], i) => {
      const tw = sinceW('s03', w) - 0.15, k = E.oBack(inv(tw, tw + 0.3, lt)); if (k <= 0) return;
      disc(ctx, x, y, 100 * k, '#e3ebeb');
      ctx.save(); ctx.translate(x, y); ctx.scale(k * 0.85, k * 0.85);
      if (i === 0) thermo(ctx, 0, 0, 150, 0.8); if (i === 1) tissue(ctx, 0, 10, 150); if (i === 2) airDots(ctx, -40, 0, 2, 6, 80); if (i === 3) eye(ctx, 0, 0, 80, 1);
      ctx.restore(); label(ctx, s, x, y + 135, k, 26);
    });
    bigText(ctx, '10–12', CX, 400, 64, E.oBack(inv(0.1, 0.4, lt)), RED);
    source(ctx, 'NHS', 1);
  }, 'CALAAMADAHA', [[0.1, 'tick', { dur: 1.0, gain: 0.6 }], [sinceW('s03', 'qandho,') - 0.15, 'pop'], [sinceW('s03', 'duray,') - 0.15, 'sneeze', { gain: 0.6 }], [sinceW('s03', 'qufac') - 0.15, 'cough', { gain: 0.7 }], [sinceW('s03', 'indho') - 0.15, 'pop']]);
  card(wt('s03', 'laba') - 0.1, 's03', (ctx, lt) => {
    const b0 = sinceW('s03', 'laba') - 0.1, tf = sinceW('s03', 'finan') - b0, tj = sinceW('s03', 'jirka') - b0;
    timeline(ctx, lerp(11, 14, E.io(inv(0, 1.0, lt))), lt);
    // the mouth with tiny white spots (visual only)
    const m = E.oBack(inv(0.1, 0.4, lt)) * (1 - E.o3(inv(tf - 0.3, tf, lt)));
    if (m > 0) { ctx.save(); ctx.translate(CX, 700); ctx.scale(m, m); ctx.fillStyle = '#c9535b'; ctx.beginPath(); ctx.ellipse(0, 0, 230, 120, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f2b6b6'; ctx.beginPath(); ctx.ellipse(0, 0, 180, 80, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 12; i++) disc(ctx, -120 + (i % 6) * 48, -25 + Math.floor(i / 6) * 45 + (i % 2) * 8, 9, WHITE); ctx.restore(); label(ctx, 'AFKA GUDIHIISA', CX, 880, m, 28); }
    // a faceless figure, the rash spreading from the face downward
    const f = E.oBack(inv(tf - 0.3, tf, lt));
    if (f > 0) { fig(ctx, CX, 950, 470 * f, TEAL, { skin: G.SKIN_M }); const r = E.io(inv(tf, tj + 0.8, lt));
      for (let i = 0; i < 70; i++) { const yy = 535 + G.hash(i) * 400 * r, xx = CX + (G.hash(i + 30) - 0.5) * (yy < 600 ? 80 : 100); if (G.hash(i) <= r) disc(ctx, xx, yy, 6, rgba('#b8323a', 0.85)); } }
    source(ctx, 'NHS', 1);
  }, (lt) => (lt < sinceW('s03', 'finan') - (sinceW('s03', 'laba') - 0.1) - 0.2 ? 'DHIBCO CADCAD' : 'FINAN'), [[0.1, 'pop'], [sinceW('s03', 'finan') - sinceW('s03', 'laba') - 0.2, 'whoosh', { dur: 0.5 }]]);
  card(wt('s03', 'ogow:') - 0.1, 's03', (ctx, lt) => {
    fig(ctx, CX - 80, 1060, 600, TEAL, { skin: G.SKIN_D });
    for (let i = 0; i < 70; i++) { const yy = 470 + G.hash(i) * 520, xx = CX - 80 + (G.hash(i + 30) - 0.5) * (yy < 560 ? 90 : 120); disc(ctx, xx, yy, 6, rgba('#3b1f17', 0.55)); }
    const mx = lerp(CX + 300, CX + 40, E.io(inv(0.2, 1.0, lt))), my = 700;
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 110, 0, Math.PI * 2); ctx.clip(); ctx.translate(mx, my); ctx.scale(1.8, 1.8); ctx.translate(-mx, -my);
    fig(ctx, CX - 80, 1060, 600, TEAL, { skin: G.SKIN_D }); for (let i = 0; i < 70; i++) { const yy = 470 + G.hash(i) * 520, xx = CX - 80 + (G.hash(i + 30) - 0.5) * (yy < 560 ? 90 : 120); disc(ctx, xx, yy, 6, rgba('#7a2c2c', 0.8)); } ctx.restore();
    G.ring(ctx, mx, my, 110, 18, NAVY); G.seg(ctx, [mx + 80, my + 80], [mx + 170, my + 170], 26, NAVY);
    source(ctx, 'NHS', 1);
  }, 'MAQAARKA MADOW', [[0.2, 'whoosh', { dur: 0.6 }]]);

  // ——— 4 · hidden spread: 4 days before the rash, without knowing ———
  const s4 = S('s04');
  split2(wt('s04', 'isagoon'), s4.t, 's04', (ctx, lt) => {
    const ti = sinceW('s04', 'isagoon') - 0.1;
    if (lt < ti) { timeline(ctx, 14, lt, [10, 14]); bigText(ctx, '−4', CX, 640, 230, E.oBack(inv(0.1, 0.45, lt), 1.8), RED); label(ctx, 'MAALMOOD', CX, 830, E.o3(inv(0.3, 0.6, lt)), 50); }
    else { const u = E.io(inv(ti, ti + 2.0, lt)), x = lerp(170, 920, u);
      SCHOOL(ctx, 330, 860, 280); MARKET(ctx, 760, 860, 300);
      for (let i = 0; i < 14; i++) { const px = 170 + i * 55; if (px < x) virus(ctx, px, 960 + Math.sin(i) * 20, 10, 0.9, i); }
      fig(ctx, x, 1060, 220, TEAL); }
  }, (lt) => (lt < sinceW('s04', 'isagoon') - 0.1 ? '4 MAALMOOD' : 'ISAGOON OGEYN'), [[0.1, 'pop']], [[0, 'whoosh', { dur: 1.0 }], [0.4, 'cough', { gain: 0.5 }]]);

  // ——— 5 · why it's deadly: pneumonia, diarrhoea, brain swelling, blindness; it wipes immune memory (11–73%) ———
  const s5 = S('s05');
  card(s5.t, 's05', (ctx, lt) => {
    [['oof-wareen,', 'OOF-WAREEN', 330, 600], ['shuban,', 'SHUBAN', 750, 600], ['barar', 'MASKAX', 330, 930], ['indho', 'INDHO', 750, 930]].forEach(([w, s, x, y], i) => {
      const tw = sinceW('s05', w) - 0.15, k = E.oBack(inv(tw, tw + 0.3, lt)); if (k <= 0) return;
      disc(ctx, x, y, 120 * k, WHITE); ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      if (i === 0) lungs(ctx, 0, 0, 170); if (i === 1) stomach(ctx, 0, 0, 160); if (i === 2) brain(ctx, 0, 10, 170); if (i === 3) eye(ctx, 0, 0, 80);
      ctx.restore(); crack(ctx, x, y, 150, inv(tw + 0.2, tw + 0.5, lt)); label(ctx, s, x, y - 140, k, 26);
    });
  }, 'KHATAR', ['oof-wareen,', 'shuban,', 'barar', 'indho'].map((w) => [sinceW('s05', w) - 0.15, 'pop']));
  const blocks = (ctx, lt, gone, hit) => {
    for (let i = 0; i < 48; i++) { const x = CX - 245 + (i % 8) * 70, y = 520 + Math.floor(i / 8) * 80, lost = G.hash(i + 13) < gone; if (lost) continue; rrect(ctx, x - 28, y - 32, 56, 64, 10, GRN); }
    if (hit > 0) for (let i = 0; i < 6; i++) virus(ctx, lerp(-60, CX - 160 + i * 60, E.o3(clamp(hit * 1.5 - i * 0.12))), 560 + i * 70, 24, 1, lt + i);
  };
  card(wt('s05', 'oo', 1) - 0.1, 's05', (ctx, lt) => { blocks(ctx, lt, 0.73 * E.io(inv(1.2, 3.4, lt)), inv(0.5, 2.5, lt)); }, 'XUSUUSTA DIFAACA', [[0.6, 'whoosh', { dur: 0.8 }], [1.4, 'pop']]);
  card(wt('s05', 'carruurta') - 0.1, 's05', (ctx, lt) => {
    blocks(ctx, lt, 0.73, 0); ctx.save(); ctx.globalAlpha = 0.85; rrect(ctx, CX - 300, 640, 600, 200, 40, WHITE); ctx.restore();
    const p = inv(sinceW('s05', '11%') - (sinceW('s05', 'carruurta') - 0.1) - 0.1, sinceW('s05', '73%') - (sinceW('s05', 'carruurta') - 0.1) + 0.6, lt);
    bigNum(ctx, 73, CX, 740, 150, p, RED, (v) => '11–' + Math.max(11, Math.round(v)) + '%');
    source(ctx, 'Science, 2019', E.o3(inv(0.4, 0.8, lt)));
  }, '11–73%', [[sinceW('s05', '11%') - sinceW('s05', 'carruurta'), 'tick', { dur: 1.6 }]]);

  // ——— 6 · the world: 11 million cases, 95,000 deaths in a year (2024) ———
  const s6 = S('s06');
  const wp = ([lon, lat]) => [CX + (lon - 10) * 3.6, CY - (lat - 10) * 4.0];
  split2(wt('s06', '95,000'), s6.t, 's06', (ctx, lt) => {
    clipStage(ctx, () => { ctx.fillStyle = '#d6e6ea'; ctx.fillRect(0, 0, W, H); G.geo(ctx, window.LAND, wp, '#c7d4d4');
      for (let i = 0; i < 40; i++) { const k = E.oBack(inv(0.2 + i * 0.04, 0.5 + i * 0.04, lt)); if (k > 0) { const lon = -100 + G.hash(i + 4) * 240, lat = -30 + G.hash(i + 8) * 75, q = wp([lon, lat]); disc(ctx, q[0], q[1], 9 * k, RED); } } });
    const t1 = sinceW('s06', '11') - 0.1, t2 = sinceW('s06', '95,000') - 0.1;
    ctx.save(); ctx.globalAlpha = 0.88; rrect(ctx, CX - 330, 560, 660, 360, 40, WHITE); ctx.restore();
    bigNum(ctx, 11000000, CX, 650, 96, inv(t1, t1 + 1.0, lt), RED); label(ctx, 'XAALADOOD', CX, 720, E.o3(inv(t1, t1 + 0.4, lt)), 28);
    bigNum(ctx, 95000, CX, 810, 96, inv(t2, t2 + 0.9, lt), NAVY); label(ctx, 'DHIMASHO', CX, 880, E.o3(inv(t2, t2 + 0.4, lt)), 28);
    pill(ctx, '2024', CX, 470, NAVY, WHITE, E.oBack(inv(0.1, 0.4, lt)), 30); source(ctx, 'WHO', E.o3(inv(t1 + 0.3, t1 + 0.7, lt)));
  }, 'ADDUUNKA', [[sinceW('s06', '11') - 0.1, 'tick', { dur: 1.0 }]], [[0, 'tick', { dur: 0.9 }]]);

  // ——— 7 · Somalia: 43% of child deaths (with pneumonia and diarrhoea); Kismayo ~680 deaths ———
  const s7 = S('s07');
  const sp = ([lon, lat]) => [CX + (lon - 46) * 34, CY - (lat - 5) * 34];
  card(s7.t, 's07', (ctx, lt) => {
    G.geo(ctx, window.SOM, sp, '#c7d4d4');
    const tp = sinceW('s07', '43%') - 0.2, p = E.io(inv(tp, tp + 0.9, lt));
    disc(ctx, CX + 150, 620, 150, WHITE); if (p > 0) { ctx.save(); ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(CX + 150, 620); ctx.arc(CX + 150, 620, 140, -Math.PI / 2, -Math.PI / 2 + p * 0.43 * Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
    bigNum(ctx, 43, CX + 150, 860, 110, inv(tp, tp + 0.9, lt), RED, (v) => Math.round(v) + '%');
    source(ctx, 'WHO Somalia', E.o3(inv(tp + 0.4, tp + 0.8, lt)));
  }, 'SOOMAALIYA', [[sinceW('s07', '43%') - 0.2, 'tick', { dur: 0.9 }]]);
  card(wt('s07', 'kismaayo') - 0.1, 's07', (ctx, lt) => {
    G.geo(ctx, window.SOM, sp, '#c7d4d4');
    const k = sp([42.54, -0.36]); for (let i = 0; i < 3; i++) { const u = (lt * 0.8 + i / 3) % 1; G.ring(ctx, k[0], k[1], 18 + u * 90, 7 * (1 - u), rgba(RED, 1 - u)); } disc(ctx, k[0], k[1], 16, RED);
    pill(ctx, 'KISMAAYO', k[0] + 40, k[1] - 70, NAVY, WHITE, E.oBack(inv(0.1, 0.4, lt)), 28); pill(ctx, '2020–2021', CX + 160, 470, NAVY, WHITE, E.oBack(inv(0.3, 0.6, lt)), 26);
    const t6 = sinceW('s07', '680') - (sinceW('s07', 'kismaayo') - 0.1) - 0.1; bigNum(ctx, 680, CX + 170, 680, 120, inv(t6, t6 + 0.9, lt), RED, (v) => '~' + Math.round(v));
    source(ctx, 'MSF / Epicentre', E.o3(inv(t6 + 0.3, t6 + 0.7, lt)));
  }, 'KISMAAYO', [[0.1, 'pop'], [sinceW('s07', '680') - sinceW('s07', 'kismaayo'), 'tick', { dur: 0.9 }]]);

  // ——— 8 · the diaspora: Minnesota 92% → 42%; UK: a child died in Liverpool (2025), measles-free status lost (2026) ———
  const s8 = S('s08');
  card(s8.t, 's08', (ctx, lt) => {
    const t9 = sinceW('s08', '92%') - 0.2, t4 = sinceW('s08', '42%.') - 0.2, v = lerp(92, 42, E.io(inv(t4 - 0.6, t4 + 0.4, lt)));
    rrect(ctx, CX - 110, 600, 220, 440, 30, rgba(NAVY, 0.12)); const h = 440 * v / 100 * E.o3(inv(t9, t9 + 0.5, lt)); if (h > 0) rrect(ctx, CX - 110, 1040 - h, 220, h, 30, v > 60 ? GRN : RED);
    bigNum(ctx, v, CX, 520, 110, inv(t9, t9 + 0.4, lt), v > 60 ? GRN : RED, (q) => Math.round(q) + '%');
    pill(ctx, 'MINNESOTA', CX, 420, NAVY, WHITE, E.oBack(inv(0.1, 0.4, lt)), 28); label(ctx, 'TALLAALKA MMR', CX, 1090, 1, 26);
    source(ctx, 'Minnesota Dept of Health', E.o3(inv(t9 + 0.3, t9 + 0.7, lt)));
  }, '92% → 42%', [[sinceW('s08', '92%') - 0.2, 'pop'], [sinceW('s08', '42%.') - 0.8, 'whoosh', { dur: 0.9 }]]);
  const UKL = window.LAND.filter((r) => { const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2; return cx > -11 && cx < 2 && cy > 49 && cy < 61; });
  const ukp = ([lon, lat]) => [300 + (lon + 5) * 34, 830 - (lat - 54) * 34 * 1.65];
  card(wt('s08', 'uk-gana,') - 0.1, 's08', (ctx, lt) => {
    const b0 = sinceW('s08', 'uk-gana,') - 0.1, ti = sinceW('s08', 'ilmo') - b0, tl = sinceW('s08', 'lumiyay') - b0;
    G.geo(ctx, UKL, ukp, '#9fb3b3');
    const lv = ukp([-3, 53.4]), c = E.oBack(inv(ti, ti + 0.3, lt));
    if (c > 0) { ctx.save(); ctx.translate(lv[0], lv[1]); ctx.scale(c, c); rrect(ctx, -12, -50, 24, 60, 6, WHITE); ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.ellipse(0, -66, 9, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      pill(ctx, 'LIVERPOOL · 2025', lv[0] - 30, lv[1] + 70, NAVY, WHITE, c, 24); }
    const b = E.oBack(inv(0.2, 0.5, lt)), cr = E.o3(inv(tl, tl + 0.5, lt));
    if (b > 0) { ctx.save(); ctx.translate(780, 640); ctx.scale(b, b); disc(ctx, 0, 0, 130, cr > 0 ? mix(GRN, '#9fb3b3', cr) : GRN); G.tick(ctx, 0, -15, 90, WHITE, 1);
      ctx.fillStyle = WHITE; ctx.font = '800 22px Montserrat'; ctx.textAlign = 'center'; ctx.fillText('JADEECO KA XOR', 0, 75);
      if (cr > 0) { ctx.strokeStyle = NAVY; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-30, -130); ctx.lineTo(-30 + 40 * cr, -50 * cr); ctx.lineTo(-10, 40 * cr); ctx.lineTo(20, 130 * cr); ctx.stroke(); }
      ctx.restore(); pill(ctx, '2026', 780, 820, RED, WHITE, cr, 26); }
    source(ctx, 'UKHSA', 1);
  }, 'UK', [[0, 'whoosh', { dur: 0.6 }], [sinceW('s08', 'ilmo') - sinceW('s08', 'uk-gana,') + 0.1, 'pop'], [sinceW('s08', 'lumiyay') - sinceW('s08', 'uk-gana,') + 0.1, 'tear', { dur: 0.5, gain: 0.6 }]]);

  // ——— 9 · the myth: the 1998 claim (12 children, retracted); Denmark, 657,000 children: no link ———
  const s9 = S('s09');
  card(s9.t, 's09', (ctx, lt) => {
    for (let i = 0; i < 7; i++) { const k = E.oBack(inv(0.2 + i * 0.15, 0.45 + i * 0.15, lt)); if (k <= 0) continue; const x = 200 + (i % 4) * 230 + (i > 3 ? 115 : 0), y = 560 + (i > 3 ? 300 : 0);
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k); G.bubble(ctx, 0, 0, 170, 110, WHITE); bigText(ctx, '!', 0, 4, 80, 1, RED); ctx.restore(); }
    pill(ctx, 'MMR ≠ OTISAM', CX, 1060, NAVY, WHITE, E.oBack(inv(sinceW('s09', 'otisam.') - 0.2, sinceW('s09', 'otisam.') + 0.1, lt)), 30);
  }, 'WARAR BEEN AH', [[0.2, 'pop'], [0.5, 'pop'], [0.8, 'pop']]);
  card(wt('s09', 'daraasaddaas') - 0.1, 's09', (ctx, lt) => {
    const b0 = sinceW('s09', 'daraasaddaas') - 0.1, tb = sinceW('s09', 'buriyay.') - b0 - 0.2;
    ctx.save(); ctx.translate(CX, 760); ctx.rotate(-0.04); rrect(ctx, -230, -300, 460, 600, 20, WHITE); bigText(ctx, '1998', 0, -220, 70, 1, NAVY);
    for (let i = 0; i < 12; i++) fig(ctx, -150 + (i % 6) * 60, -40 + Math.floor(i / 6) * 150, 110, '#9fb3b3');
    const s = E.oBack(inv(tb, tb + 0.3, lt), 2.4); if (s > 0) { ctx.save(); ctx.rotate(-0.25); ctx.scale(s, s); ctx.strokeStyle = RED; ctx.lineWidth = 14; ctx.strokeRect(-210, -60, 420, 120); bigText(ctx, 'BURIYAY', 0, 4, 76, 1, RED); ctx.restore(); }
    ctx.restore(); source(ctx, 'Lancet (retracted)', E.o3(inv(tb, tb + 0.4, lt)));
  }, '12 CARRUUR', [[sinceW('s09', 'buriyay.') - sinceW('s09', 'daraasaddaas') - 0.1, 'thump'], [sinceW('s09', 'buriyay.') - sinceW('s09', 'daraasaddaas'), 'pop']]);
  card(wt('s09', 'daraasad', 1) - 0.1, 's09', (ctx, lt) => {
    const b0 = sinceW('s09', 'daraasad', 1) - 0.1, tn = sinceW('s09', '657,000') - b0 - 0.1, tx = sinceW('s09', 'xiriir') - b0 - 0.1;
    for (let i = 0; i < 120; i++) { const k = E.o3(inv(i * 0.008, 0.25 + i * 0.008, lt)); if (k <= 0) continue; fig(ctx, 140 + (i % 15) * 57, 640 + Math.floor(i / 15) * 60, 52 * k, GRN); }
    ctx.save(); ctx.globalAlpha = 0.9; rrect(ctx, CX - 290, 690, 580, 170, 40, WHITE); ctx.restore();
    bigNum(ctx, 657000, CX, 775, 110, inv(tn, tn + 1.0, lt), NAVY);
    const k = E.oBack(inv(tx, tx + 0.3, lt)); if (k > 0) { disc(ctx, CX + 300, 520, 70 * k, GRN); G.tick(ctx, CX + 300, 520, 80 * k, WHITE, E.oExp(inv(tx + 0.1, tx + 0.4, lt))); }
    pill(ctx, 'XIRIIR MA JIRO', CX, 1080, GRN, WHITE, k, 30);
    source(ctx, 'Annals of Internal Medicine, 2019', E.o3(inv(tn + 0.3, tn + 0.7, lt)));
  }, 'DENMARK', [[0, 'whoosh', { dur: 0.6 }], [sinceW('s09', '657,000') - sinceW('s09', 'daraasad', 1), 'tick', { dur: 1.0 }], [sinceW('s09', 'xiriir') - sinceW('s09', 'daraasad', 1), 'ding']]);

  // ——— 10 · measles finds every gap; two MMR doses protect; free in the UK ———
  const s10 = S('s10');
  const GAPS = [3, 9, 16, 22];
  const wall = (ctx, lt, fill) => {
    for (let i = 0; i < 25; i++) { const x = CX - 280 + (i % 5) * 140, y = 520 + Math.floor(i / 5) * 120, g = GAPS.indexOf(i);
      if (g >= 0) { const f = clamp(fill * GAPS.length - g); if (f > 0) { shield(ctx, x, y, 110 * E.oBack(f), mix(GRN, '#2f7d3a', 0.4)); ctx.save(); ctx.fillStyle = WHITE; ctx.font = '900 20px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(g % 2 ? 'MMR 2' : 'MMR 1', x, y + 8); ctx.restore(); }
        else virus(ctx, x + Math.sin(lt * 3 + g) * 12, y, 26, 1, lt); }
      else shield(ctx, x, y, 110, GRN); }
  };
  card(s10.t, 's10', (ctx, lt) => wall(ctx, lt, 0), 'TALLAAL LA\'AAN', [[0.3, 'pop']]);
  card(wt('s10', 'laba') - 0.1, 's10', (ctx, lt) => {
    wall(ctx, lt, E.io(inv(0.3, 1.8, lt)));
    pill(ctx, 'UK: BILAASH', CX, 1100, NAVY, WHITE, E.oBack(inv(sinceW('s10', 'bilaash.') - (sinceW('s10', 'laba') - 0.1) - 0.1, sinceW('s10', 'bilaash.') - (sinceW('s10', 'laba') - 0.1) + 0.2, lt)), 28);
  }, 'MMR 1 + MMR 2', [[0.4, 'pop'], [0.8, 'pop'], [1.2, 'pop'], [1.6, 'pop'], [1.9, 'ding', { gain: 0.6 }]]);

  // ——— 11 · not medical advice; send this to another parent (+ subscribe on screen), then the loop ———
  const s11 = S('s11');
  card(s11.t, 's11', (ctx, lt) => {
    const k = E.oBack(inv(0.05, 0.4, lt));
    ctx.save(); ctx.translate(CX, 600); ctx.scale(k, k); rrect(ctx, -380, -110, 760, 220, 40, WHITE); disc(ctx, -260, 0, 52, TEAL);
    ctx.fillStyle = WHITE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 70px Montserrat'; ctx.fillText('i', -260, 4);
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.font = '800 36px Montserrat'; ctx.fillText('Talo caafimaad maaha.', -180, -24); ctx.font = '800 28px Montserrat'; ctx.fillStyle = rgba(INK, 0.75); ctx.fillText('La tasho dhakhtarkaaga.', -180, 34); ctx.restore();
    const u = E.oBack(inv(sinceW('s11', 'u') - 0.1, sinceW('s11', 'u') + 0.25, lt));
    if (u > 0) { ctx.save(); ctx.translate(CX, 900); ctx.scale(u, u); rrect(ctx, -300, -70, 600, 140, 70, TEAL); poly(ctx, [[-230, -30], [-150, 0], [-230, 30], [-215, 0]], WHITE); ctx.fillStyle = WHITE; ctx.font = '900 38px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('U DIR WAALID KALE', -130, 4); ctx.restore(); }
    const s = E.oBack(inv(sinceW('s11', 'u') + 0.5, sinceW('s11', 'u') + 0.85, lt), 1.6);
    if (s > 0) { ctx.save(); ctx.translate(CX, 1090); ctx.scale(s * 0.85, s * 0.85); disc(ctx, -300, 0, 62, GRN); ctx.save(); ctx.translate(-300, 10); ctx.scale(0.5, 0.5); G.thumb(ctx, 0, 0, 170, WHITE, INK, TEAL); ctx.restore();
      rrect(ctx, -210, -52, 470, 104, 52, RED); G.bell(ctx, -150, -2, 44, WHITE); ctx.fillStyle = WHITE; ctx.font = '900 40px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SUBSCRIBE', -100, 3); ctx.restore(); }
  }, '', [[0.05, 'pop'], [sinceW('s11', 'u') - 0.1, 'whoosh', { dur: 0.5 }], [sinceW('s11', 'u') + 0.5, 'pop']]);
  card(s11.v + s11.vd + 0.9, 's11', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : lt), 'WAAYO?', [[0.25, 'cough', { gain: 0.8 }]]);
  C[C.length - 1].loop = true;

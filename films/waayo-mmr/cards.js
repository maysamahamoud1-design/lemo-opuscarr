  // ═════════ the MMR-myth story's cards (spliced into film.js by tools/splice.py) ═════════
  const NAVY = '#1d2d44', RED = '#d64045', GRN = '#5fad56', YEL = '#ffc93c', WHITE = '#f7f9f9', GREY = '#9fb3b3';
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;
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
  const label = (ctx, s, x, y, k = 1, px = 30, col = INK) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = col; ctx.font = `800 ${px}px Montserrat`; ctx.textAlign = 'center'; ctx.fillText(s, x, y); ctx.restore(); };
  const kid = (ctx, x, y, h, cloth, skin = G.SKIN_D) => { if (h > 1) G.figure(ctx, x, y, h, { skin, cloth, child: true }); };
  const adult = (ctx, x, y, h, cloth, cov = false) => { if (h > 1) G.figure(ctx, x, y, h, { skin: G.SKIN_D, cloth, covered: cov }); };
  const KIDC = ['#4189dd', '#5fad56', '#ffc93c', '#d64045', '#25b5a5', '#e8604c'];
  const virus = (ctx, x, y, r, a = 1, spin = 0) => { if (r <= 0) return; ctx.save(); ctx.globalAlpha = a;
    for (let i = 0; i < 8; i++) { const t = spin + i / 8 * Math.PI * 2; G.seg(ctx, [x + Math.cos(t) * r * 0.8, y + Math.sin(t) * r * 0.8], [x + Math.cos(t) * r * 1.35, y + Math.sin(t) * r * 1.35], r * 0.16, RED); disc(ctx, x + Math.cos(t) * r * 1.4, y + Math.sin(t) * r * 1.4, r * 0.18, RED); }
    disc(ctx, x, y, r, RED); ctx.restore(); };
  // a vaccine: a syringe pictogram (barrel, plunger, needle), (x, y) centre, s = length, ang
  const syringe = (ctx, x, y, s, ang = -0.6) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    rrect(ctx, -s * 0.35, -s * 0.11, s * 0.7, s * 0.22, s * 0.05, WHITE); rrect(ctx, -s * 0.33, -s * 0.09, s * 0.42, s * 0.18, s * 0.04, '#9fd3ef');
    G.seg(ctx, [-s * 0.35, 0], [-s * 0.55, 0], s * 0.06, GREY); G.seg(ctx, [-s * 0.55, -s * 0.12], [-s * 0.55, s * 0.12], s * 0.05, GREY);
    G.seg(ctx, [s * 0.35, 0], [s * 0.55, 0], s * 0.025, NAVY); ctx.strokeStyle = NAVY; ctx.lineWidth = s * 0.02; ctx.strokeRect(-s * 0.35, -s * 0.11, s * 0.7, s * 0.22); ctx.restore(); };
  const paper = (ctx, x, y, w, h, rot = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rrect(ctx, -w / 2, -h / 2, w, h, 16, '#ffffff');
    for (let i = 0; i < 6; i++) rrect(ctx, -w / 2 + 40, -h / 2 + 150 + i * 46, (w - 80) * (i % 3 === 2 ? 0.6 : 0.95), 14, 7, '#dfe5ea'); ctx.restore(); };
  const shield = (ctx, x, y, s, col) => { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - s * 0.55); ctx.lineTo(x + s * 0.45, y - s * 0.38); ctx.lineTo(x + s * 0.4, y + s * 0.1); ctx.quadraticCurveTo(x + s * 0.3, y + s * 0.45, x, y + s * 0.6); ctx.quadraticCurveTo(x - s * 0.3, y + s * 0.45, x - s * 0.4, y + s * 0.1); ctx.lineTo(x - s * 0.45, y - s * 0.38); ctx.closePath(); ctx.fill(); ctx.restore(); };
  const heart = (ctx, x, y, s, col) => { disc(ctx, x - s * 0.26, y - s * 0.12, s * 0.3, col); disc(ctx, x + s * 0.26, y - s * 0.12, s * 0.3, col); poly(ctx, [[x - s * 0.55, y - s * 0.02], [x + s * 0.55, y - s * 0.02], [x, y + s * 0.58]], col); };
  const crowd = (ctx, lt, n, h, col, y0 = 560, cols = 11, worry = false) => {
    for (let i = 0; i < n; i++) { const k = E.oBack(inv(i * 0.012, 0.2 + i * 0.012, lt)); if (k <= 0) continue; const x = 120 + (i % cols) * (840 / (cols - 1)), y = y0 + Math.floor(i / cols) * h * 1.08;
      adult(ctx, x, y, h * k, col, i % 3 === 1); if (worry && i % 7 === 3) bigText(ctx, '?', x + h * 0.25, y - h * 1.05, h * 0.45, k, RED); }
  };

  // ——— the opening (also the shot the film loops into): 12 children popping in ———
  const opening = (ctx, lt) => {
    for (let i = 0; i < 12; i++) { const t0 = -0.35 + i * 0.09, k = E.oBack(inv(t0, t0 + 0.22, lt), 2); if (k <= 0) continue;
      kid(ctx, 205 + (i % 4) * 225, 640 + Math.floor(i / 4) * 215, 190 * k, KIDC[i % KIDC.length]); }
  };
  const popsAt = (base) => Array.from({ length: 12 }, (_, i) => [base + i * 0.09 + 0.05, 'pop', { gain: 0.55 }]).filter((e) => e[0] >= 0);

  // ——— 1 · 12 children. One study. It scared millions of parents. ———
  card(0, 's01', (ctx, lt) => { opening(ctx, lt); bigText(ctx, '12', CX, 420, 120, E.oBack(inv(-0.3, 0.2, lt)), YEL); }, '12 CARRUUR', popsAt(-0.35));
  card(wt('s01', 'hal') - 0.1, 's01', (ctx, lt) => {
    paper(ctx, CX, 760, 520, 640, -0.03);
    bigText(ctx, '1 DARAASAD', CX, 520, 58, E.oBack(inv(0.05, 0.35, lt)), NAVY);
    for (let i = 0; i < 12; i++) kid(ctx, 330 + (i % 6) * 84, 760 + Math.floor(i / 6) * 150, 110, KIDC[i % KIDC.length]);
  }, '12 CARRUUR', [[0, 'paper']]);
  card(S('s02').t, 's02', (ctx, lt) => {
    crowd(ctx, lt, 66, 105, GREY, 520, 11, true);
    ctx.save(); ctx.globalAlpha = 0.9; rrect(ctx, CX - 300, 700, 600, 150, 40, WHITE); ctx.restore();
    bigText(ctx, 'MALAAYIIN', CX, 778, 96, E.oBack(inv(0.3, 0.6, lt)), RED);
  }, 'MALAAYIIN WAALID', [[0.1, 'whoosh', { dur: 0.5 }], [0.35, 'pop']]);

  // ——— 2 · 1998: a British doctor claimed MMR causes autism ———
  card(wt('s02', 'dhakhtar') - 0.1, 's02', (ctx, lt) => {
    const k = E.o3(inv(0, 0.4, lt)); paper(ctx, lerp(1400, CX, k), 760, 520, 640, -0.03 * k);
    bigText(ctx, '1998', lerp(1400, CX, k), 520, 110, 1, NAVY);
    adult(ctx, CX + 300, 1060, 260, '#ffffff');
    source(ctx, 'The Lancet, 1998', E.o3(inv(0.3, 0.7, lt)));
  }, 'MMR → OTISAM?', [[0, 'paper'], [0.1, 'whoosh', { dur: 0.4 }]]);
  card(wt('s02', 'tallaalka') - 0.1, 's02', (ctx, lt) => {
    syringe(ctx, 290, 760, 300, -0.3);
    const a = E.o3(inv(0.1, 0.5, lt)); G.seg(ctx, [420, 760], [lerp(420, 640, a), 760], 16, NAVY);
    if (a > 0.95) { ctx.save(); ctx.strokeStyle = NAVY; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(610, 730); ctx.lineTo(645, 760); ctx.lineTo(610, 790); ctx.stroke(); ctx.restore(); }
    bigText(ctx, 'OTISAM?', 820, 760, 70, E.oBack(inv(sinceW('s02', 'otisam.') - (sinceW('s02', 'tallaalka') - 0.1) - 0.2, sinceW('s02', 'otisam.') - (sinceW('s02', 'tallaalka') - 0.1) + 0.15, lt)), RED);
    source(ctx, 'The Lancet, 1998', 1);
  }, 'MMR → OTISAM?', [[0.1, 'whoosh', { dur: 0.4 }], [sinceW('s02', 'otisam.') - sinceW('s02', 'tallaalka'), 'pop']]);

  // ——— 3 · found dishonest; retracted; he lost his medical licence ———
  card(S('s03').t, 's03', (ctx, lt) => {
    paper(ctx, CX, 760, 520, 640, -0.03); bigText(ctx, '1998', CX, 520, 110, 1, NAVY);
    const m = E.io(inv(0.1, 1.0, lt)), mx = lerp(CX + 260, CX - 40, m), my = 780;
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 110, 0, Math.PI * 2); ctx.clip(); bigText(ctx, 'BEEN', mx, my, 70, 1, RED); ctx.restore();
    G.ring(ctx, mx, my, 110, 18, NAVY); G.seg(ctx, [mx + 80, my + 80], [mx + 170, my + 170], 26, NAVY);
    source(ctx, 'BMJ, 2011', E.o3(inv(0.6, 1.0, lt)));
  }, 'WAA LA BURIYAY', [[0.1, 'whoosh', { dur: 0.6 }]]);
  card(wt('s03', 'waa') - 0.1, 's03', (ctx, lt) => {
    paper(ctx, CX, 760, 520, 640, -0.03); bigText(ctx, '1998', CX, 520, 110, 1, NAVY);
    const s = E.oBack(inv(0.05, 0.3, lt), 2.6); if (s > 0) { ctx.save(); ctx.translate(CX, 790); ctx.rotate(-0.22); ctx.scale(s, s); ctx.strokeStyle = RED; ctx.lineWidth = 14; ctx.strokeRect(-260, -80, 520, 160); bigText(ctx, 'WAA LA', 0, -28, 60, 1, RED); bigText(ctx, 'BURIYAY', 0, 38, 72, 1, RED); ctx.restore(); }
    source(ctx, 'The Lancet (retracted)', 1);
  }, 'WAA LA BURIYAY', [[0.05, 'thump'], [0.12, 'thump', { gain: 0.6 }]]);
  card(wt('s03', 'shatigiisii') - 0.1, 's03', (ctx, lt) => {
    const c = E.io(inv(0.3, 0.8, lt));
    for (const m of [-1, 1]) { ctx.save(); ctx.translate(CX + m * c * 60, 760 + c * 30); ctx.rotate(m * c * 0.18); ctx.beginPath(); ctx.rect(m < 0 ? -320 : 0, -200, 320, 400); ctx.clip();
      rrect(ctx, -300, -190, 600, 380, 30, '#ffffff'); rrect(ctx, -300, -190, 600, 90, 30, NAVY); bigText(ctx, 'SHATI', 0, -142, 46, 1, WHITE);
      disc(ctx, -170, 40, 80, '#dfe5ea'); for (let i = 0; i < 3; i++) rrect(ctx, -50, -10 + i * 50, 300 - i * 60, 18, 9, '#dfe5ea'); ctx.restore(); }
    if (c > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 1 - c; ctx.beginPath(); ctx.moveTo(CX, 560); ctx.lineTo(CX + 20, 660); ctx.lineTo(CX - 15, 760); ctx.lineTo(CX + 15, 960); ctx.stroke(); ctx.restore(); }
    source(ctx, 'The Lancet (retracted)', 1);
  }, 'WAA LA BURIYAY', [[0.3, 'tear', { dur: 0.5 }]]);

  // ——— 4 · Denmark: 657,000 children; vaccinated or not, the same autism risk; no link ———
  card(S('s04').t, 's04', (ctx, lt) => {
    for (let i = 0; i < 110; i++) { const k = E.o3(inv(i * 0.008, 0.2 + i * 0.008, lt)); if (k > 0) kid(ctx, 130 + (i % 11) * 82, 560 + Math.floor(i / 11) * 56, 46 * k, i % 2 ? GRN : '#4189dd'); }
    ctx.save(); ctx.globalAlpha = 0.9; rrect(ctx, CX - 300, 680, 600, 170, 40, WHITE); ctx.restore();
    bigNum(ctx, 657000, CX, 765, 116, inv(0, 1.4, lt), NAVY);
    pill(ctx, 'DENMARK', CX, 440, NAVY, WHITE, E.oBack(inv(0.05, 0.3, lt)), 30); source(ctx, 'Annals of Internal Medicine, 2019', E.o3(inv(0.3, 0.7, lt)));
  }, '657,000', [[0, 'tick', { dur: 1.3 }]]);
  card(wt('s04', 'kuwa') - 0.1, 's04', (ctx, lt) => {
    const sp = E.io(inv(0, 0.6, lt)), b = E.o3(inv(sinceW('s04', 'khatarta') - (sinceW('s04', 'kuwa') - 0.1) - 0.1, sinceW('s04', 'khatarta') - (sinceW('s04', 'kuwa') - 0.1) + 0.6, lt));
    [[CX - 200, GRN, 'LA TALLAALAY'], [CX + 200, '#4189dd', 'AAN LA TALLAALIN']].forEach(([x, col, lab], g) => {
      for (let i = 0; i < 12; i++) kid(ctx, x - 120 + (i % 4) * 80 + (g ? 1 : -1) * (1 - sp) * 150, 600 + Math.floor(i / 4) * 80, 62, col);
      rrect(ctx, x - 70, 1000 - 200 * b, 140, 200 * b + 1, 20, YEL); label(ctx, lab, x, 1060, 1, 26);
    });
    if (b > 0.9) bigText(ctx, '=', CX, 900, 120, E.oBack(inv(0.9, 1, b)), NAVY);
    source(ctx, 'Annals of Internal Medicine, 2019', 1);
  }, 'XIRIIR MA JIRO', [[0, 'whoosh', { dur: 0.6 }], [sinceW('s04', 'khatarta') - sinceW('s04', 'kuwa'), 'pop']]);
  card(wt('s04', 'xiriir') - 0.1, 's04', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt), 2); disc(ctx, CX, 740, 200 * k, GRN); G.tick(ctx, CX, 740, 220 * k, WHITE, E.oExp(inv(0.1, 0.5, lt)));
    pill(ctx, 'XIRIIR MA JIRO', CX, 1040, GRN, WHITE, E.oBack(inv(0.2, 0.5, lt)), 34);
    source(ctx, 'Annals of Internal Medicine, 2019', 1);
  }, 'XIRIIR MA JIRO', [[0.05, 'pop'], [0.15, 'ding']]);

  // ——— 5 · but the fear spread: Minnesota 92% → 42%; 2017, measles spread ———
  card(S('s05').t, 's05', (ctx, lt) => {
    crowd(ctx, lt, 55, 110, GREY, 540, 11, false);
    for (let i = 0; i < 9; i++) { const k = E.oBack(inv(0.15 + i * 0.1, 0.4 + i * 0.1, lt)); if (k > 0) { const x = 150 + (i % 5) * 190 + (i > 4 ? 95 : 0), y = 520 + (i > 4 ? 280 : 0); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); G.bubble(ctx, 0, 0, 120, 80, WHITE); bigText(ctx, '!', 0, 4, 60, 1, RED); ctx.restore(); } }
  }, 'CABSIDU WAY FAAFTAY', [[0.15, 'pop'], [0.45, 'pop'], [0.75, 'pop']]);
  card(wt('s05', 'minnesota,') - 0.1, 's05', (ctx, lt) => {
    const v = lerp(92, 42, E.io(inv(0.9, 2.4, lt))), h = 440 * v / 100 * E.o3(inv(0, 0.4, lt));
    rrect(ctx, CX - 110, 600, 220, 440, 30, rgba(NAVY, 0.12)); if (h > 0) rrect(ctx, CX - 110, 1040 - h, 220, h, 30, v > 60 ? GRN : RED);
    bigNum(ctx, v, CX, 520, 110, inv(0, 0.3, lt), v > 60 ? GRN : RED, (q) => Math.round(q) + '%');
    pill(ctx, 'MINNESOTA', CX, 430, NAVY, WHITE, E.oBack(inv(0.05, 0.3, lt)), 28); label(ctx, 'TALLAALKA MMR', CX, 1090, 1, 26);
    source(ctx, 'Minnesota Dept of Health', E.o3(inv(0.3, 0.7, lt)));
  }, 'CABSIDU WAY FAAFTAY', [[0.05, 'pop'], [0.9, 'whoosh', { dur: 1.2 }]]);
  card(wt('s05', 'kadib,') - 0.1, 's05', (ctx, lt) => {
    for (let i = 0; i < 8; i++) { const x = 160 + i * 108, red = lt > 0.5 + i * 0.25; kid(ctx, x, 980, 180, red ? RED : KIDC[i % KIDC.length]); if (red) virus(ctx, x + 30, 760, 16, 1, lt + i); }
    for (let i = 0; i < 10; i++) { const u = clamp((lt - 0.3 - i * 0.18) / 0.6); if (u > 0 && u < 1) virus(ctx, lerp(100, 980, (i + u) / 10), 700 - Math.sin(u * Math.PI) * 60, 12, 1, lt); }
    pill(ctx, '2017', CX, 470, RED, WHITE, E.oBack(inv(0.05, 0.3, lt)), 30); source(ctx, 'Minnesota Dept of Health', 1);
  }, 'JADEECO', [[0.1, 'pop'], [0.5, 'whoosh', { dur: 1.6, gain: 0.6 }]]);

  // ——— 6 · autism is real and autistic children deserve support; vaccines aren't the cause; it all started with… (loop) ———
  card(S('s06').t, 's06', (ctx, lt) => {
    const k = E.oBack(inv(0.05, 0.4, lt)); heart(ctx, CX, 780, 520 * k, rgba(YEL, 0.95)); kid(ctx, CX, 920, 300 * Math.min(1, k * 1.1), '#4189dd');
    pill(ctx, 'TAAGEERO', CX, 1060, NAVY, WHITE, E.oBack(inv(sinceW('s06', 'taageero') - 0.1, sinceW('s06', 'taageero') + 0.2, lt)), 32);
  }, 'OTISAM: TAAGEERO', [[0.05, 'pop'], [sinceW('s06', 'taageero'), 'ding', { gain: 0.5 }]]);
  card(wt('s06', 'laakiin') - 0.1, 's06', (ctx, lt) => {
    const s = E.oBack(inv(0.4, 0.75, lt), 1.8); if (s > 0.01) shield(ctx, CX, 760, 420 * s, GRN);
    syringe(ctx, CX, 760, 300, -0.6);
  }, 'TALLAALKU SABAB MA AHA', [[0.4, 'pop']]);
  card(wt('s06', 'dhammaan') - 0.1, 's06', (ctx, lt, P, t) => {
    // zoom back into the twelve children: the last frame is the first
    const p = E.io(inv(t - lt, DUR, t)), z = lerp(0.25, 1, p);
    ctx.save(); ctx.globalAlpha = 1 - p; crowd(ctx, 9, 66, 105, GREY, 520, 11, false); ctx.restore();
    ctx.save(); ctx.translate(CX, 760); ctx.scale(z, z); ctx.translate(-CX, -760); opening(ctx, t - DUR); ctx.restore();
    bigText(ctx, '12', CX, 420, 120, E.oBack(inv(-0.3, 0.2, t - DUR)), YEL);
  }, '12 CARRUUR', [[0.1, 'whoosh', { dur: 0.8 }], ...popsAt(DUR - (wt('s06', 'dhammaan') - 0.1) - 0.35).filter((e) => e[0] < DUR - (wt('s06', 'dhammaan') - 0.1))]);
  C[C.length - 1].loop = true;

  // ═════════ the blood-pressure story's cards (spliced into film.js by tools/splice.py) ═════════
  const RED = PAL.coral.t[1], REDL = PAL.coral.t[3], GRN = PAL.green.t[2], GREY = '#a9b1bd';
  const sinceW = (id, p, n = 0) => wt(id, p, n) - S(id).t;
  const pill = (ctx, s, x, y, bg, fg, k = 1, px = 38) => {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.font = `800 ${px}px Montserrat`; ctx.letterSpacing = '3px';
    const tw = ctx.measureText(s).width; rrect(ctx, x - tw / 2 - 22, y - px * 0.8, tw + 44, px * 1.6, px * 0.8, bg);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 1, y + 2); ctx.restore();
  };
  const source = (ctx, s, y, k = 1) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.7 * clamp(k); ctx.font = '500 24px "DM Mono"'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s, CX, Math.min(y, 1128)); ctx.restore(); };
  // a big animated number: counts up to `to` (p 0..1), with a prefix/suffix
  const bigNum = (ctx, to, x, y, px, p, col, fmt = (v) => String(Math.round(v))) => {
    if (p <= 0) return; const k = E.oBack(clamp(p * 3), 1.6);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = col; ctx.font = `900 ${px}px Montserrat`; ctx.letterSpacing = '-3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(to * E.o3(p)), 0, 0); ctx.restore();
  };
  // heart: two discs and a point; beat 0..1 swells it
  const heart = (ctx, x, y, s, col, beat = 0) => {
    const k = s * (1 + 0.12 * beat);
    disc(ctx, x - k * 0.26, y - k * 0.12, k * 0.3, col); disc(ctx, x + k * 0.26, y - k * 0.12, k * 0.3, col);
    poly(ctx, [[x - k * 0.55, y - k * 0.02], [x + k * 0.55, y - k * 0.02], [x, y + k * 0.58]], col);
  };
  const brain = (ctx, x, y, s, col, line) => {
    [[-0.3, -0.1, 0.32], [0, -0.25, 0.34], [0.3, -0.1, 0.32], [-0.18, 0.15, 0.3], [0.18, 0.15, 0.3]].forEach(([dx, dy, r]) => disc(ctx, x + dx * s, y + dy * s, r * s, col));
    ctx.save(); ctx.strokeStyle = line; ctx.lineWidth = s * 0.05; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.5); ctx.lineTo(x, y + s * 0.38); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - s * 0.25, y - s * 0.05, s * 0.14, -0.5, 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 0.25, y - s * 0.05, s * 0.14, 1.1, 3.6); ctx.stroke();
    ctx.restore();
  };
  const kidneys = (ctx, x, y, s, col) => {
    for (const m of [-1, 1]) {
      ctx.save(); ctx.translate(x + m * s * 0.3, y); ctx.scale(m, 1);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.22, s * 0.36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.ellipse(s * 0.2, 0, s * 0.08, s * 0.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  };
  // a crack: a zigzag drawn on (p)
  const crack = (ctx, x, y, s, col, p) => {
    if (p <= 0) return; const pts = [[0, -0.5], [0.12, -0.2], [-0.1, 0], [0.1, 0.22], [-0.04, 0.48]];
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    const n = (pts.length - 1) * clamp(p);
    for (let i = 0; i <= Math.ceil(n); i++) { const a = pts[Math.min(i, pts.length - 1)], u = Math.min(1, n - i + 1); const b = pts[Math.max(0, i - 1)];
      const q = i === 0 ? a : [lerp(b[0], a[0], u), lerp(b[1], a[1], u)]; i ? ctx.lineTo(x + q[0] * s, y + q[1] * s) : ctx.moveTo(x + q[0] * s, y + q[1] * s); }
    ctx.stroke(); ctx.restore();
  };
  // walking faceless figure (legs and arms swing), origin at the feet
  const walker = (ctx, x, y, h, lt, skin, cl, chest = 0) => {
    const u = h / 10, sw = Math.sin(lt * 5.5) * 0.45, hip = [x, y - u * 4.6], sh = [x, y - u * 7.6];
    const limb = (o, a, len, w, col) => G.seg(ctx, o, [o[0] + Math.sin(a) * len, o[1] + Math.cos(a) * len], w, col);
    limb(hip, -sw, u * 4.3, u * 1.05, G.mix(cl, '#ffffff', 0.3)); limb(sh, sw * 0.8, u * 3.2, u * 0.8, G.mix(skin, '#ffffff', 0.2));
    limb(hip, sw, u * 4.3, u * 1.05, cl);
    rrect(ctx, x - u * 0.95, sh[1] - u * 0.5, u * 1.9, hip[1] - sh[1] + u * 0.9, u * 0.9, cl);
    if (chest > 0) { disc(ctx, x + u * 0.2, sh[1] + u * 1.2, u * (0.5 + 0.9 * chest), rgba(RED, 0.35 * chest)); heart(ctx, x + u * 0.2, sh[1] + u * 1.1, u * (0.9 + 0.25 * chest), RED); }
    limb(sh, -sw * 0.8, u * 3.2, u * 0.8, skin);
    disc(ctx, x, y - u * 8.9, u * 1.05, skin);
  };
  const muted = (ctx, x, y, s, col, xcol) => {
    rrect(ctx, x - s * 0.5, y - s * 0.18, s * 0.28, s * 0.36, s * 0.05, col);
    poly(ctx, [[x - s * 0.26, y - s * 0.18], [x + s * 0.06, y - s * 0.45], [x + s * 0.06, y + s * 0.45], [x - s * 0.26, y + s * 0.18]], col);
    G.seg(ctx, [x + s * 0.2, y - s * 0.2], [x + s * 0.55, y + s * 0.2], s * 0.1, xcol); G.seg(ctx, [x + s * 0.55, y - s * 0.2], [x + s * 0.2, y + s * 0.2], s * 0.1, xcol);
  };
  // the beat: thumps at 72 bpm from t0
  const beatAt = (lt, t0 = 0) => { if (lt < t0) return 0; const ph = ((lt - t0) * 1.2) % 1; return Math.max(Math.exp(-ph * 18), 0.6 * Math.exp(-Math.max(0, ph - 0.22) * 18) * (ph > 0.22 ? 1 : 0)); };
  const thumps = (t0, t1, base = 0) => { const ev = []; for (let t = t0; t < t1; t += 1 / 1.2) { ev.push([base + t, 'thump']); ev.push([base + t + 0.22, 'thump', { gain: 0.6 }]); } return ev; };

  // ——— 1 · hook: no symptoms… but it can damage your heart and brain ———
  const s1 = S('s01');
  card(0, 's01', (ctx, lt) => {
    const k = E.oExp(inv(0, 0.4, lt));
    ctx.save(); ctx.globalAlpha = k; walker(ctx, CX - 10 + Math.sin(lt * 0.9) * 20, 1080, 560, lt, G.SKIN_D, PAL.blue.t[1], beatAt(lt, 0.2)); ctx.restore();
  }, 'WAAYO?', [[0.05, 'pop'], ...thumps(0.2, 1.9)]);
  card(wt('s01', 'laakiin') - 0.1, 's01', (ctx, lt) => {
    const k1 = E.oBack(inv(0, 0.3, lt)), k2 = E.oBack(inv(0.5, 0.8, lt));
    const tm = sinceW('s01', 'maskaxdaada') - (sinceW('s01', 'laakiin') - 0.1);
    if (k1 > 0) { disc(ctx, CX - 200, 760, 170 * k1, PAL.coral.t[4]); heart(ctx, CX - 200, 750, 210 * k1, RED, beatAt(lt)); crack(ctx, CX - 200, 750, 160, INK, inv(0.8, 1.4, lt)); }
    if (k2 > 0) { disc(ctx, CX + 200, 760, 170 * k2, PAL.coral.t[4]); brain(ctx, CX + 200, 770, 230 * k2, '#f2a3b4', '#c86a80'); crack(ctx, CX + 200, 760, 160, INK, inv(tm, tm + 0.6, lt)); }
  }, 'WAAYO?', [[0, 'pop'], [0.5, 'pop'], [0.9, 'click'], ...thumps(0, 2.6)]);
  card(wt('s01', 'waayo') - 0.1, 's01', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.35, lt), 2);
    disc(ctx, CX, 760, 260 * k, PAL.coral.t[4]); heart(ctx, CX - 40, 760, 260 * k, RED, beatAt(lt));
    const m = E.oBack(inv(0.35, 0.65, lt)); if (m > 0) { disc(ctx, CX + 180, 920, 95 * m, INK); muted(ctx, CX + 170, 920, 120 * m, CREAM, PAL.coral.t[2]); }
  }, 'DILAAGA AAMUSAN', [[0, 'pop'], [0.35, 'pop'], ...thumps(0, 2.4)]);

  // ——— 2 · what it is: blood pushes too hard; 140/90 or more ———
  const s2 = S('s02');
  card(s2.t, 's02', (ctx, lt) => {
    const tx = sinceW('s02', 'xoog'), hard = E.io(inv(tx - 0.2, tx + 0.5, lt));
    const bulge = hard * (0.5 + 0.5 * Math.sin(lt * 9)) * 34, y = 760, r = 110 + bulge;
    rrect(ctx, 80, y - r - 26, 920, (r + 26) * 2, r + 26, '#e88b8b');
    rrect(ctx, 80, y - r, 920, r * 2, r, '#fbe3e3');
    const sp = lerp(120, 520, hard);
    for (let i = 0; i < 9; i++) { const x = 60 + ((lt * sp + i * 115) % 960); disc(ctx, x, y + Math.sin(i * 2) * r * 0.45, 30, RED); }
    if (hard > 0.3) for (const s of [-1, 1]) G.arrowDown(ctx, CX + s * 220, y + s * (r + 80), 30, INK);   // pressure on the walls
    pill(ctx, 'XIDID', 240, y - r - 90, INK, CREAM, E.oBack(inv(sinceW('s02', 'xididdada') - 0.2, sinceW('s02', 'xididdada') + 0.1, lt)), 30);
  }, (lt) => (lt < sinceW('s02', 'xoog') ? 'DHIIG-KAR' : 'XOOG BADAN'), [[0.05, 'pop'], [sinceW('s02', 'xoog'), 'whoosh', { dur: 0.8 }], ...thumps(sinceW('s02', 'xoog'), sinceW('s02', 'haddii') - 0.2)]);
  card(wt('s02', 'haddii') - 0.1, 's02', (ctx, lt) => {
    const tn = sinceW('s02', '140/90') - (sinceW('s02', 'haddii') - 0.1), p = E.io3(inv(tn - 0.3, tn + 0.6, lt));
    const cx = CX, cy = 860, R2 = 300;
    // the dial: green → yellow → red
    [[Math.PI, Math.PI * 1.45, GRN], [Math.PI * 1.45, Math.PI * 1.7, PAL.sun.t[2]], [Math.PI * 1.7, Math.PI * 2, RED]].forEach(([a, b, c]) => {
      ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 60; ctx.beginPath(); ctx.arc(cx, cy, R2, a, b); ctx.stroke(); ctx.restore(); });
    const ang = Math.PI * lerp(1.1, 1.82, p); G.seg(ctx, [cx, cy], [cx + Math.cos(ang) * R2 * 0.85, cy + Math.sin(ang) * R2 * 0.85], 22, INK); disc(ctx, cx, cy, 34, INK);
    const red = p > 0.9;
    bigNum(ctx, 140, cx - 2, cy - 140, 120, p > 0 ? inv(tn - 0.3, tn + 0.5, lt) : 0, red ? RED : INK, (v) => `${Math.round(v)}/${Math.round(v * 90 / 140)}`);
  }, '140/90', [[0, 'pop'], [sinceW('s02', '140/90') - (sinceW('s02', 'haddii') - 0.1) - 0.3, 'tick', { dur: 0.9 }], [sinceW('s02', '140/90') - (sinceW('s02', 'haddii') - 0.1) + 0.6, 'click']]);

  // ——— 3 · why silent: you feel nothing; 44% don't know ———
  const s3 = S('s03');
  card(s3.t, 's03', (ctx, lt) => {
    G.figure(ctx, CX - 120, 1080, 520, { skin: G.SKIN_D, cloth: PAL.teal.t[1] });
    const b = beatAt(lt); disc(ctx, CX - 110, 700, 40 + 30 * b, rgba(RED, 0.3)); heart(ctx, CX - 110, 700, 60, RED, b);
    const k = E.oBack(inv(0.4, 0.7, lt)); if (k > 0) { disc(ctx, CX + 200, 620, 90 * k, GRN); G.tick(ctx, CX + 200, 620, 100 * k, CREAM, E.oExp(inv(0.5, 0.8, lt))); }
  }, 'CALAAMAD MA LEH', [[0, 'pop'], [0.45, 'click'], ...thumps(0, 2.5)]);
  card(wt('s03', 'adduunka') - 0.1, 's03', (ctx, lt) => {
    const t4 = sinceW('s03', '44%') - (sinceW('s03', 'adduunka') - 0.1), g = E.io3(inv(t4 + 0.2, t4 + 1.4, lt)) * 4.4;
    for (let i = 0; i < 10; i++) {
      const x = 170 + (i % 5) * 185, y = i < 5 ? 830 : 1090, k = E.oBack(inv(i * 0.04, 0.3 + i * 0.04, lt)); if (k <= 0) continue;
      const grey = clamp(g - i);
      G.figure(ctx, x, y, 210 * k, { skin: G.SKIN_D, cloth: PAL.blue.t[1] });
      if (grey > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x - 60, y - 230, 120, 230 * grey); ctx.clip(); G.figure(ctx, x, y, 210 * k, { skin: GREY, cloth: '#8e97a5' }); ctx.restore();
        if (grey >= 1) { ctx.save(); ctx.fillStyle = INK; ctx.font = '900 54px Montserrat'; ctx.textAlign = 'center'; ctx.fillText('?', x + 52, y - 190); ctx.restore(); } }
    }
    bigNum(ctx, 44, CX, 560, 200, inv(t4 - 0.1, t4 + 1.0, lt), RED, (v) => Math.round(v) + '%');
    source(ctx, 'WHO 2025', 1150, E.o3(inv(t4 + 0.4, t4 + 0.8, lt)));
  }, 'MA OGA', [[0, 'swipe'], [sinceW('s03', '44%') - (sinceW('s03', 'adduunka') - 0.1) - 0.1, 'tick', { dur: 1.0 }], [sinceW('s03', '44%') - (sinceW('s03', 'adduunka') - 0.1) + 0.9, 'pop']]);

  // ——— 4 · the Somali community in Minnesota: ~3 in 10 men, ~2 in 10 women; risk grows with years abroad ———
  const s4 = S('s04');
  card(s4.t, 's04', (ctx, lt) => {
    const t3 = sinceW('s04', '3'), t2 = sinceW('s04', '2');
    pill(ctx, 'SOOMAALIDA MINNESOTA', CX, 405, INK, CREAM, E.oBack(inv(0.1, 0.4, lt)), 28);
    [[730, t3, 3, false, PAL.teal.t[1], 505], [1060, t2, 2, true, PAL.green.t[1], 820]].forEach(([y, tt, n, cov, cl, ny], row) => {
      for (let i = 0; i < 10; i++) {
        const x = 108 + i * 96, k = E.oBack(inv(0.2 + row * 0.6 + i * 0.03, 0.5 + row * 0.6 + i * 0.03, lt)); if (k <= 0) continue;
        const red = i < n && lt > tt + i * 0.15;
        G.figure(ctx, x, y, 160 * k, { skin: G.SKIN_D, cloth: red ? RED : cl, covered: cov });
      }
      const p = inv(tt - 0.1, tt + 0.6, lt);
      bigNum(ctx, n, CX, ny, 96, p, RED, (v) => `${Math.round(v)} / 10`);
    });
    source(ctx, 'Minnesota Somali study, 2015–16', 1150, E.o3(inv(0.6, 1.0, lt)));
  }, (lt) => (lt < sinceW('s04', '10-kii', 1) - 0.2 ? '10-KII NIN' : '10-KII NAAGOOD'), [[0.1, 'pop'], [sinceW('s04', '3'), 'pop'], [sinceW('s04', '2'), 'pop']]);
  card(wt('s04', 'khatartuna') - 0.1, 's04', (ctx, lt) => {
    // a calendar flipping years, and a line that rises
    const yr = Math.min(12, Math.floor(lt * 4));
    rrect(ctx, 160, 540, 300, 320, 30, CREAM); rrect(ctx, 160, 540, 300, 90, 30, RED); ctx.fillStyle = RED; ctx.fillRect(160, 590, 300, 40);
    for (const x of [230, 390]) rrect(ctx, x - 10, 515, 20, 60, 10, INK);
    ctx.save(); ctx.fillStyle = INK; ctx.font = '900 130px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+' + yr, 310, 755); ctx.restore();
    const flip = (lt * 4) % 1; if (yr < 12) { ctx.save(); ctx.globalAlpha = 1 - flip; rrect(ctx, 160, 630 - flip * 60, 300, 40, 8, mix(CREAM, INK, 0.1)); ctx.restore(); }
    const p = E.io3(inv(0.3, 2.4, lt)), pts = [[560, 1040], [660, 990], [760, 930], [860, 840], [940, 740]];
    ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    const n = (pts.length - 1) * p; for (let i = 0; i <= Math.floor(n); i++) (i ? ctx.lineTo(...pts[i]) : ctx.moveTo(...pts[i]));
    const i0 = Math.floor(n), f = n - i0; if (i0 < pts.length - 1) ctx.lineTo(lerp(pts[i0][0], pts[i0 + 1][0], f), lerp(pts[i0][1], pts[i0 + 1][1], f)); ctx.stroke(); ctx.restore();
    if (p > 0.97) { ctx.save(); ctx.translate(945, 735); ctx.rotate(-2.3); G.arrowDown(ctx, 0, 0, 40, RED); ctx.restore(); }
    rrect(ctx, 540, 1060, 440, 10, 5, rgba(INK, 0.3)); rrect(ctx, 540, 640, 10, 430, 5, rgba(INK, 0.3));
    source(ctx, 'Minnesota Somali study, 2015–16', 1150);
  }, 'SANNAD KASTA', [[0, 'swipe'], [0.1, 'tick', { dur: 2.8 }], [2.4, 'pop']]);

  // ——— 5 · the UK: Black patients 10% less likely to have it controlled ———
  const s5 = S('s05');
  const ukp = ([lon, lat]) => [270 + (lon + 5) * 34, 830 - (lat - 54) * 34 * 1.65];
  const UKL = window.LAND.filter((r) => { const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2; return cx > -11 && cx < 2 && cy > 49 && cy < 61; });
  card(s5.t, 's05', (ctx, lt) => {
    const k = E.oExp(inv(0, 0.4, lt));
    ctx.save(); ctx.globalAlpha = k; G.geo(ctx, UKL, ukp, PAL.blue.t[1]); ctx.restore();
    const t10 = sinceW('s05', '10%'), p = E.io3(inv(t10 - 0.4, t10 + 0.8, lt));
    [['DADKA KALE', 1, PAL.blue.t[0], 560], ['DADKA MADOW', 0.9, RED, 720]].forEach(([lab, f, c, y], i) => {
      const L = 420 * f * E.o3(inv(0.4 + i * 0.25, 1.4 + i * 0.25, lt)) * (i ? lerp(1 / 0.9, 1, p) : 1);
      rrect(ctx, 520, y, 440, 70, 35, rgba(INK, 0.12)); if (L > 10) rrect(ctx, 520, y, Math.min(440, L), 70, 35, c);
      ctx.save(); ctx.font = '800 28px Montserrat'; ctx.letterSpacing = '2px'; ctx.fillStyle = INK; ctx.fillText(lab, 524, y - 16); ctx.restore();
    });
    pill(ctx, 'XAKAMEYSAN', 740, 460, INK, CREAM, E.oBack(inv(sinceW('s05', 'xakameysan') - 0.2, sinceW('s05', 'xakameysan') + 0.1, lt)), 28);
    bigNum(ctx, 10, 740, 930, 150, inv(t10 - 0.1, t10 + 0.8, lt), RED, (v) => '−' + Math.round(v) + '%');
    source(ctx, 'QMUL 2023 · London', 1150, E.o3(inv(t10 + 0.3, t10 + 0.7, lt)));
  }, 'UK', [[0, 'whoosh', { dur: 0.7 }], [sinceW('s05', '10%') - 0.1, 'tick', { dur: 0.9 }], [sinceW('s05', '10%') + 0.8, 'pop']]);

  // ——— 6 · what it damages: stroke, heart disease, kidneys ———
  const s6 = S('s06');
  card(s6.t, 's06', (ctx, lt) => {
    const T = [sinceW('s06', 'istaroog'), sinceW('s06', 'wadne-xanuun'), sinceW('s06', 'kelyo')];
    const ys = 780, w0 = E.oBack(inv(0.05, 0.4, lt)) * (1 - E.o3(inv(T[0] - 0.4, T[0] - 0.1, lt)));
    if (w0 > 0) { ctx.save(); ctx.translate(CX, ys + 40); ctx.scale(w0, w0); ctx.lineJoin = 'round'; ctx.fillStyle = RED; ctx.strokeStyle = RED; ctx.lineWidth = 60; ctx.beginPath(); ctx.moveTo(0, -230); ctx.lineTo(220, 150); ctx.lineTo(-220, 150); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = CREAM; ctx.font = '900 260px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 20); ctx.restore(); }
    [[200, 'ISTAROOG'], [540, 'WADNE'], [880, 'KELYO']].forEach(([x, lab], i) => {
      const k = E.oBack(inv(T[i] - 0.15, T[i] + 0.2, lt)); if (k <= 0) return;
      disc(ctx, x, ys, 150 * k, PAL.coral.t[4]);
      if (i === 0) brain(ctx, x, ys + 10, 200 * k, '#f2a3b4', '#c86a80');
      if (i === 1) heart(ctx, x, ys, 190 * k, RED);
      if (i === 2) kidneys(ctx, x, ys, 210 * k, '#b5523f');
      crack(ctx, x + 5, ys, 150, INK, inv(T[i] + 0.15, T[i] + 0.55, lt));
      ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = INK; ctx.font = '800 34px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(lab, x, ys - 185); ctx.restore();
    });
  }, (lt) => (lt < sinceW('s06', 'istaroog') - 0.15 ? 'DAAWEYN LA\'AAN' : 'DHAAWAC'), [[0.05, 'pop'], [sinceW('s06', 'istaroog') - 0.15, 'pop'], [sinceW('s06', 'wadne-xanuun') - 0.15, 'pop'], [sinceW('s06', 'kelyo') - 0.15, 'pop'], [sinceW('s06', 'istaroog') + 0.2, 'tear', { dur: 0.4, gain: 0.5 }], [sinceW('s06', 'wadne-xanuun') + 0.2, 'tear', { dur: 0.4, gain: 0.5 }], [sinceW('s06', 'kelyo') + 0.2, 'tear', { dur: 0.4, gain: 0.5 }]]);

  // ——— 7 · what to do: get checked; less salt, walk, take medicine if prescribed ———
  const s7 = S('s07');
  card(s7.t, 's07', (ctx, lt) => {
    const tc = sinceW('s07', 'cabbir'), tx = sinceW('s07', 'xitaa');
    // an arm with a cuff, a tube to a small gauge
    G.seg(ctx, [140, 820], [760, 760], 110, G.SKIN_D); disc(ctx, 790, 757, 62, G.SKIN_D);
    const sq = 1 + 0.05 * Math.sin(lt * 10) * (lt > tc && lt < tc + 1.2 ? 1 : 0);
    rrect(ctx, 300, 790 - 95 * sq, 240, 190 * sq, 30, PAL.blue.t[1]); rrect(ctx, 300, 760, 240, 40, 12, PAL.blue.t[0]);
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(420, 700); ctx.quadraticCurveTo(470, 560, 620, 560); ctx.stroke(); ctx.restore();
    disc(ctx, 690, 560, 80, CREAM); G.ring(ctx, 690, 560, 80, 10, INK);
    const a = -Math.PI * 0.9 + E.io(inv(tc, tc + 1.0, lt)) * Math.PI * 0.5; G.seg(ctx, [690, 560], [690 + Math.cos(a) * 55, 560 + Math.sin(a) * 55], 9, INK);
    const k = E.oBack(inv(tx, tx + 0.3, lt)); if (k > 0) { disc(ctx, 820, 960, 90 * k, GRN); G.tick(ctx, 820, 960, 100 * k, CREAM, E.oExp(inv(tx + 0.1, tx + 0.4, lt))); }
  }, 'ISKA CABBIR', [[0, 'pop'], [sinceW('s07', 'cabbir'), 'air', { dur: 1.0, gain: 0.8 }], [sinceW('s07', 'xitaa'), 'pop'], [sinceW('s07', 'xitaa') + 0.2, 'click']]);
  card(wt('s07', 'milix') - 0.1, 's07', (ctx, lt) => {
    const b0 = sinceW('s07', 'milix') - 0.1, T = [sinceW('s07', 'milix') - b0, sinceW('s07', 'socod') - b0, sinceW('s07', 'qaado') - b0];
    const ys = 790;
    [[200, 'MILIX YAR'], [540, 'SOCOD'], [880, 'DAAWO']].forEach(([x, lab], i) => {
      const k = E.oBack(inv(T[i] - 0.1, T[i] + 0.25, lt)); if (k <= 0) return;
      disc(ctx, x, ys, 150 * k, PAL.green.t[4]);
      if (i === 0) { ctx.save(); ctx.translate(x, ys); ctx.scale(k, k); rrect(ctx, -55, -40, 110, 140, 26, CREAM); rrect(ctx, -55, -90, 110, 60, 26, '#9aa3ae');
        for (const d of [-25, 0, 25]) disc(ctx, d, -62, 7, INK); ctx.restore();
        const x2 = E.o3(inv(T[0] + 0.3, T[0] + 0.6, lt)); if (x2 > 0) { G.seg(ctx, [x - 90, ys - 90], [lerp(x - 90, x + 90, x2), lerp(ys - 90, ys + 90, x2)], 18, RED); G.seg(ctx, [x + 90, ys - 90], [lerp(x + 90, x - 90, x2), lerp(ys - 90, ys + 90, x2)], 18, RED); } }
      if (i === 1) walker(ctx, x, ys + 150, 330 * k, lt, G.SKIN_D, PAL.green.t[0]);
      if (i === 2) { ctx.save(); ctx.translate(x, ys + 100); ctx.scale(k, k); G.bottle(ctx, 0, 0, 220, CREAM, PAL.green.t[1], PAL.green.t[4], INK); ctx.restore();
        ctx.save(); ctx.fillStyle = PAL.coral.t[2]; ctx.translate(x, ys + 3); ctx.scale(k, k); rrect(ctx, -10, -30, 20, 60, 4, RED); rrect(ctx, -30, -10, 60, 20, 4, RED); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = INK; ctx.font = '800 32px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(lab, x, ys - 185); ctx.restore();
    });
  }, 'MILIX · SOCOD · DAAWO',
  [[0, 'pop'], [sinceW('s07', 'milix') - sinceW('s07', 'milix') + 0.4, 'click'], [sinceW('s07', 'socod') - sinceW('s07', 'milix') + 0.1, 'pop'], [sinceW('s07', 'qaado') - sinceW('s07', 'milix') + 0.1, 'pop']]);

  // ——— 8 · not medical advice; when did you last get checked? (+ like & subscribe on screen) ———
  const s8 = S('s08');
  card(s8.t, 's08', (ctx, lt) => {
    const k = E.oBack(inv(0.05, 0.4, lt));
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k);
    rrect(ctx, -380, -150, 760, 300, 40, CREAM);
    disc(ctx, -260, 0, 62, PAL.sun.t[2]);
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 80px Montserrat'; ctx.fillText('i', -260, 4);
    ctx.textAlign = 'left'; ctx.font = '800 40px Montserrat'; ctx.fillText('Talo caafimaad', -170, -30); ctx.fillText('maaha.', -170, 22);
    ctx.font = '800 30px Montserrat'; ctx.fillStyle = rgba(INK, 0.75); ctx.fillText('La tasho dhakhtarkaaga.', -170, 84);
    ctx.restore();
  }, '', [[0.05, 'pop']]);
  card(wt('s08', 'adiga') - 0.1, 's08', (ctx, lt) => {
    const k = E.oBack(inv(0, 0.4, lt), 1.8), b = E.oBack(inv(0.3, 0.6, lt));
    if (b > 0) { ctx.save(); ctx.translate(CX, 600); ctx.scale(b, b); G.bubble(ctx, 0, 0, 700, 260, CREAM);
      for (let i = 0; i < 3; i++) disc(ctx, -100 + i * 100, 0, 28 * (0.75 + 0.25 * Math.sin(lt * 6 - i)), PAL.sun.t[1]); ctx.restore(); }
    ctx.save(); ctx.translate(CX, 930); ctx.scale(k, k); ctx.fillStyle = INK; ctx.font = '900 170px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('WAAYO?', 0, 0); ctx.restore();
    // like & subscribe, on screen only
    const s = E.oBack(inv(1.2, 1.6, lt), 1.6);
    if (s > 0) {
      ctx.save(); ctx.translate(CX, 1150); ctx.scale(s, s);
      disc(ctx, -300, 0, 62, PAL.sun.t[2]); ctx.save(); ctx.translate(-300, 10); ctx.scale(0.5, 0.5); G.thumb(ctx, 0, 0, 170, CREAM, INK, PAL.sun.t[1]); ctx.restore();
      const done = lt > 2.3; rrect(ctx, -210, -52, 470, 104, 52, done ? INK : PAL.coral.t[2]);
      G.bell(ctx, -150, -2, 44, CREAM); ctx.fillStyle = CREAM; ctx.font = '900 40px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SUBSCRIBE', -100, 3);
      if (done) { const q = E.oBack(inv(2.3, 2.6, lt)); disc(ctx, 262, -50, 34 * q, GRN); G.tick(ctx, 262, -50, 40 * q, CREAM, E.oExp(inv(2.4, 2.7, lt))); }
      ctx.restore();
    }
  }, '', [[0, 'pop'], [0.3, 'pop'], [1.2, 'pop'], [2.3, 'click'], [2.45, 'sparkle', { dur: 0.6 }]]);

// Waayo? · Dhiig-kar: the film on one timeline. Scene times come from timeline.js (voice lengths), card changes from the
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
  const HUE = { s01: 'coral', s02: 'teal', s03: 'blue', s04: 'sun', s05: 'blue', s06: 'coral', s07: 'green', s08: 'coral' };
  const sceneAt = (t) => { let s = SC[0]; for (const x of SC) if (t >= x.t) s = x; return s; };
  const SUN = PAL.sun.t[2], SUNL = PAL.sun.t[3];
  const CX = 540, CY = 740, R = 360;          // the stage disc
  const TY = 1252;                            // title baseline

  // ───────── cards: [start time, scene, draw(ctx, lt, P, t), title, title start] ─────────
  const C = [];
  const card = (t0, sc, draw, title, ev = []) => C.push({ t0, sc, draw, title, ev });

  // ═════════ the blood-pressure story's cards (spliced into film.js by tools/splice.py) ═════════
  const split2 = (tw, t0, sc, D, T, ev = []) => { card(t0, sc, D, T, ev); const off = tw - 0.1 - t0;
    card(t0 + off, sc, (ctx, lt, P, t) => D(ctx, lt + off, P, t), typeof T === 'function' ? (lt) => T(lt + off) : T, []); };
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
  const opening = (ctx, lt) => {
    const k = 1;
    ctx.save(); ctx.globalAlpha = k; walker(ctx, CX - 10 + Math.sin(lt * 0.9) * 20, 1080, 560, lt, G.SKIN_D, PAL.blue.t[1], beatAt(lt, 0.2)); ctx.restore();
  };
  card(0, 's01', (ctx, lt) => opening(ctx, lt), 'WAAYO?', [[0.05, 'pop'], ...thumps(0.2, 1.9)]);
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
  }, (lt) => (lt < sinceW('s04', '10-kii', 1) - 0.2 ? '10-KII NIN' : '10-KII HAWEENKA'), [[0.1, 'pop'], [sinceW('s04', '3'), 'pop'], [sinceW('s04', '2'), 'pop']]);
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
  split2(wt('s05', '10%'), s5.t, 's05', (ctx, lt) => {
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
  // ——— the loop: back to the opening shot, which resets to frame 0 in the last half second ———
  card(S('s08').v + S('s08').vd + 0.9, 's08', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : lt), 'WAAYO?', [...thumps(0.2, 1.2)]);
  C[C.length - 1].loop = true;
  // the bouncing arrow lives outside the card (it points down at the comments, under the captions)

  C.sort((a, b) => a.t0 - b.t0);
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
  const KICK = 'DHIIG-KARKA · DILAAGA AAMUSAN';
  function hud(ctx, t, sc, P) {
    const n = SC.indexOf(sc) + 1, y = 318;
    ctx.save(); ctx.font = '500 26px "DM Mono"'; ctx.letterSpacing = '4px'; ctx.fillStyle = rgba(INK, 0.75); ctx.textBaseline = 'alphabetic';
    ctx.fillText('WAAYO? · DHIIG-KAR', 70, y);
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

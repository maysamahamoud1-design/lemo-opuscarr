// Waayo? · Fiitamiin D (Dari, voice: Farid): the film (it loops: the last frame is the first) on one timeline. Scene times come from timeline.js (voice lengths), card changes from the
// spoken words (voices/words.js). render(t) draws film second t; EV lists the sound events; TEXTS(t) reports visible text.
(function () {
  const { W, H, PAL, E, clamp, lerp, inv, disc, seg, rrect, poly, ring, mix, rgba } = G;
  const SC = window.SC, WD = window.WORDS, DUR = window.DUR, INK = G.INK, CREAM = G.CREAM;
  const S = (id) => SC.find((s) => s.id === id);
  // absolute time of the n-th word (in scene id) that starts with `p`
  const KEY = {"s01": {"haddaba": "پس", "qurbaha": "خارج", "yaraanta": "کمبود"}, "s02": {"sameeyaa": "می‌سازد.", "fiitamiin#1": "ویتامین#1", "xoojiyaa": "قوی", "murqaha": "عضلات"}, "s03": {"qorrax": "آفتاب", "isla": "همان"}, "s04": {"uk": "بریتانیا", "norway": "ناروی", "canada": "کانادا", "soomaali": "سومالیایی", "qorraxdu": "آفتاب", "xilliga": "فصل"}, "s05": {"gudaha": "خانه", "yareeyaan": "کمتر"}, "s06": {"daal": "خستگی", "lafaha": "درد", "carruurtana": "نرمی"}, "s07": {"baaritaanka": "آزمایش", "kiniinnada": "قرص", "gaar": "به‌ویژه", "xilliga": "فصل"}, "s08": {"maxaad": "می‌خواهید"}, "s09": {"like": "لایک", "subscribe": "سبسکرایب"}};
  const wt = (id, p, n = 0) => {
    { const k = (KEY[id] || {})[p + (n ? '#' + n : '')]; if (k) { const [w, m] = k.split('#'); p = w; n = +(m || 0); } }
    let k = 0;
    for (const x of WD[id]) if (x.w.toLowerCase().startsWith(p.toLowerCase()) && k++ === n) return S(id).v + x.t0;
    throw new Error(`word ${p}#${n} not in ${id}`);
  };
  const HUE = { s01: 'sun', s02: 'teal', s03: 'teal', s04: 'blue', s05: 'blue', s06: 'coral', s07: 'green', s08: 'sun', s09: 'sun' };
  const sceneAt = (t) => { let s = SC[0]; for (const x of SC) if (t >= x.t) s = x; return s; };
  const SUN = PAL.sun.t[2], SUNL = PAL.sun.t[3];
  const CX = 540, CY = 740, R = 360;          // the stage disc
  const TY = 1252;                            // title baseline

  // ───────── cards: [start time, scene, draw(ctx, lt, P, t), title, title start] ─────────
  const C = [];
  const card = (t0, sc, draw, title, ev = []) => C.push({ t0, sc, draw, title, ev });

  // ═════════ the vitamin D story's cards (spliced into film.js by tools/splice.py) ═════════
  const split2 = (tw, t0, sc, D, T, ev = []) => { card(t0, sc, D, T, ev); const off = tw - 0.1 - t0;
    card(t0 + off, sc, (ctx, lt, P, t) => D(ctx, lt + off, P, t), typeof T === 'function' ? (lt) => T(lt + off) : T, []); };
  // ——— 1 · hook: plenty of sun over Somalia… so why? ———
  const somProj = (cx, cy, s) => ([lon, lat]) => [cx + (lon - 46) * s, cy - (lat - 6) * s];
  const opening = (ctx, lt, P) => {
    const rise = E.oBack(inv(0, 0.7, lt), 1.2), pulse = E.oExp(inv(wt('s01', 'haddaba') - S('s01').v, wt('s01', 'haddaba') - S('s01').v + 0.5, lt));
    G.sun(ctx, 760, lerp(700, 500, rise), 105 + 22 * pulse, SUN, lt * 0.35, 1 + 0.5 * pulse);
    G.geo(ctx, window.SOM, somProj(470, 840, 27), PAL.sun.t[0]);
    for (let i = 0; i < 5; i++) {   // rays reaching the land
      const a = [690 + (i - 2) * 40, lerp(700, 500, rise) + 150], b = [520 + (i - 2) * 70, 820 + (i - 2) * 20];
      G.ray(ctx, a, b, E.oExp(inv(0.4 + i * 0.06, 1.0 + i * 0.06, lt)) * (0.8 + 0.2 * pulse), 16, rgba(SUN, 0.9));
    }
  };
  card(0, 's01', opening, 'چرا؟', [[0.25, 'pop'], [1.8, 'sparkle']]);
  card(wt('s01', 'qurbaha') - 0.15, 's01', (ctx, lt, P) => {
    // Somalia small at the bottom left, a plane arcs to three figures under a pale, small sun
    G.geo(ctx, window.SOM, somProj(300, 1030, 15), PAL.sun.t[0]);
    G.sun(ctx, 330, 900, 48, SUN, lt * 0.4);
    const p = E.io3(inv(0, 1.2, lt));
    const A = [360, 980], B = [760, 520], Cc = [380, 470];
    const q = (u) => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * Cc[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * Cc[1] + u * u * B[1]];
    ctx.save(); ctx.setLineDash([2, 26]); ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = rgba(INK, 0.35); ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const r = q(i / 40 * p); i ? ctx.lineTo(r[0], r[1]) : ctx.moveTo(r[0], r[1]); } ctx.stroke(); ctx.restore();
    const h = q(p), h2 = q(Math.min(1, p + 0.02));
    if (p < 0.98) G.plane(ctx, h[0], h[1], 56, Math.atan2(h2[1] - h[1], h2[0] - h[0]), INK);
    const f = E.oBack(inv(0.7, 1.15, lt));
    if (f > 0) {
      G.sun(ctx, 780, 470, 40 * f, mix(SUN, '#c9ccd2', 0.6), 0, 0.6);
      G.cloud(ctx, 860, 520, 90 * f, '#e8ecf2');
      [[640, '#3a5f9a', 0], [770, PAL.coral.t[1], 1], [900, PAL.teal.t[1], 2]].forEach(([x, cl, i]) => {
        const k = E.oBack(inv(0.8 + i * 0.1, 1.2 + i * 0.1, lt)); if (k > 0) G.figure(ctx, x, 960, 260 * k, { skin: G.SKIN_D, cloth: cl, covered: i === 1 });
      });
    }
  }, 'چرا؟', [[0, 'whoosh', { dur: 1.2 }], [0.85, 'pop']]);
  card(wt('s01', 'yaraanta') - 0.1, 's01', (ctx, lt, P) => {
    const k = E.oBack(inv(0, 0.35, lt), 2.2);
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k);
    disc(ctx, 0, 0, 290, SUN);
    ctx.fillStyle = INK; ctx.font = '900 400px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 8, 18);
    ctx.restore();
    const d = E.oBack(inv(0.35, 0.65, lt)); if (d > 0) G.dDisc(ctx, CX + 250, CY + 220, 95 * d, INK, SUN);
  }, 'چرا؟', [[0, 'pop'], [0.4, 'pop']]);

  // ——— 2 · sunlight on the skin makes vitamin D; D strengthens bones and muscles ———
  const skin = (ctx, y0, lt) => {
    // a cross-section of skin: outer layer (skin colour), inner layer, fat
    rrect(ctx, 150, y0, 780, 110, 30, G.SKIN_M);
    rrect(ctx, 150, y0 + 96, 780, 120, 22, '#f2b8a0');
    rrect(ctx, 150, y0 + 200, 780, 110, 22, '#f7dfa0');
  };
  const s2 = S('s02');
  card(s2.t, 's02', (ctx, lt, P) => {
    G.sun(ctx, CX, 470, 92, SUN, lt * 0.4);
    skin(ctx, 820, lt);
    for (let i = 0; i < 6; i++) G.ray(ctx, [300 + i * 96, 600], [270 + i * 108, 850], E.oExp(inv(0.5 + i * 0.07, 1.0 + i * 0.07, lt)), 18, SUN);
  }, 'پوست', [[0.5, 'swipe'], [0.15, 'pop']]);
  card(wt('s02', 'sameeyaa') - 0.1, 's02', (ctx, lt, P) => {
    G.sun(ctx, 300, 470, 70, SUN, lt * 0.4);
    skin(ctx, 820, lt);
    for (let i = 0; i < 6; i++) G.ray(ctx, [180 + i * 60, 560], [190 + i * 100, 850], 1, 14, rgba(SUN, 0.75));
    // D discs pop in the outer layer, then fly into the meter
    const fill = E.io3(inv(0.6, 1.3, lt));
    for (let i = 0; i < 6; i++) {
      const a = E.oBack(inv(0.05 + i * 0.07, 0.3 + i * 0.07, lt)), fly = E.io3(inv(0.55 + i * 0.06, 1.0 + i * 0.06, lt));
      if (a <= 0 || fly >= 1) continue;
      const x = lerp(190 + i * 100, 850, fly), y = lerp(875, 740 - fly * 40, fly) - Math.sin(fly * Math.PI) * 160;
      G.dDisc(ctx, x, y, 34 * a * (1 - fly * 0.4), SUN, INK);
    }
    G.meter(ctx, 850, 760, 110, 300, fill, CREAM, SUN, INK);
  }, 'ویتامین D', [[0.05, 'pop'], [0.25, 'pop'], [0.6, 'sparkle', { dur: 0.9 }]]);
  card(wt('s02', 'fiitamiin', 1) - 0.1, 's02', (ctx, lt, P) => {
    const t1 = wt('s02', 'xoojiyaa') - wt('s02', 'fiitamiin', 1), t2 = wt('s02', 'murqaha') - wt('s02', 'fiitamiin', 1);
    const grow = E.oBack(inv(t1, t1 + 0.6, lt)), mus = E.oBack(inv(t2 - 0.2, t2 + 0.3, lt));
    // the D flows down into the bone
    G.meter(ctx, 230, 700, 90, 230, 1 - 0.5 * E.io3(inv(t1 - 0.4, t1 + 0.4, lt)), CREAM, SUN, INK);
    for (let i = 0; i < 5; i++) {
      const u = (lt * 1.1 + i / 5) % 1; if (lt < t1 - 0.5 || lt > t1 + 1.6) continue;
      const x = lerp(230, 560, u), y = lerp(720, 880, u) - Math.sin(u * Math.PI) * 120; disc(ctx, x, y, 16, SUN);
    }
    if (mus > 0) { ctx.save(); ctx.translate(590, 880); ctx.rotate(-0.5); rrect(ctx, -230 * mus, -95 * mus, 460 * mus, 190 * mus, 95 * mus, PAL.coral.t[3]); ctx.restore(); }
    if (grow > 0) disc(ctx, 590, 880, 290 * grow, rgba(SUN, 0.28));
    G.bone(ctx, [420, 980], [760, 780], 50 + 24 * grow, CREAM);
    G.bone(ctx, [420, 980], [760, 780], 50 + 24 * grow, mix(CREAM, '#e9dcc0', 0.6));
  }, (lt) => (lt < wt('s02', 'xoojiyaa') - wt('s02', 'fiitamiin', 1) ? 'ویتامین D' : 'استخوان و عضله'), [[0.0, 'swipe'], [wt('s02', 'xoojiyaa') - wt('s02', 'fiitamiin', 1), 'sparkle', { dur: 0.8 }], [wt('s02', 'murqaha') - wt('s02', 'fiitamiin', 1) - 0.1, 'pop']]);

  // ——— 3 · darker skin needs more sun for the same amount ———
  const s3 = S('s03');
  split2(wt('s03', 'isla'), s3.t, 's03', (ctx, lt, P) => {
    const tq = wt('s03', 'qorrax') - s3.t, ti = wt('s03', 'isla') - s3.t;
    G.sun(ctx, CX, 450, 70, SUN, lt * 0.4);
    const pL = E.io(inv(0.4, tq + 0.3, lt)), pD = E.io(inv(0.4, ti + 0.4, lt));
    [[330, G.SKIN_L, PAL.blue.t[1], pL, 0.45], [750, G.SKIN_D, PAL.coral.t[1], pD, 1]].forEach(([x, sk, cl, p, L]) => {
      const k = E.oBack(inv(0.0, 0.4, lt));
      for (let i = -1; i <= 1; i++) G.ray(ctx, [CX + i * 40, 540], [x + i * 40, 700], E.oExp(inv(0.2, 0.6, lt)), 12, rgba(SUN, 0.7));
      if (k > 0) G.figure(ctx, x - 60, 1060, 320 * k, { skin: sk, cloth: cl });
      G.meter(ctx, x + 110, 1050, 70, 210, p, CREAM, SUN, INK);
      G.timer(ctx, x - 175, 1110, 26, 380 * L, Math.min(1, p) * (p >= 1 ? 1 : 1), CREAM, SUN, INK);
      if (p >= 1) G.tick(ctx, x + 110, 760, 60, PAL.green.t[1], E.oExp(inv(0, 0.3, lt - (x < 500 ? tq + 0.3 : ti + 0.4))));
    });
  }, (lt) => (lt < wt('s03', 'qorrax') - s3.t ? 'پوست تیره' : 'آفتاب بیشتر'),
  [[0.05, 'pop'], [0.2, 'pop'], [wt('s03', 'qorrax') - s3.t + 0.3, 'click'], [wt('s03', 'isla') - s3.t + 0.4, 'click']]);

  // ——— 4 · the UK, Norway and Canada: weak sun, above all in the cold season ———
  const s4 = S('s04');
  const wproj = ([lon, lat]) => [540 + (lon + 30) * 4.9, 900 - (lat - 35) * 4.9 * 1.15];
  const PLACES = [['بریتانیا', [-1.5, 52.5], 'uk'], ['ناروی', [10, 60.5], 'norway'], ['کانادا', [-79.4, 45], 'canada']];
  card(s4.t, 's04', (ctx, lt, P) => {
    ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R + 120, 0, Math.PI * 2); ctx.clip();
    G.geo(ctx, window.LAND, wproj, PAL.blue.t[3]); ctx.restore();
    G.geo(ctx, window.SOM, wproj, SUN);
    const so = wproj([46, 6]); G.sun(ctx, so[0] + 10, so[1] - 90, 30, SUN, lt * 0.5);
    PLACES.forEach(([name, ll, w], i) => {
      const t0 = wt('s04', w) - s4.t - 0.15, p = E.io3(inv(t0, t0 + 0.6, lt));
      if (p <= 0) return;
      const a = wproj([45, 5]), b = wproj(ll), m = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 170];
      ctx.save(); ctx.strokeStyle = PAL.blue.t[0]; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
      for (let j = 0; j <= 30; j++) { const u = j / 30 * p, x = (1 - u) ** 2 * a[0] + 2 * (1 - u) * u * m[0] + u * u * b[0], y = (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * m[1] + u * u * b[1]; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
      const k = E.oBack(inv(t0 + 0.45, t0 + 0.75, lt));
      if (k > 0) {
        disc(ctx, b[0], b[1], 17 * k, PAL.blue.t[0]); disc(ctx, b[0], b[1], 8 * k, CREAM);
        ctx.save(); ctx.font = '800 40px Montserrat'; const tw = ctx.measureText(name).width;
        const lx = clamp(i === 0 ? b[0] - tw - 60 : b[0] - tw / 2 - 18, 60, W - 60 - tw - 36), ly = i === 0 ? b[1] + 14 : b[1] - 92;
        ctx.globalAlpha = clamp(k); rrect(ctx, lx, ly, tw + 36, 60, 30, INK);
        ctx.fillStyle = CREAM; ctx.textBaseline = 'middle'; ctx.fillText(name, lx + 18, ly + 32); ctx.restore();
      }
    });
    // "where many Somalis live": small figures gather at each place
    const tg = wt('s04', 'soomaali') - s4.t;
    PLACES.forEach(([, ll], i) => { const b = wproj(ll), k = E.oBack(inv(tg + i * 0.12, tg + 0.35 + i * 0.12, lt)); if (k > 0) for (let j = 0; j < 3; j++) G.figure(ctx, b[0] - 28 + j * 28, b[1] + 80, 58 * k, { skin: G.SKIN_D, cloth: [PAL.coral.t[1], PAL.teal.t[1], PAL.sun.t[0]][j], covered: j === 1 }); });
  }, 'خارج از کشور', [[0, 'whoosh', { dur: 0.9 }], ...PLACES.map(([, , w]) => [wt('s04', w) - s4.t - 0.1, 'whoosh', { dur: 0.6, gain: 0.6 }]), ...PLACES.map(([, , w]) => [wt('s04', w) - s4.t + 0.35, 'click']), [wt('s04', 'soomaali') - s4.t, 'pop']]);
  card(wt('s04', 'qorraxdu') - 0.1, 's04', (ctx, lt, P) => {
    const shrink = E.io3(inv(0.2, 1.4, lt)), cl = E.o3(inv(0.6, 1.4, lt));
    G.sun(ctx, CX + 40, lerp(520, 600, shrink), lerp(120, 56, shrink), mix(SUN, '#c8ccd4', shrink * 0.75), lt * 0.2, lerp(1, 0.35, shrink));
    G.cloud(ctx, lerp(-200, 330, cl), 620, 150, '#ffffff');
    G.cloud(ctx, lerp(1300, 800, cl), 560, 120, '#eef2f7');
    G.city(ctx, 130, 1100, 820, PAL.blue.t[1], PAL.blue.t[3]);
  }, (lt) => 'آفتاب ضعیف', [[0, 'swipe'], [0.6, 'wind', { dur: 3.4, gain: 0.8 }]]);
  card(wt('s04', 'xilliga') - 0.1, 's04', (ctx, lt, P) => {
    G.sun(ctx, CX + 40, 600, 56, mix(SUN, '#c8ccd4', 0.75), lt * 0.2, 0.35);
    G.cloud(ctx, 330, 620, 150, '#ffffff'); G.cloud(ctx, 800, 560, 120, '#eef2f7');
    G.city(ctx, 130, 1100, 820, PAL.blue.t[1], PAL.blue.t[3]);
    for (let i = 0; i < 22; i++) {
      const r = G.hash(i + 3), y = ((lt * (90 + r * 60) + r * 700) % 640) + 600, x = 140 + G.hash(i + 40) * 800 + Math.sin(lt * 2 + i) * 18;
      G.snow(ctx, x, y, 14 + 10 * G.hash(i + 9), '#ffffff');
    }
    G.meter(ctx, 900, 1060, 70, 200, lerp(0.55, 0.32, E.io3(inv(0.4, 1.0, lt))), CREAM, SUN, INK);
  }, 'آفتاب ضعیف', [[0, 'swipe'], [0.5, 'click']]);

  // ——— 5 · covering clothes and staying indoors cut it further ———
  const s5 = S('s05');
  split2(wt('s05', 'gudaha'), s5.t, 's05', (ctx, lt, P) => {
    const tg = wt('s05', 'gudaha') - s5.t, ty = wt('s05', 'yareeyaan') - s5.t;
    const drop = E.oBack(inv(tg, tg + 0.45, lt), 1.1);
    G.sun(ctx, 300, 470, 60, mix(SUN, '#c8ccd4', 0.5), lt * 0.3, 0.6);
    // rays stop on the cloth (or, later, on the roof)
    for (let i = 0; i < 5; i++) {
      const stopY = drop > 0.6 ? 690 : 820 + Math.abs(i - 2) * 30;
      G.ray(ctx, [340 + i * 50, 540], [430 + i * 50, stopY], E.oExp(inv(0.2 + i * 0.05, 0.6 + i * 0.05, lt)), 13, rgba(SUN, 0.8));
    }
    G.figure(ctx, 520, 1100, 330, { skin: G.SKIN_D, cloth: PAL.blue.t[0], covered: true });
    if (drop > 0) G.house(ctx, 520, lerp(300, 1110, drop), 460, PAL.blue.t[1], PAL.blue.t[0], PAL.blue.t[3]);
    const lv = lerp(0.55, 0.35, E.io3(inv(0.6, 1.3, lt))) - 0.22 * E.io3(inv(tg + 0.2, ty + 0.4, lt));
    G.meter(ctx, 900, 1060, 70, 200, lv, CREAM, SUN, INK, PAL.coral.t[2]);
  }, (lt) => (lt < wt('s05', 'gudaha') - s5.t ? 'لباس' : 'خانه'), [[0.05, 'swipe'], [0.3, 'pop'], [wt('s05', 'gudaha') - s5.t + 0.35, 'pop'], [wt('s05', 'gudaha') - s5.t + 0.4, 'click']]);

  // ——— 6 · what low vitamin D does ———
  const s6 = S('s06');
  card(s6.t, 's06', (ctx, lt, P) => {
    const blink = 0.5 + 0.5 * Math.cos(lt * Math.PI * 3);
    G.meter(ctx, CX, 1040, 150, 420, 0.1, CREAM, SUN, INK, mix(PAL.coral.t[2], PAL.coral.t[4], blink));
    G.arrowDown(ctx, CX + 210, 760, 70 * E.oBack(inv(0.3, 0.6, lt)), PAL.coral.t[1]);
  }, 'کمبود D', [[0.1, 'pop']]);
  card(wt('s06', 'daal') - 0.15, 's06', (ctx, lt, P) => {
    const tb = wt('s06', 'lafaha') - wt('s06', 'daal'), tc = wt('s06', 'carruurtana') - wt('s06', 'daal');
    const k1 = E.oBack(inv(0, 0.3, lt)), k2 = E.oBack(inv(tb, tb + 0.3, lt)), k3 = E.oBack(inv(tc, tc + 0.3, lt));
    const ys = 800;
    if (k1 > 0) { disc(ctx, 200, ys, 150 * k1, PAL.coral.t[4]); G.battery(ctx, 200, ys, 170 * k1, INK, PAL.coral.t[1], 0.22); }
    if (k2 > 0) { disc(ctx, 540, ys, 150 * k2, PAL.coral.t[4]); G.bone(ctx, [480, ys + 60], [600, ys - 60], 30 * k2, CREAM); G.pain(ctx, 600, ys - 75, 58 * k2, PAL.coral.t[1], clamp((lt - tb) * 3)); }
    if (k3 > 0) {
      disc(ctx, 880, ys, 150 * k3, PAL.coral.t[4]);
      G.figure(ctx, 880, ys + 120, 220 * k3, { skin: G.SKIN_D, cloth: PAL.blue.t[1], child: true, bow: 0.35 * E.io(inv(tc + 0.3, tc + 0.9, lt)) });
      const kl = E.oBack(inv(tc + 0.5, tc + 0.8, lt));
      if (kl > 0) { ctx.save(); ctx.globalAlpha = clamp(kl); ctx.font = '800 32px Montserrat'; ctx.textAlign = 'center'; const tw = ctx.measureText('راشیتیسم').width;
        rrect(ctx, 880 - tw / 2 - 18, ys + 170, tw + 36, 52, 26, INK); ctx.fillStyle = CREAM; ctx.textBaseline = 'middle'; ctx.fillText('راشیتیسم', 880, ys + 197); ctx.restore(); }
    }
    // the word under each icon
    [['خستگی', 200, k1], ['درد', 540, k2], ['نرمی استخوان', 880, k3]].forEach(([s, x, k]) => {
      if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); ctx.fillStyle = INK; ctx.font = '800 34px Montserrat'; ctx.textAlign = 'center'; ctx.fillText(s, x, ys - 185); ctx.restore();
    });
  }, (lt) => 'نشانه‌ها', [[0, 'pop'], [wt('s06', 'lafaha') - wt('s06', 'daal'), 'pop'], [wt('s06', 'carruurtana') - wt('s06', 'daal'), 'pop'], [wt('s06', 'carruurtana') - wt('s06', 'daal') + 0.55, 'click']]);

  // ——— 7 · ask your doctor: a blood test and supplements ———
  const s7 = S('s07');
  card(s7.t, 's07', (ctx, lt, P) => {
    const tb = wt('s07', 'baaritaanka') - s7.t;
    const k = E.oBack(inv(0, 0.35, lt));
    ctx.save(); ctx.translate(CX, 1100); ctx.scale(k, k); G.tube(ctx, 0, 0, 560, CREAM, PAL.coral.t[1], PAL.green.t[1], E.io3(inv(tb, tb + 1.2, lt)) * 0.7); ctx.restore();
  }, (lt) => 'آزمایش خون', [[0, 'pop'], [wt('s07', 'baaritaanka') - s7.t + 0.2, 'click']]);
  card(wt('s07', 'kiniinnada') - 0.1, 's07', (ctx, lt, P) => {
    const k = E.oBack(inv(0, 0.35, lt));
    ctx.save(); ctx.translate(430, 1090); ctx.scale(k, k); G.bottle(ctx, 0, 0, 470, CREAM, PAL.green.t[1], PAL.green.t[4], INK); ctx.restore();
    for (let i = 0; i < 2; i++) { const c = E.oBack(inv(0.35 + i * 0.15, 0.65 + i * 0.15, lt)); if (c > 0) G.capsule(ctx, 690 + i * 40, 560 + i * 90, 110 * c, 0.6 + i * 0.5, SUN, CREAM); }
    G.meter(ctx, 880, 1060, 80, 300, lerp(0.12, 1, E.io3(inv(0.5, 1.4, lt))), CREAM, SUN, INK);
  }, 'قرص D', [[0, 'pop'], [0.35, 'pop'], [0.55, 'sparkle', { dur: 1.0 }]]);
  card(wt('s07', 'gaar') - 0.1, 's07', (ctx, lt, P) => {
    G.tube(ctx, 260, 1060, 360, CREAM, PAL.coral.t[1], PAL.green.t[1], 0.7);
    G.bottle(ctx, 600, 1060, 320, CREAM, PAL.green.t[1], PAL.green.t[4], INK);
    G.snow(ctx, 880, 560, 60, PAL.blue.t[2]);
    const k = E.oBack(inv(0.1, 0.35, lt), 2);
    if (k > 0) { disc(ctx, 840, 920, 120 * k, PAL.green.t[2]); G.tick(ctx, 840, 920, 130 * k, CREAM, E.oExp(inv(0.2, 0.5, lt))); }
  }, (lt) => (lt < wt('s07', 'xilliga') - wt('s07', 'gaar') ? 'قرص D' : 'فصل سرما'), [[0, 'swipe'], [0.15, 'pop'], [0.35, 'click']]);

  // ——— 8 · not medical advice; what should I explain next? ———
  const s8 = S('s08');
  card(s8.t, 's08', (ctx, lt, P) => {
    const k = E.oBack(inv(0.05, 0.4, lt));
    ctx.save(); ctx.translate(CX, CY); ctx.scale(k, k);
    rrect(ctx, -380, -150, 760, 300, 40, CREAM);
    disc(ctx, -260, 0, 62, PAL.sun.t[2]);
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 80px Montserrat'; ctx.fillText('i', -260, 4);
    ctx.textAlign = 'left'; ctx.font = '800 40px Montserrat'; ctx.fillText('مشورهٔ طبی', -170, -30); ctx.fillText('نیست.', -170, 22);
    ctx.font = '800 30px Montserrat'; ctx.fillStyle = rgba(INK, 0.75); ctx.fillText('با داکتر خود مشوره کنید.', -170, 84);
    ctx.restore();
  }, '', [[0.05, 'pop']]);
  card(wt('s08', 'maxaad') - 0.1, 's08', (ctx, lt, P) => {
    const k = E.oBack(inv(0, 0.4, lt), 1.8), b = E.oBack(inv(0.35, 0.7, lt));
    if (b > 0) { ctx.save(); ctx.translate(CX, 660); ctx.scale(b, b); G.bubble(ctx, 0, 0, 760, 300, CREAM);
      for (let i = 0; i < 3; i++) disc(ctx, -110 + i * 110, 0, 30 * (0.75 + 0.25 * Math.sin(lt * 6 - i)), PAL.sun.t[1]); ctx.restore(); }
    ctx.save(); ctx.translate(CX, 1060); ctx.scale(k, k); ctx.fillStyle = INK; ctx.font = '900 180px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('چرا؟', 0, 0); ctx.restore();
  }, '', [[0, 'pop'], [0.35, 'pop'], [1.2, 'click'], [2.2, 'click']]);
  // ——— 9 · like and subscribe ———
  const s9 = S('s09');
  card(s9.t, 's09', (ctx, lt, P) => {
    const tl = wt('s09', 'like') - s9.t, ts = wt('s09', 'subscribe') - s9.t;
    const k1 = E.oBack(inv(tl - 0.1, tl + 0.25, lt), 2.2), k2 = E.oBack(inv(ts - 0.15, ts + 0.2, lt), 1.6);
    if (k1 > 0) { disc(ctx, CX, 560, 150 * k1, PAL.sun.t[2]); ctx.save(); ctx.translate(CX, 590); ctx.scale(k1, k1); G.thumb(ctx, 0, 0, 170, CREAM, INK, PAL.sun.t[1]); ctx.restore(); }
    if (k2 > 0) {
      const press = 1 - 0.07 * Math.sin(Math.PI * clamp((lt - ts - 0.45) / 0.25)), done = lt > ts + 0.6;
      ctx.save(); ctx.translate(CX, 900); ctx.scale(k2 * press, k2 * press);
      rrect(ctx, -330, -70, 660, 140, 70, done ? INK : PAL.coral.t[2]);
      G.bell(ctx, -235, -4, 62, CREAM);
      ctx.fillStyle = CREAM; ctx.font = '900 54px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('سبسکرایب', -170, 4);
      ctx.restore();
      if (done) { const q = E.oBack(inv(ts + 0.6, ts + 0.9, lt)); disc(ctx, CX + 330, 830, 44 * q, PAL.green.t[2]); G.tick(ctx, CX + 330, 830, 52 * q, CREAM, E.oExp(inv(ts + 0.7, ts + 1.0, lt))); }
    }
  }, 'لایک و سبسکرایب', [[0, 'swipe'], [wt('s09', 'like') - S('s09').t, 'pop'], [wt('s09', 'subscribe') - S('s09').t, 'pop'], [wt('s09', 'subscribe') - S('s09').t + 0.5, 'click'], [wt('s09', 'subscribe') - S('s09').t + 0.65, 'sparkle', { dur: 0.7 }]]);
  // ——— the loop: back to the opening shot, which resets to frame 0 in the last half second ———
  card(S('s09').v + S('s09').vd + 0.9, 's09', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : lt, P), 'چرا؟', [[0.25, 'pop']]);
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
    ctx.save(); ctx.font = '900 140px Montserrat'; ctx.letterSpacing = '0px';
    const px = Math.min(140, Math.floor(140 * 960 / ctx.measureText(s).width)); ctx.restore();
    G.maskText(ctx, s, CX, TY, `900 ${px}px Montserrat`, INK, inv(since, since + 0.35, t), { align: 'center', ls: '0px' });
    if (c.sc === 's01' || c.loop) G.maskText(ctx, KICK, CX, TY - 138, '800 40px Montserrat', PAL.sun.t[0], 1, { align: 'center', ls: '0px' });
  }
  const KICK = 'سومالیایی‌های مهاجر · ویتامین D';
  function hud(ctx, t, sc, P) {
    const n = SC.indexOf(sc) + 1, y = 318;
    ctx.save(); ctx.font = '500 26px "DM Mono"'; ctx.letterSpacing = '0px'; ctx.fillStyle = rgba(INK, 0.75); ctx.textBaseline = 'alphabetic';
    ctx.fillText('چرا؟ · ویتامین D', 70, y);
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
      const nxt = words[i + 1], punct = /[,.…?،؟؛!]$/.test(x.w);
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
      let x = CX + lw / 2; const y = y0 + 28 + LH * (i + 0.78);
      for (const w of ln) {
        const ww = ctx.measureText(w.w).width, _x = (x -= ww), on = t >= w.t0 && t < w.t1 + 0.02, said = t >= w.t1;
        ctx.fillStyle = on ? SUNL : said ? CREAM : rgba(CREAM, 0.72);
        if (on) { const s = 1 + 0.06 * (1 - E.oExp(inv(w.t0, w.t0 + 0.18, t))); ctx.save(); ctx.translate(x + ww / 2, y - 20); ctx.scale(s, s); ctx.fillText(w.w, -ww / 2, 20); ctx.restore(); }
        else ctx.fillText(w.w, x, y);
        x -= sp;
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
    if (sc.id === 's08' && t > wt('s08', 'maxaad') + 0.6) {   // the arrow points down to the comments
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
    ctx.font = '800 36px Montserrat'; ctx.letterSpacing = '0px'; ctx.fillStyle = INK; ctx.textBaseline = 'middle';
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

// This film's pictograms, built from the engine's geometry (round-capped bars, discs, capsules). All figures are faceless.
(function () {
  const { disc, seg, ring, poly, rrect, clamp, lerp } = G;

  // Standing figure, origin = between the feet, h = body height. Faceless: a plain disc head.
  // o: { skin, cloth, cloth2 (far limbs), covered (long dress + head wrap), child, bow (0..1 bowed legs), arm (0..1 raised near arm) }
  G.figure = (ctx, x, y, h, o) => {
    const u = h / 10, skin = o.skin, cl = o.cloth, far = o.cloth2 || G.mix(cl, '#ffffff', 0.3);
    const hipY = y - u * 4.6, shY = y - u * 7.6, headY = y - u * 8.9, w = o.child ? u * 1.05 : u * 0.95;
    const legW = u * 1.05, armW = u * 0.8, bow = o.bow || 0;
    const leg = (dx, col) => {
      if (bow > 0) {  // bowed: the knee pushed outward
        ctx.strokeStyle = col; ctx.lineWidth = legW; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(x + dx * 0.5, hipY); ctx.quadraticCurveTo(x + dx * (1 + 3.2 * bow), y - u * 2.3, x + dx * 0.9, y - u * 0.3); ctx.stroke();
      } else seg(ctx, [x + dx * 0.5, hipY], [x + dx, y - u * 0.3], legW, col);
    };
    if (o.covered) {
      // far arm, then a long dress to the ankles, near arm, head wrap
      seg(ctx, [x - w * 0.9, shY + u * 0.3], [x - w * 1.5, hipY + u * 0.2], armW, far);
      poly(ctx, [[x - w * 0.95, shY - u * 0.2], [x + w * 0.95, shY - u * 0.2], [x + u * 2.0, y - u * 0.2], [x - u * 2.0, y - u * 0.2]], cl);
      rrect(ctx, x - w * 1.05, shY - u * 0.6, w * 2.1, u * 2.4, u * 0.9, cl);
      seg(ctx, [x + w * 0.9, shY + u * 0.3], [x + w * 1.5, hipY + u * 0.2], armW, cl);
      disc(ctx, x + w * 1.55, hipY + u * 0.35, u * 0.42, skin);           // a hand
      disc(ctx, x, headY, u * 1.25, cl);                                    // the wrap
      disc(ctx, x + u * 0.12, headY + u * 0.1, u * 0.78, skin);              // plain head, no features
      seg(ctx, [x - u * 0.7, headY + u * 0.4], [x + u * 0.9, headY + u * 1.1], u * 0.55, cl); // wrap under the chin
      return;
    }
    leg(-u * 0.9, far);
    seg(ctx, [x - w * 0.9, shY + u * 0.2], [x - w * 1.4, hipY + u * 0.6], armW, G.mix(skin, '#ffffff', 0.18));
    leg(u * 0.9, cl);
    rrect(ctx, x - w, shY - u * 0.5, w * 2, hipY - shY + u * 0.9, u * 0.9, cl);
    const ar = o.arm || 0;
    seg(ctx, [x + w * 0.9, shY + u * 0.2], [x + w * lerp(1.4, 1.9, ar), lerp(hipY + u * 0.6, shY - u * 2.2, ar)], armW, skin);
    disc(ctx, x, headY, u * 1.05, skin);
  };

  // Sun: the engine's sunIcon, with rays that can grow (k) and a grey for a weak sun
  G.sun = (ctx, x, y, r, col, spin = 0, k = 1) => {
    disc(ctx, x, y, r, col);
    for (let i = 0; i < 12; i++) {
      const a = spin + (i / 12) * Math.PI * 2;
      seg(ctx, [x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3], [x + Math.cos(a) * r * (1.3 + 0.42 * k), y + Math.sin(a) * r * (1.3 + 0.42 * k)], r * 0.17, col);
    }
  };
  // A ray: a round-capped bar from a to a + len along angle; p = how far it has travelled (0..1)
  G.ray = (ctx, a, b, p, w, col) => { if (p <= 0) return; seg(ctx, a, [lerp(a[0], b[0], clamp(p)), lerp(a[1], b[1], clamp(p))], w, col); };

  // The D disc and the D meter (a capsule that fills from the bottom)
  G.dDisc = (ctx, x, y, r, col, ink) => {
    disc(ctx, x, y, r, col);
    ctx.save(); ctx.fillStyle = ink; ctx.font = `900 ${Math.round(r * 1.25)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('D', x + r * 0.03, y + r * 0.06); ctx.restore();
  };
  G.meter = (ctx, x, y, w, h, level, track, fill, ink, low) => {
    // (x, y) = bottom centre
    rrect(ctx, x - w / 2, y - h, w, h, w / 2, track);
    const lv = clamp(level), pad = w * 0.14, ih = (h - pad * 2) * lv;
    if (ih > 1) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2 + pad, y - h + pad, w - pad * 2, h - pad * 2, (w - pad * 2) / 2); ctx.clip();
      ctx.fillStyle = low && lv < 0.3 ? low : fill; ctx.fillRect(x - w / 2, y - pad - ih, w, ih + 1); ctx.restore();
    }
    G.dDisc(ctx, x, y - h - w * 0.62, w * 0.5, fill, ink);
  };

  // Bone: a bar with two knobs at each end. Grows thicker with th (1 = normal).
  G.bone = (ctx, a, b, w, col) => {
    seg(ctx, a, b, w, col);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, k = w * 0.55;
    for (const [p, s] of [[a, -1], [b, 1]]) {
      const ex = p[0] + (dx / L) * s * w * 0.15, ey = p[1] + (dy / L) * s * w * 0.15;
      disc(ctx, ex + nx * k, ey + ny * k, w * 0.62, col); disc(ctx, ex - nx * k, ey - ny * k, w * 0.62, col);
    }
  };
  // Pain marks: three short zigzag bolts around a point
  G.pain = (ctx, x, y, s, col, p = 1) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [[-1.1, -0.9, -0.6], [0, -1.35, 0], [1.1, -0.9, 0.6]].forEach(([dx, dy, rot], i) => {
      if (p * 3 < i) return;
      ctx.save(); ctx.translate(x + dx * s, y + dy * s); ctx.rotate(rot);
      ctx.beginPath(); ctx.moveTo(0, s * 0.35); ctx.lineTo(-s * 0.15, 0.05 * s); ctx.lineTo(s * 0.15, -0.05 * s); ctx.lineTo(0, -s * 0.35); ctx.stroke(); ctx.restore();
    });
    ctx.restore();
  };

  // Plane: fuselage capsule, swept wings, tail. (x, y) centre, s = half length, ang = heading
  G.plane = (ctx, x, y, s, ang, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    seg(ctx, [-s, 0], [s, 0], s * 0.26, col);
    poly(ctx, [[s * 0.15, 0], [-s * 0.3, -s * 0.85], [-s * 0.5, -s * 0.85], [-s * 0.2, 0]], col);
    poly(ctx, [[s * 0.15, 0], [-s * 0.3, s * 0.85], [-s * 0.5, s * 0.85], [-s * 0.2, 0]], col);
    poly(ctx, [[-s * 0.75, 0], [-s * 1.0, -s * 0.38], [-s * 1.1, -s * 0.38], [-s * 0.95, 0]], col);
    poly(ctx, [[-s * 0.75, 0], [-s * 1.0, s * 0.38], [-s * 1.1, s * 0.38], [-s * 0.95, 0]], col);
    ctx.restore();
  };
  // House: body + roof + door. (x, y) = bottom centre, s = width
  G.house = (ctx, x, y, s, wall, roof, door) => {
    rrect(ctx, x - s / 2, y - s * 0.72, s, s * 0.72, s * 0.04, wall);
    poly(ctx, [[x - s * 0.62, y - s * 0.68], [x, y - s * 1.18], [x + s * 0.62, y - s * 0.68]], roof);
    rrect(ctx, x - s * 0.1, y - s * 0.34, s * 0.2, s * 0.34, s * 0.03, door);
    rrect(ctx, x + s * 0.2, y - s * 0.56, s * 0.18, s * 0.16, s * 0.02, door);
  };
  G.snow = (ctx, x, y, r, col) => {
    ctx.save(); ctx.translate(x, y);
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI / 3); seg(ctx, [-r, 0], [r, 0], r * 0.2, col);
      for (const s of [-1, 1]) { seg(ctx, [s * r * 0.55, 0], [s * r * 0.8, -r * 0.25], r * 0.14, col); seg(ctx, [s * r * 0.55, 0], [s * r * 0.8, r * 0.25], r * 0.14, col); }
    }
    ctx.restore();
  };
  // City: a row of blocks (x, y = baseline left, w total width)
  G.city = (ctx, x, y, w, col, win) => {
    const B = [[0, .55, .16], [.17, .8, .14], [.32, .45, .12], [.45, .95, .16], [.62, .62, .13], [.76, .78, .11], [.88, .5, .12]];
    for (const [a, h, bw] of B) {
      rrect(ctx, x + a * w, y - h * w * 0.5, bw * w, h * w * 0.5, 6, col);
      for (let r = 0; r < Math.floor(h * 5); r++) for (let c = 0; c < 2; c++) rrect(ctx, x + a * w + bw * w * (0.2 + c * 0.38), y - h * w * 0.5 + 18 + r * 0.05 * w, bw * w * 0.22, 0.025 * w, 3, win);
    }
  };
  // Battery: body outline, terminal, one cell lit. (x, y) centre, s = width
  G.battery = (ctx, x, y, s, frame, cell, level) => {
    const h = s * 0.5, t = s * 0.07;
    ctx.save(); ctx.strokeStyle = frame; ctx.lineWidth = t; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.roundRect(x - s / 2, y - h / 2, s * 0.9, h, s * 0.08); ctx.stroke(); ctx.restore();
    rrect(ctx, x + s * 0.42, y - h * 0.2, s * 0.08, h * 0.4, s * 0.03, frame);
    const iw = (s * 0.9 - t * 3) * clamp(level);
    if (iw > 0) rrect(ctx, x - s / 2 + t * 1.5, y - h / 2 + t * 1.5, iw, h - t * 3, s * 0.03, cell);
  };
  // Test tube: (x, y) = bottom centre, s = height; level 0..1 of blood
  G.tube = (ctx, x, y, s, glass, blood, cap, level) => {
    const w = s * 0.26;
    rrect(ctx, x - w / 2, y - s, w, s, w / 2, glass);
    const ih = (s - w * 0.5) * clamp(level);
    if (ih > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(x - w / 2 + w * 0.14, y - s + w * 0.3, w * 0.72, s - w * 0.44, w * 0.36); ctx.clip(); ctx.fillStyle = blood; ctx.fillRect(x - w, y - w * 0.14 - ih, w * 2, ih); ctx.restore(); }
    rrect(ctx, x - w * 0.62, y - s - w * 0.32, w * 1.24, w * 0.55, w * 0.12, cap);
  };
  // Supplement bottle with a D label: (x, y) = bottom centre, s = height
  G.bottle = (ctx, x, y, s, body, cap, label, ink) => {
    const w = s * 0.66;
    rrect(ctx, x - w / 2, y - s * 0.86, w, s * 0.86, w * 0.16, body);
    rrect(ctx, x - w * 0.36, y - s, w * 0.72, s * 0.2, w * 0.08, cap);
    rrect(ctx, x - w * 0.42, y - s * 0.62, w * 0.84, s * 0.36, w * 0.06, label);
    G.dDisc(ctx, x, y - s * 0.44, s * 0.13, G.PAL.sun.t[2], ink);
  };
  G.capsule = (ctx, x, y, s, ang, a, b) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    seg(ctx, [-s * 0.5, 0], [0, 0], s * 0.5, a); seg(ctx, [0, 0], [s * 0.5, 0], s * 0.5, b); ctx.restore();
  };
  G.tick = (ctx, x, y, s, col, p = 1) => {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const A = [x - s * 0.5, y], B = [x - s * 0.12, y + s * 0.4], C = [x + s * 0.6, y - s * 0.45];
    const q = clamp(p) * 2; ctx.beginPath(); ctx.moveTo(...A);
    if (q < 1) ctx.lineTo(lerp(A[0], B[0], q), lerp(A[1], B[1], q)); else { ctx.lineTo(...B); ctx.lineTo(lerp(B[0], C[0], q - 1), lerp(B[1], C[1], q - 1)); }
    ctx.stroke(); ctx.restore();
  };
  // Timer: a clock ring with a hand, and a bar to its right that fills (p) up to length L
  G.timer = (ctx, x, y, r, L, p, track, fill, ink) => {
    rrect(ctx, x + r * 1.5, y - r * 0.45, L, r * 0.9, r * 0.45, track);
    if (p > 0) rrect(ctx, x + r * 1.5, y - r * 0.45, Math.max(r * 0.9, L * clamp(p)), r * 0.9, r * 0.45, fill);
    disc(ctx, x, y, r, track); ring(ctx, x, y, r * 0.78, r * 0.2, ink);
    const a = -Math.PI / 2 + p * Math.PI * 4; seg(ctx, [x, y], [x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5], r * 0.16, ink);
  };
  // Speech bubble (x, y = centre) and a down arrow
  G.bubble = (ctx, x, y, w, h, col) => {
    rrect(ctx, x - w / 2, y - h / 2, w, h, h * 0.3, col);
    poly(ctx, [[x - w * 0.22, y + h / 2 - 2], [x - w * 0.32, y + h / 2 + h * 0.38], [x - w * 0.04, y + h / 2 - 2]], col);
  };
  G.arrowDown = (ctx, x, y, s, col) => {
    seg(ctx, [x, y - s], [x, y + s * 0.6], s * 0.3, col);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x - s * 0.6, y); ctx.lineTo(x, y + s * 0.65); ctx.lineTo(x + s * 0.6, y); ctx.stroke(); ctx.restore();
  };
  // A map polygon list in lon/lat, drawn through proj([lon, lat]) → [x, y]
  G.geo = (ctx, polys, proj, col) => {
    ctx.fillStyle = col; ctx.beginPath();
    for (const r of polys) r.forEach((p, i) => { const q = proj(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
    ctx.fill('evenodd');
  };
})();
// Thumbs up (a like): cuff, palm with finger bands, thumb. (x, y) = palm centre, s = size
G.thumb = (ctx, x, y, s, col, cuff, line) => {
  G.rrect(ctx, x - s * 0.62, y - s * 0.12, s * 0.22, s * 0.62, s * 0.06, cuff);
  G.rrect(ctx, x - s * 0.36, y - s * 0.14, s * 0.7, s * 0.66, s * 0.14, col);
  for (let i = 1; i < 4; i++) G.seg(ctx, [x + s * 0.12, y - s * 0.14 + i * s * 0.165], [x + s * 0.34, y - s * 0.14 + i * s * 0.165], s * 0.03, line);
  G.seg(ctx, [x - s * 0.22, y - s * 0.08], [x + s * 0.02, y - s * 0.6], s * 0.24, col);
};
// Bell (notifications): dome, rim, clapper
G.bell = (ctx, x, y, s, col) => {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.42, y - s * 0.55, x, y - s * 0.55); ctx.quadraticCurveTo(x + s * 0.42, y - s * 0.55, x + s * 0.5, y + s * 0.3); ctx.closePath(); ctx.fill();
  G.rrect(ctx, x - s * 0.58, y + s * 0.22, s * 1.16, s * 0.16, s * 0.08, col); G.disc(ctx, x, y + s * 0.5, s * 0.13, col);
};

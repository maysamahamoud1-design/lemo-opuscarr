# After tools/splice.py: the favourite-standard patches on film.js: a looping ending (the last frame is the first),
# a whoosh on every card change, and cards sorted by time.
import os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
s = open(f'{H}/film.js').read()
def rep(x, y):
    global s
    assert x in s, x[:60]; s = s.replace(x, y)
rep("if (c.sc === 's01') G.maskText(ctx, KICK", "if (c.sc === 's01' || c.loop) G.maskText(ctx, KICK")
rep("    hud(ctx, t, sc, P);\n    const cap = captions(ctx, t, P, sc);",
    "    const edge = Math.min(inv(0, 0.2, t), 1 - inv(DUR - 0.55, DUR - 0.15, t));\n    ctx.save(); ctx.globalAlpha = edge; hud(ctx, t, sc, P);\n    const cap = captions(ctx, t, P, sc); ctx.restore();")
rep("inv(-0.2, 0.15, t), { align: 'center', ls: '3px' }", "1, { align: 'center', ls: '3px' }")
rep("if (c.t0 === 0) since = -0.2;", "if (c.t0 === 0) since = -1;")
rep("const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * t * 14;", "const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * 90 * Math.sin(2 * Math.PI * t / DUR);")
rep("  C.forEach((c, i) => (c.t1 =", "  C.sort((a, b) => a.t0 - b.t0);\n  C.forEach((c, i) => (c.t1 =")
rep("  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));",
    "  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));\n  C.forEach((c, i) => { if (i && !WIPES.some((w) => Math.abs(w.t - c.t0) < 0.01)) EV.push({ t: +(c.t0 - 0.04).toFixed(3), type: 'whoosh', dur: 0.45, gain: 0.55 }); });")
# the loop card: after like-and-subscribe, back to the opening shot, reset to frame 0 in the last half second
rep("  // the bouncing arrow lives outside the card",
    "  card(S('s13').v + S('s13').vd + 0.9, 's13', (ctx, lt, P, t) => opening(ctx, t > DUR - 0.5 ? 0 : lt), 'WAAYO?', [[0.25, 'pop']]);\n  C[C.length - 1].loop = true;\n  // the bouncing arrow lives outside the card")
open(f'{H}/film.js', 'w').write(s); print('loop patches applied')

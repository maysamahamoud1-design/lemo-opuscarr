# Builds film.js from the series engine (the vitamin D film's film.js) and this film's cards.js, with the loop changes.
import re, sys, os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
src = open(sys.argv[1]).read(); cards = open(f'{H}/cards.js').read()
a = src.index('  // ——— 1 · hook'); b = src.index('  // the bouncing arrow lives outside the card')
s = src[:a] + cards + src[b:]
def rep(x, y):
    global s
    assert x in s, x[:60]; s = s.replace(x, y)
rep("if (c.sc === 's01') G.maskText(ctx, KICK", "if (c.sc === 's01' || c.loop) G.maskText(ctx, KICK")
# loop: the HUD and captions fade in at the start and out at the end, so the last frame is the first
rep("    hud(ctx, t, sc, P);\n    const cap = captions(ctx, t, P, sc);",
    "    const edge = Math.min(inv(0, 0.2, t), 1 - inv(DUR - 0.55, DUR - 0.15, t));\n    ctx.save(); ctx.globalAlpha = edge; hud(ctx, t, sc, P);\n    const cap = captions(ctx, t, P, sc); ctx.restore();")
rep("inv(-0.2, 0.15, t), { align: 'center', ls: '3px' }", "1, { align: 'center', ls: '3px' }")
rep("if (c.t0 === 0) since = -0.2;", "if (c.t0 === 0) since = -1;")
rep("const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * t * 14;", "const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * 90 * Math.sin(2 * Math.PI * t / DUR);")
rep('// Waayo? · Fiitamiin D: the film', '// Waayo? · Fiitamiin D: the film (it loops: the last frame is the first)')
rep("  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));",
    "  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));\n  C.forEach((c, i) => { if (i && !WIPES.some((w) => Math.abs(w.t - c.t0) < 0.01)) EV.push({ t: +(c.t0 - 0.04).toFixed(3), type: 'whoosh', dur: 0.45, gain: 0.55 }); });")
open(f'{H}/film.js', 'w').write(s); print('film.js', len(s))

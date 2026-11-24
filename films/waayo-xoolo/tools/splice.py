# Builds film.js from the series engine (the vitamin D film's film.js) and this film's cards.js, with the loop changes.
import re, sys, os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
src = open(sys.argv[1]).read(); cards = open(f'{H}/cards.js').read()
a = src.index('  // ——— 1 · hook'); b = src.index('  // the bouncing arrow lives outside the card')
s = src[:a] + cards + src[b:]
def rep(x, y):
    global s
    assert x in s, x[:60]; s = s.replace(x, y)
s = re.sub(r"const HUE = \{[^}]*\};", "const HUE = { s01: 'sand', s02: 'brown', s03: 'sand', s04: 'sky', s05: 'gold', s06: 'sand' };", s)
rep("const KICK = 'SOOMAALIDA QURBAHA · FIITAMIIN D';", "const KICK = 'GANACSIGA XOOLAHA SOOMAALIYA';")
rep("'WAAYO? · FIITAMIIN D'", "'WAAYO? · XOOLAHA'")
rep("const SUN = PAL.sun.t[2], SUNL = PAL.sun.t[3];", "const SUN = PAL.sun.t[2], SUNL = '#ffc93c';")
rep("if (c.sc === 's01') G.maskText(ctx, KICK", "if (c.sc === 's01' || c.loop) G.maskText(ctx, KICK")
# loop: the HUD and captions fade in at the start and out at the end, so the last frame is the first
rep("const CAPF = '800 58px Montserrat', CAPY = 1330, LH = 76, CW = 900;", "const CAPF = '800 68px Montserrat', CAPY = 1310, LH = 86, CW = 940;")
rep("if (sc.id === 's08' && t > wt('s08', 'maxaad') + 0.6) {", "if (false) {")
rep("inv(-0.2, 0.15, t), { align: 'center', ls: '3px' }", "1, { align: 'center', ls: '3px' }")
rep("if (c.t0 === 0) since = -0.2;", "if (c.t0 === 0) since = -1;")
rep("const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * t * 14;", "const rowDrift = (t) => (j) => (j % 2 ? 1 : -1) * 90 * Math.sin(2 * Math.PI * t / DUR);")
rep('// Waayo? · Fiitamiin D: the film', '// Waayo? · Xoolaha: the film (it loops: the last frame is the first)')
rep("  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));",
    "  C.forEach((c) => c.ev.forEach(([dt, type, o]) => EV.push({ t: +(c.t0 + dt).toFixed(3), type, ...(o || {}) })));\n  C.forEach((c, i) => { if (i && !WIPES.some((w) => Math.abs(w.t - c.t0) < 0.01)) EV.push({ t: +(c.t0 - 0.04).toFixed(3), type: 'whoosh', dur: 0.45, gain: 0.55 }); });")
s = s.replace("wt('s08', 'maxaad')", "0").replace('(t - s8.t)', '0')
open(f'{H}/film.js', 'w').write(s); print('film.js', len(s))

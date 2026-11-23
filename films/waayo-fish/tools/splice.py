# Builds film.js from the series engine (the vitamin D film's film.js) and this film's cards.js.
import re, sys, os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
src = open(sys.argv[1]).read(); cards = open(f'{H}/cards.js').read()
a = src.index('  // ——— 1 · hook'); b = src.index('  // the bouncing arrow lives outside the card')
s = src[:a] + cards + src[b:]
s = re.sub(r"const HUE = \{[^}]*\};", "const HUE = { s01: 'aqua', s02: 'sand', s03: 'teal', s04: 'navy', s05: 'teal', s06: 'coral', s07: 'sand', s08: 'aqua' };", s)
s = s.replace("const KICK = 'SOOMAALIDA QURBAHA · FIITAMIIN D';", "const KICK = 'BADDA SOOMAALIYA · KALLUUNKA';")
s = s.replace("'WAAYO? · FIITAMIIN D'", "'WAAYO? · KALLUUN'")
s = s.replace("wt('s08', 'maxaad')", "wt('s08', 'adiga')")
s = s.replace('// Waayo? · Fiitamiin D: the film', '// Waayo? · Kalluunka: the film')
s = s.replace('const SUN = PAL.sun.t[2], SUNL = PAL.sun.t[3];', "const SUN = PAL.sun.t[2], SUNL = '#ee6c4d';")
assert "SUNL = '#ee6c4d'" in s
assert 'FIITAMIIN' not in s
open(f'{H}/film.js', 'w').write(s); print('film.js', len(s))

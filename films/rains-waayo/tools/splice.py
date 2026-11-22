# Builds film.js from the series engine (the vitamin D film's film.js) and this film's cards.js.
import re, sys, os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
src = open(sys.argv[1]).read(); cards = open(f'{H}/cards.js').read()
a = src.index('  // ——— 1 · hook'); b = src.index('  // ——— 9 · like and subscribe ———')
like = src[b:src.index('  // the bouncing arrow lives outside the card')]
like = like.replace("'s09'", "'s13'").replace('const s9 = S(', 'const s13c = S(').replace('s9.t', 's13c.t').replace('9 · like', '13 · like')
s = src[:a] + cards + like + src[src.index('  // the bouncing arrow lives outside the card'):]
s = re.sub(r"const HUE = \{[^}]*\};", "const HUE = { s01: 'sun', s02: 'blue', s03: 'teal', s04: 'teal', s05: 'teal', s06: 'sun', s07: 'blue', s08: 'blue', s09: 'coral', s10: 'coral', s11: 'coral', s12: 'sun', s13: 'sun' };", s)
s = s.replace("const KICK = 'SOOMAALIDA QURBAHA · FIITAMIIN D';", "const KICK = 'SOOMAALIYA · LABA XILLI-ROOBAAD';")
s = s.replace("'WAAYO? · FIITAMIIN D'", "'WAAYO? · XILLI-ROOBAAD'")
s = s.replace("sc.id === 's08' && t > wt('s08', 'maxaad') + 0.6", "sc.id === 's12' && t > wt('s12', 'maxaad') + 0.6")
s = s.replace("wt('s08', 'maxaad') + 0.6, wt('s08', 'maxaad') + 0.9", "wt('s12', 'maxaad') + 0.6, wt('s12', 'maxaad') + 0.9").replace("(t - s8.t)", "(t - S('s12').t)")
s = s.replace('// Waayo? · Fiitamiin D: the film', '// Waayo? · Labada xilli-roobaad: the film')
open(f'{H}/film.js', 'w').write(s); print('film.js', len(s))

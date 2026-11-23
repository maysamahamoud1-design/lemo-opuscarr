# Builds film.js from the series engine (the vitamin D film's film.js) and this film's cards.js.
import re, sys, os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
src = open(sys.argv[1]).read(); cards = open(f'{H}/cards.js').read()
a = src.index('  // ——— 1 · hook'); b = src.index('  // the bouncing arrow lives outside the card')
s = src[:a] + cards + src[b:]
s = re.sub(r"const HUE = \{[^}]*\};", "const HUE = { s01: 'coral', s02: 'teal', s03: 'blue', s04: 'sun', s05: 'blue', s06: 'coral', s07: 'green', s08: 'coral' };", s)
s = s.replace("const KICK = 'SOOMAALIDA QURBAHA · FIITAMIIN D';", "const KICK = 'DHIIG-KARKA · DILAAGA AAMUSAN';")
s = s.replace("'WAAYO? · FIITAMIIN D'", "'WAAYO? · DHIIG-KAR'")
s = s.replace("wt('s08', 'maxaad')", "wt('s08', 'adiga')")
s = s.replace('// Waayo? · Fiitamiin D: the film', '// Waayo? · Dhiig-kar: the film')
assert 'FIITAMIIN' not in s
open(f'{H}/film.js', 'w').write(s); print('film.js', len(s))

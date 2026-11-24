"""Mix: Muuse's Somali voice + sparse NON-MUSICAL effects (filtered noise and transients only: no tones, no music).
Reads events.json (from the page) and voices/*.wav; writes out/mix.wav (48 kHz stereo) at about -14 LUFS.
usage (library root): .venv/bin/python films/waayo-vitamin-d/mix.py"""
import json, os, sys, subprocess, re
import numpy as np, soundfile as sf, soxr
H = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(H, '..', '..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, brown, compress, limit, add
EV = json.load(open(os.path.join(H, 'events.json')))
EVS = EV['ev'] if isinstance(EV, dict) else EV
DUR = (EV.get('dur') if isinstance(EV, dict) else None) or max(e['t'] for e in EVS) + 3
N = int((DUR + .5) * SR); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(3)

def env_ar(d, a, r):  # attack / release envelope
    n = int(d * SR); e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def sweep_noise(d, f0, f1, q=.6):  # band-passed noise whose band slides from f0 to f1 (blockwise)
    x = noise(d); out = np.zeros_like(x); blk = 1024
    for i in range(0, len(x), blk):
        u = i / len(x); f = f0 * (f1 / f0) ** u; lo, hi = max(40, f * (1 - q)), min(SR / 2 - 100, f * (1 + q))
        out[i:i + blk] = bp(x[max(0, i - 4096):i + blk], lo, hi)[-len(x[i:i + blk]):]
    return out
def whoosh(d=1.2): return norm(sweep_noise(d, 300, 2400) * np.sin(np.pi * np.linspace(0, 1, int(round(d * SR)))) ** 1.6)
def swipe(d=.45): return norm(sweep_noise(d, 900, 4200, .5) * np.sin(np.pi * np.linspace(0, 1, int(round(d * SR)))) ** 2)
def click(): d = .03; return norm(hp(noise(d), 2500) * env_exp(d, .002))
def pop(): d = .14; return norm(lp(noise(d), 900) * env_exp(d, .025) + .6 * hp(noise(d), 3000) * env_exp(d, .004))
def paper(d=.5):
    x = bp(noise(d), 1200, 6000); grain = (rng.random(len(x)) < .02).astype(float); grain = lp(grain, 3000)
    return norm(x * (.4 + 3 * np.abs(grain)) * env_ar(d, .05, .2))
def rain(d): x = bp(noise(d), 2500, 9000) * .5 + bp(noise(d), 600, 2000) * .25; ticks = hp((rng.random(int(round(d * SR))) < .0015).astype(float), 3000) * 1.5; return norm((x + ticks) * env_ar(d, .4, .6))
def wind(d, lo=150, hi=900): b = brown(d); m = .6 + .4 * np.sin(2 * np.pi * .23 * t_(d) + 1.2) * np.sin(2 * np.pi * .07 * t_(d)); return norm(bp(b, lo, hi) * m * env_ar(d, .8, 1.0))
def air(d): return norm(lp(brown(d), 700) * env_ar(d, .6, .8))
def sea(d): b = brown(d); sw = .55 + .45 * np.sin(2 * np.pi * .16 * t_(d)) ** 2; return norm(bp(b, 80, 1400) * sw * env_ar(d, .8, 1.0))
def shimmer(d): return norm(hp(noise(d), 5000) * env_ar(d, d * .5, d * .45))
def tear(d=.9): return norm(sweep_noise(d, 3000, 400, .5) * env_ar(d, .02, .5))
def sparkle(d=.8):  # airy noise grains, thinning out: no pitch
    n = int(d * SR); x = np.zeros(n); g = .006
    for i in range(int(40 * d)):
        s = int(n * (rng.random() ** 1.6)); k = min(int(g * SR), n - s)
        if k > 8: x[s:s + k] += hp(noise(k / SR), 6500)[:k] * env_exp(k / SR, .0015) * (1 - s / n)
    return norm(x)
def thump():  # a heartbeat thump: very low filtered noise, fast attack (no pitch)
    d = .16; return norm(lp(brown(d), 110) * env_exp(d, .045) + .3 * lp(noise(d), 400) * env_exp(d, .01))
def ticks(d=1.0, rate=9):  # a clock ticking: short filtered clicks
    n = int(d * SR); x = np.zeros(n); c = click() * .7
    for i in range(int(d * rate)):
        s = int(i * SR / rate); k = min(len(c), n - s)
        if k > 0: x[s:s + k] += c[:k] * (1 if i % 2 else .7)
    return norm(x)
def clink():  # a spoon on a glass: a short metallic hit (inharmonic partials, fast decay)
    d = .35; t = t_(d); x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(2380, 1), (3910, .6), (5650, .4), (7300, .25)])
    return norm(x * env_exp(d, .05) + .3 * hp(noise(d), 4000) * env_exp(d, .004))
def sugar(d=.45):  # sugar falling: dense fine grains
    n = int(d * SR); g = (rng.random(n) < .03).astype(float) * rng.random(n)
    return norm(hp(g, 3500) * env_ar(d, .03, .2))
def pour(d=.6):  # tea pouring: a band of noise with a gurgling flutter
    x = bp(noise(d), 300, 2200) * (.6 + .4 * np.sin(2 * np.pi * 13 * t_(d)) ** 2)
    return norm(x * env_ar(d, .05, .2))
def ding():  # the requested ding: one soft tone with a fast-fading overtone
    d = .7; t = t_(d); return norm((np.sin(2 * np.pi * 1568 * t) + .25 * np.sin(2 * np.pi * 3920 * t) * env_exp(d, .08)) * env_exp(d, .22))
def scrape(d=.5):  # a knife scraping bark: rough band of noise, jittery
    x = bp(noise(d), 1800, 6000) * (.5 + .5 * (rng.random(int(round(d * SR))) < .3)); return norm(lp(np.abs(x), 3000) * np.sign(x) * env_ar(d, .02, .15))
def drip():  # a soft drip: a short low noise blip
    d = .12; return norm(lp(noise(d), 1200) * env_exp(d, .015))
def crackle(d=1.5):  # incense crackling: sparse dry clicks
    n = int(d * SR); x = np.zeros(n); c = hp(noise(.008), 2500)
    for i in range(int(18 * d)):
        s = int(rng.random() * (n - len(c))); x[s:s + len(c)] += c * env_exp(.008, .002) * (.3 + rng.random())
    return norm(x * env_ar(d, .1, .3))
def cough():  # a cough: two short breathy bursts (no pitch)
    out = np.zeros(int(.7 * SR))
    for i, (st, g) in enumerate([(0, 1), (.28, .7)]):
        d = .22; x = bp(noise(d), 250, 2500) * env_ar(d, .01, .16) * g; s0 = int(st * SR); out[s0:s0 + len(x)] += x
    return norm(out)
def sneeze():  # a sneeze: an in-breath hiss, then a sharp burst
    a = hp(noise(.35), 2000) * env_ar(.35, .3, .05) * .35; b = bp(noise(.3), 500, 6000) * env_exp(.3, .06)
    return norm(np.concatenate([a, b]))
def hush(d): return norm(lp(brown(d), 400) * env_ar(d, .4, .8))
FX = {'whoosh': lambda e: whoosh(e.get('dur', 1.2)), 'swipe': lambda e: swipe(), 'click': lambda e: click(), 'pop': lambda e: pop(), 'paper': lambda e: paper(),
      'rain': lambda e: rain(e['dur']), 'drywind': lambda e: wind(e['dur'], 400, 2200), 'wind': lambda e: wind(e['dur'], 300, 1600), 'air': lambda e: air(e['dur']),
      'sea': lambda e: sea(e['dur']), 'shimmer': lambda e: shimmer(e['dur']), 'tear': lambda e: tear(e.get('dur', .9)), 'hush': lambda e: hush(e['dur']), 'sparkle': lambda e: sparkle(e.get('dur', .8)), 'thump': lambda e: thump(), 'clink': lambda e: clink(), 'cough': lambda e: cough(), 'sneeze': lambda e: sneeze(), 'scrape': lambda e: scrape(e.get('dur', .5)), 'drip': lambda e: drip(), 'crackle': lambda e: crackle(e.get('dur', 1.5)), 'sugar': lambda e: sugar(e.get('dur', .45)), 'pour': lambda e: pour(e.get('dur', .6)), 'ding': lambda e: ding(), 'tick': lambda e: ticks(e.get('dur', 1.0))}
BED = {'rain', 'wind', 'drywind', 'air', 'sea', 'hush'}
fxL = np.zeros(N); fxR = np.zeros(N)
for i, e in enumerate(EVS):
    if e['type'] not in FX: continue
    x = FX[e['type']](e); g = e.get('gain', 1) * (.10 if e['type'] in BED else .30); pan = (rng.random() - .5) * .5
    add_l = x * g * (1 - max(0, pan)); add_r = x * g * (1 + min(0, pan)); s = int(e['t'] * SR); n = min(len(x), N - s)
    if n > 0: fxL[s:s + n] += add_l[:n]; fxR[s:s + n] += add_r[:n]
# voice: compress, place, duck effects under it
vo = np.zeros(N)
for e in EVS:
    if e['type'] != 'voice': continue
    a, sr = sf.read(os.path.join(H, 'voices', e['id'] + '.wav'));
    if a.ndim > 1: a = a.mean(1)
    a = soxr.resample(a, sr, SR); s = int(e['t'] * SR); n = min(len(a), N - s); vo[s:s + n] += a[:n]
vo = compress(vo / (np.abs(vo).max() + 1e-9) * .9, thr=.2, ratio=3)
venv = lp(np.abs(vo), 6) ; venv = venv / (venv.max() + 1e-9)
duck = 1 - .45 * np.clip(venv * 3, 0, 1)
L = vo * .9 + fxL * duck; R = vo * .9 + fxR * duck
mix = np.stack([L, R], 1); mix = mix / (np.abs(mix).max() + 1e-9) * .8
os.makedirs(os.path.join(H, 'out'), exist_ok=True); tmp = os.path.join(H, 'out', 'mix_pre.wav'); sf.write(tmp, mix, SR, subtype='PCM_24')
# loudness to -14 LUFS (measure with ffmpeg ebur128, apply gain, limit peaks to about -1 dBTP)
def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])
I0 = lufs(tmp); gain = 10 ** ((-14 - I0) / 20); mix = mix * gain
for c in range(2): mix[:, c] = limit(mix[:, c], ceil=.72)
out = os.path.join(H, 'out', 'mix.wav'); sf.write(out, mix, SR, subtype='PCM_24'); os.remove(tmp)
print('measured', I0, 'LUFS → gain', round(20 * np.log10(gain), 2), 'dB; final', lufs(out), 'LUFS;', round(len(mix) / SR, 2), 's')

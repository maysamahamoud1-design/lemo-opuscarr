# Word timings for karaoke captions. Azure's REST voice gives no word boundaries, so each word is placed on the line's
# *speech* time (pauses found in the audio are skipped), proportionally to its syllable weight. Writes voices/words.json.
import json, re, sys, numpy as np, soundfile as sf, os
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
lines = json.load(open(f'{H}/lines.json'))
OVR = {'ITCZ': 4.2, 'ITCZ-du': 5.2, 'monsoon-ka': 3.2, "Gu'": 1.2}
def weight(w):
    core = re.sub(r"[^\w'\-]", '', w)
    if core in OVR: return OVR[core]
    v = len(re.findall(r'[aeiou]+', core.lower())) or 1
    return v + .35
out = {}
for L in lines:
    a, sr = sf.read(f"{H}/voices/{L['id']}.wav"); hop = int(sr * .01)
    rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
    thr = max(rms.max() * .06, 1e-4); on = rms > thr
    # pauses: runs of ≥ 9 quiet frames (90 ms) inside the line
    segs = []; i = 0; n = len(on)
    while i < n:
        if on[i]:
            j = i
            while j < n and (on[j] or (j + 9 < n and on[j:j + 9].any())): j += 1
            segs.append((i * .01, j * .01)); i = j
        else: i += 1
    speech = sum(b - a for a, b in segs)
    def at(s):  # speech-time → real time
        for a0, b0 in segs:
            if s <= b0 - a0: return a0 + s
            s -= b0 - a0
        return segs[-1][1]
    words = L['text'].replace('–', ' – ').split()
    words = [w for w in words if w != '–'] if False else words
    ws = [2.35 if w == '–' else weight(w) + (1.6 if w.startswith('(') else 0) for w in words]; tot = sum(ws); c = 0; res = []
    for w, k in zip(words, ws):
        t0 = at(speech * c / tot); c += k; t1 = at(speech * c / tot)
        res.append({'w': w, 't0': round(t0, 3), 't1': round(t1, 3)})
    out[L['id']] = res
    print(L['id'], len(segs), 'chunks', ' '.join(f"{r['w']}@{r['t0']}" for r in res[:5]))
json.dump(out, open(f'{H}/voices/words.json', 'w'), ensure_ascii=False, indent=0)

# subtitles_so.srt: one cue per spoken line, timed to the voice (from timeline.js)
import json, os, re
H = os.path.dirname(os.path.abspath(__file__)) + '/..'
SC = json.loads(re.search(r'window\.SC = (\[.*?\]);', open(f'{H}/timeline.js').read(), re.S).group(1))
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
out = [f"{i + 1}\n{ts(s['v'])} --> {ts(min(s['end'], s['v'] + s['vd'] + .25))}\n{s['text']}\n" for i, s in enumerate(SC)]
open(f'{H}/subtitles_so.srt', 'w').write('\n'.join(out)); print(len(out), 'cues')

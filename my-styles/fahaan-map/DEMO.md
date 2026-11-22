# Fahaan Map: how the demo film was made

One example among many. Don't reuse its story, arc, shots, props or timings.

**Film**: *Labada Xilli-roobaad ee Soomaaliya* (Somalia's two rainy seasons), a Fahaan YouTube Short, 1080×1920, 24 fps, 56.1 s, Somali voice and captions only. `test.mp4`, poster `test.jpg`.

## Story

One tracked subject over one real landscape: the rain belt (the ITCZ) as a glowing amber band with clouds along it, sliding north and south over the Horn of Africa while the calendar strip's marker follows the months. It crosses Somalia twice a year (Gu', Deyr), which is the answer; then the turn: why Xagaa and Jilaal stay dry (the monsoon running along the coast and cold water upwelling, shown in a cut through the sea; a dry north-east wind). The 12 lines and their pronunciations are in `demo/lines.json`; the science behind it in `demo/FACTS.md` (positions shown are schematic).

## Shots

| t (s) | Shot |
|---|---|
| 0–4.7 | low oblique over Somalia, climbing; two storm clouds rain, the ground greens, pin SOOMAALIYA |
| 4.7–11 | crane up to a straight-down view; the calendar strip arrives, Gu' and Deyr stacks grow |
| 11–20.6 | aerial hold: the belt is drawn with clouds; trade winds from both hemispheres flow into it; dashed equator |
| 20.6–25.3 | explainer card over the map: warm air rises, cools, cloud, rain |
| 25.3–38.6 | high oblique then aerial: the subsolar point moves, the belt follows; it crosses Somalia north (Gu') and back (Deyr), the land greens |
| 38.6–43.6 | oblique along the coast: monsoon streams parallel to the shore |
| 43.6–48.3 | dive to a cut across the coast: real sea floor (×12), cold water rising, a rain cloud struck out |
| 48.3–51.7 | aerial: dry north-east streams, the land pales |
| 51.7–56.1 | pull back under a gradient: the Fahaan icon, FAHAAN, call to action held 2 s |

## Palette and data

Ground: Sentinel-2 cloudless 2016 (EOX, CC BY 4.0) at z7 and AWS Terrain Tiles at z6 over lon 28–64, lat −16–22, relief ×12, baked low-sun shadows. Amber for the belt and monsoon, cool white for the trade winds, pale sand for the dry wind, Fahaan yellow for the spoken word and the sun.

## Sound

Muuse (`so-SO-MuuseNeural`, Azure REST, rate +4 %); scene starts from line lengths (`tools/timeline.py`: each scene lasts its line + 0.45 s, at least 3 s; one 0.7 s near-silence before the turn). No music. Effects are filtered noise only (`mix.py`): whoosh, swipe, click, pop, paper slide, rain, wind, sea wash, an undersea hush, a tearing sweep for the cut. Effects duck under the voice; the mix is measured with ffmpeg `ebur128` and gained to −14 LUFS.

## Build

`LIB=<library> OUT=<folder> sh demo/build.sh` copies `demo/` to `$OUT/work`, makes the events and the mix, renders (about an hour at 24 fps in software rendering; `FPS=4` for a quick check) and writes `$OUT/test.mp4`. `voices/` holds the voiced lines, so no key is needed to rebuild; re-voicing needs the Azure key as a network secret (`tts_azure.py`). `assets/` holds the prepared map; delete it to fetch and prepare it again.

## Which file draws what

`main.js` everything on the timeline (terrain, ribbons, clouds, rain, sun, cut, camera, overlay); `icon.js` the Fahaan icon; `post.js` depth of field, bloom, vignette; `timeline.js` scene times; `events.json` the sound events read by `mix.py`.

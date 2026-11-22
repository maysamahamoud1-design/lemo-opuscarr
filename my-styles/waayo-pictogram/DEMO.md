# Waayo Pictogram: how the demo film was made

One example among many. Don't reuse its story, arc, shots, props or timings.

**Film**: *Waayo? · Fiitamiin D* (why Somalis abroad often have low vitamin D), a Fahaan YouTube Short, 1080×1920, 24 fps, 53.0 s. Script and scene order by the channel owner. `test.mp4`, poster `test.jpg`.

## Story

Nine voiced lines (`demo/lines.json`). The thread is a "D" meter: sunlight on the skin fills it (2), darker skin fills it more slowly (3), the weak winter sun of the UK, Norway and Canada lowers it (4), covering clothes and indoor life drain it (5), its emptiness gives tiredness, pain and rickets (6), a blood test and supplements refill it (7). Then the disclaimer and the comment question (8), and like-and-subscribe (9).

## Cards

| Sc. | Hue | Cards (change on the word) | Titles |
|---|---|---|---|
| 1 | yellow | Somalia under a rising sun · plane to figures under a pale sun (qurbaha) · "?" with a D disc (yaraanta) | kicker + WAAYO? |
| 2 | teal | skin layers and rays · D discs fly into the meter (sameeyaa) · D flows into a bone that thickens, muscle wraps it | MAQAARKA → FIITAMIIN D → LAFO & MURQO |
| 3 | teal | two figures, timers and meters; the light one fills first | MAQAARKA MADOW → QORRAX KA BADAN |
| 4 | blue | flat map, arcs and labels to the UK, Norway, Canada, figure groups · city, shrinking grey sun, clouds · snow, meter drops | QURBAHA → QORRAX DACIIF → XILLIGA QABOWGA |
| 5 | blue | covered figure, rays stop on the cloth · a house drops over her | DHAR → GUDAHA |
| 6 | coral | empty meter blinking · battery, bone with pain marks, child with bowed legs (RICKETS) in a row | YARAANTA D → CALAAMADAHA |
| 7 | green | test tube fills · bottle, capsules, meter refills · tick and snowflake | BAARITAAN DHIIG → KINIINNO D → XILLIGA QABOWGA |
| 8 | yellow | disclaimer card · WAAYO? with bubble and comment arrow | — |
| 9 | yellow | thumbs-up · SUBSCRIBE pill pressed, green tick | LIKE & SUBSCRIBE |

## Sound

Muuse, rate +6 %, scene = line + 0.3 s, last card held 1.6 s. Effects (`mix.py`): whoosh on chapter wipes and arcs, swipe on card changes, pops, clicks, light wind under the cold, sparkle for the D forming and refilling. −14 LUFS.

## Build

`LIB=<library> OUT=<folder> sh demo/build.sh` copies `demo/` to `$OUT/work`, rebuilds timings, captions, events, mix and picture (about a minute; 2D only) and writes `$OUT/test.mp4` and `subtitles_so.srt`. `voices/` holds Muuse's lines, so no key is needed to rebuild.

## Which file draws what

`film.js` cards, transitions, captions, HUD, watermark, events; `picto.js` pictograms; `engine.js` palette, pattern, type; `icon.js` the Fahaan icon; `geo.js` map shapes.

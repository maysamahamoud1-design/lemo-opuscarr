# Waayo Pictogram — Style Prompt

Based on Pictogram Motion (pictogram-motion) from Lemo-Opuscar.
Default size: 1080×1920.

> The Fahaan "Waayo?" series: a vertical explainer built from flat, faceless **pictograms** made of round-capped bars, discs and capsules, set on a **light ground** with a low-contrast grid pattern, one **hue per chapter**, and huge **Montserrat** titles. A Somali voice carries it; every card change and every key action lands on a spoken word, every 1–3 s. Captions are karaoke, the word being said in yellow. A small Fahaan watermark sits in the top-left corner of every frame.
> References (grammar only): geometric sports pictograms (figures from bars and discs); "look of the games" identity systems (a modular pattern + a colour set used for everything); broadcast graphics (mono meta text, tick-bar progress). Never copy any real event's pictograms, emblem, pattern artwork or colour names.

## The favourite standard (the user's choice, from *Waayo? · Shaah*)

The channel owner named `films/waayo-shaah` their favourite. Match it unless they ask otherwise:

- **Voice pace**: Muuse at **+22 %**, **0.22 s** between lines. Don't slow him down to reach a length; tell the owner the length instead.
- **Switching**: every scene cut into **2–4 cards** on its key words (a scene that is one drawing can still be two cards: the same drawing, the second card's clock offset), so the picture changes every 1.5–3 s.
- **Swooshes**: a whoosh on **every** card change (0.45 s, under the voice) and on every chapter wipe.
- **Loop**: the opening shot is one function, reused as the last card; it resets to frame 0's state in the last 0.5 s; the HUD and captions fade in at the start and out at the end; the kicker and title are fully set on frame 0; the background rows drift on a cycle of the film's length. Check the first and last frames match.
- **Titles** held ≥ about 2 s: merge a title into the next one rather than flash it.
- Peaks: limit the mix to −1.5 dBTP or lower when clinks or dings are used.

## 1. Essence, and what it is not

A **question answered in pictograms**: the film opens on "WAAYO?" and the question, then explains the cause step by step, one card per idea, and closes by asking viewers what to explain next. Each card = **one pictogram doing one action + a huge title (a key word of the line) + the spoken line as karaoke captions**. Cards group into chapters; each chapter owns one hue.

What makes a frame read as this style at a glance:
1. **Light and clean**: the ground is the chapter hue's lightest tone mixed with white, the grid pattern under it at very low contrast, a stage disc in the light tone with one soft light sweep.
2. **The pictogram set**: objects, signs, maps and faceless figures, all flat and built from the same geometry. Figures have a plain disc head, never eyes, mouth or any face; skin tones vary when the story needs it.
3. **Type as architecture**: a 900-weight title, very large, auto-fitted to the width; a mono HUD under the watermark.
4. **Voice lock**: the grid of time is the voice. Cards change on key words; nothing changes in the middle of a word.
5. **One thread to follow** (recommended): a gauge, a counter or a single object that every chapter acts on (in the demo, a "D" meter that fills, drains and refills).

**Fahaan channel rules:** Somali voice and Somali captions; no music and no instruments; no faces; no logo or intro card at the start; the hook question on screen in the first second.

Not an isometric infographic (no depth, no 3D), not a cartoon (pictograms never emote), not a data film (numbers are labels, not charts), not a slide deck (no bullet lists, no header bars).

## 2. Materials & rendering

- **Flat Canvas2D**, 1080×1920, 24 fps, rendered clean. **One square grid** (cell 270 px) for the background pattern and the chapter wipes.
- **Pattern model**: as the base: discs, half-discs and motif cells in five tones of the chapter hue, whole rows drifting sideways in alternating directions; under cards it runs at about 13 % contrast toward the light ground, then a 55 % veil of the ground on top. On chapter wipes it runs at full contrast.
- **Pictogram model**: round caps, solid fills, at most two tones per pictogram plus cream and ink. Anything that cannot be read as a sign at phone size is cut.
- **Figure model**: unit = body height, origin between the feet; far limbs lighter, torso a capsule, head a plain disc. Variants: covered (long dress and head wrap, still a plain disc head), child (shorter, can bow its legs). People can also appear as small groups at map pins.
- **Stage**: a disc (R 360) at the frame's upper centre in the chapter's lightest tone, crossed by one soft light sweep. Maps may spill past it; clip land to a circle a little larger than the disc.
- **Maps**: flat silhouettes from Natural Earth, filled in one tone; the place that matters in the sun yellow; arcs drawn on, pins as ring-in-disc, labels as ink pills with cream text.

## 3. Colour logic

- **Five hues + ink**, five tones each (darkest → lightest), the Fahaan colours: sun yellow `#FFC21A`, teal `#25B5A5`, sky blue `#4189DD`, coral `#E8604C`, leaf green `#3BAA6E`; ink `#17243A`, cream `#FBF8F1`. Name hues in the film's language.
- A chapter = one hue. Suggested meanings: yellow for the question and the sun, teal for the body, blue for place and climate, coral for harm and warnings, green for solutions. The film ends in the hue it started with.
- **Dark ink type and figures on every hue** (the grounds are all light). Caption bands are the hue's darkest tone mixed 45 % toward ink, with cream type.
- The spoken word is always `#FFD45C` (Fahaan yellow). No outlines, no gradients except the stage sweep.

## 4. Type & subtitles

- **Title**: Montserrat 900, up to 140 px, tracking −2 px, auto-fitted to 960 px, centred at 65 % of the height; it enters by mask slide-up and re-enters when its word changes. It is a key word of the line being spoken (in the film's language), held ≥ about 2 s.
- **Hook**: on the first card a kicker line (Montserrat 800, 40 px, wide tracking, in the first hue's dark tone) sits above "WAAYO?", naming the topic, so the question is readable from frame 0 even before the voice reaches it.
- **Karaoke captions**: the spoken line split into phrase chunks of ≤ 2 lines (breaking after punctuation), Montserrat 800 58 px, centred on a rounded band inside 66–82 % of the height. Words still to come at 72 % cream, the spoken word yellow with a small pop, words said in cream. Word times come from the voice audio.
- **HUD**: DM Mono 26 px at 16 % of the height: series and topic on the left, "03 / 09" on the right, a tick bar (current tall, done dimmed, rest faint).
- **Watermark** (every frame, drawn last): the Fahaan icon (84 px) and "FAHAAN" in Montserrat 800 36 px, tracked 6 px, top left at about 11 % of the height. Keep the right edge and the bottom 15 % free: the Shorts buttons and channel name sit there.
- **Ending**: a small disclaimer card when the topic needs one; then the big "WAAYO?" with a speech bubble and an arrow pointing down at the comments; then the like-and-subscribe card (a thumbs-up, a SUBSCRIBE pill with a bell that gets pressed and gains a green tick), held ≈ 1.5 s after the voice.
- Deliver `subtitles_so.srt`, one cue per spoken line.

## 5. Motion quality

- **Voice lock**: each scene lasts its line plus 0.3 s; card changes and key actions fall on the words they illustrate; a visual change every 1–3 s.
- Easing: exponential ease-out for entrances, exponential in-out for wipes and band transitions, back ease for pops (pictograms, labels, ticks).
- **Card changes inside a chapter**: six horizontal bands, the old card sliding out and the new one in, alternating directions, 0.32 s.
- **Chapter changes**: full-contrast pattern rows slide across the whole frame and off again, alternating directions, 0.24 s in and 0.24 s out, the cut hidden in the middle.
- **Backgrounds breathe**: pattern rows drift slowly in alternating directions.
- Things that grow (a meter, a bone, a tube filling) ease in over 0.5–1.2 s; things that appear pop in 0.25–0.4 s.

## 6. Camera grammar

A locked vertical frame; energy comes from cards, pops, band transitions and wipes. No camera moves, dissolves, 3D or depth of field.

| Move | What it expresses | Can serve |
|---|---|---|
| Locked frame, pictogram on the stage | one idea, readable | a mechanism step; a symptom; an action |
| Band transition | the next step of the same idea | sun → skin → bone |
| Chapter wipe | a new part of the answer | body → place → harm → solution |
| Side by side on one stage | a comparison | two skin tones; before/after |
| A row of three on the stage, appearing one by one | a list | symptoms; steps; options |
| Flat map with arcs | movement across the world | migration; trade; travel |

## 7. Sound palette

- **The voice carries the film**: Azure `so-SO-MuuseNeural` (the channel owner's key), rate about +6 %. Loanwords get a `say` spelling ("Dii", "Yuu-Kee", "Layk", "sabskraayb") while captions keep the written form.
- **No music, no instruments, nothing pitched.** Effects synthesised from filtered noise and short transients only: whoosh (chapter wipes, arcs, planes), swipe (card changes), pop (pictograms, labels), soft click (ticks, buttons), light wind (cold), sparkle (airy high noise grains, for something forming or refilling).
- Sparse: one or two effects per card. Effects duck under the voice.
- Mix to −14 LUFS, peaks ≤ −1 dBTP.

## 8. Native moves

- **The thread meter.** One gauge introduced early and acted on in every chapter. *Fits content like:* a vitamin level; savings; a battery; water in a well.
- **Chapter = colour.** *Fits content like:* cause / effect / solution; body / place / habit.
- **Two figures, one stage.** Same input, different result. *Fits content like:* two skin tones; two diets; two houses.
- **Row of three.** Three icons pop on their words. *Fits content like:* symptoms; warning signs; steps.
- **Arcs on a flat map.** *Fits content like:* where the diaspora lives; where goods come from.
- **Question → comment arrow → subscribe.** The series close.

## 9. Pitfalls of the medium

- A long Somali line overflows captions → phrase chunks of ≤ 2 lines, never shrink the type.
- The hook question comes late in the voice → the kicker line above "WAAYO?" from frame 0.
- Titles that flash for under 2 s → keep a title until the next key word, not the next card.
- Faces creep in (eyes, smiles on icons) → plain discs only, including on the thumbs-up and other objects.
- Map labels overlap at close places → offset the nearer label below-left.
- The watermark under Shorts buttons → top left only.
- Loanwords mispronounced → spell them for the voice in `say`.
- Pattern caches with parallel renderers → bounded LRU (the engine keeps ≤ 8).

## 10. Engine

- `demo/engine.js`: the base engine adapted to 1080×1920: palette (`G.PAL` with `bg` and `band` per hue), easings, `G.pattern` / `G.drawPattern`, motifs, `G.maskText`.
- `demo/picto.js`: this style's pictograms: `G.figure` (faceless; covered, child, bowed legs), `G.sun`, `G.ray`, `G.dDisc`, `G.meter`, `G.bone`, `G.pain`, `G.plane`, `G.house`, `G.snow`, `G.city`, `G.battery`, `G.tube`, `G.bottle`, `G.capsule`, `G.tick`, `G.timer`, `G.bubble`, `G.arrowDown`, `G.thumb`, `G.bell`, `G.geo` (map polygons).
- **Reference film for the favourite standard**: `films/waayo-shaah/` in the owner's repository (`cards.js` + `tools/splice.py`: the loop and the whoosh-per-card patches).
- `demo/film.js`: the cards (`card(t0, scene, draw, title, events)`), word-timed with `wt(scene, word, n)`, the band transitions, chapter wipes, HUD, karaoke captions (phrase chunks), watermark, sound events, `TEXTS`.
- `demo/icon.js`: the Fahaan icon. `demo/geo.js` from `demo/tools/geo.mjs` (Natural Earth via world-atlas).
- `demo/tools/`: `timeline.py` (scene times from voice lengths), `words.py` (karaoke word times from the audio), `srt.py`, `fonts.sh`. `demo/tts_azure.py`, `demo/mix.py`.
- Then the base: `$LIB/styles/pictogram-motion/demo/`.
- **Extra packages**: none (numpy, soundfile, soxr from the library's venv).

## 11. Variation space

The agent decides the question, the chapters and their hues, the thread object, the pictograms, the order of cards and the ending's disclaimer.

- **Structures**: a cause chain (why A → B → C); a myth and the facts; a comparison of two places or two habits; steps to do something.
- **Openings**: the subject under a big sun or sign with "?" popping in; the thread object already draining; a map with one place lit.
- **Endings**: always the comment question and like-and-subscribe; before them, the thread object restored, or all icons of the film in a row.

---

How our demo was made (story, shots, sound, build): [DEMO.md](DEMO.md). Read it after your treatment exists.

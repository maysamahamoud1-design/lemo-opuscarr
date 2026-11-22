# Fahaan Map — Style Prompt

Based on 3D Map Explainer (map-explainer) from Lemo-Opuscar.
Default size: 1080×1920.

> Real elevation and real imagery built into a three-dimensional map with the vertical exaggerated, lit by one warm, low sun; a sea coloured by its real depth; and over it a layer of data that glows, flows and lights up along true geography: routes, lanes, measurements, pillars. One camera falls from space into the place, flies over it, cuts it open, and climbs back out.
> References (grammar only): news organisations' 3D terrain explainers (a dive from the whole region to the point that matters, then back out); documentary aerials in low raking light (relief stood up by its shadows); nautical charts (lanes, separation zones, soundings, title blocks). Copy none of their colours, icons, typefaces or camera paths; never name them in the film.

## 1. Essence, and what it is not

- **The ground is real data.** Elevation and bathymetry from public tiles, imagery from licence-clean satellite mosaics, coastlines and place names where they really are. Nothing on the ground is invented or traced; whatever is drawn (a route, a pipeline path) is labelled schematic.
- **Two layers.** The terrain says *what this place is like*; the glowing layer says *what happens here*. The data layer is the only thing that glows.
- **Relief stands up.** Heights are exaggerated (about ×3 for a close place, up to ×12 for a whole country, stated on screen) and lit by a low sun, so mountains read even from orbit.
- **The data layer advances.** Each time it appears it does one more thing than before: flow, structure, depth, volume, alternatives, the whole world.
- **One camera, one world.** Globe, region and close-up are the same place at different heights; moving between them is a camera move or a dissolve through the atmosphere, never a cut to a different map.

- **Fahaan channel rules:** no people, faces, figures or face-like icons anywhere; no music and no pitched sound; Somali on screen and in the voice.
- **Vertical, for phones:** the picture's subject lives in 15–62 % of the height, captions in 64–84 %, the top and bottom 15 % hold nothing that must be read (a faint source line may sit just below the captions).

Not Satellite Briefing (grey analyst imagery seen straight down, hairline measurements), not Transit Map (an abstract diagram), not Isometric Infographic or Low-poly Island (no stylised diorama), not Sci-fi Hologram HUD (no invented chrome, no wireframe terrain), not a slide deck over a map (no header bars, centred blocks or page turns).

## 2. Materials & rendering

- **Terrain**: one mesh per level of detail (a detailed grid for the place, a coarser one for the region; the coarse one discards itself under the fine one with a small overlap and is lowered a few tens of metres so the seam never fights). Imagery as albedo, graded warm with a little less saturation and a little more contrast; a roughness map from the land–sea mask, so the sea has a soft sheen and land is matte.
- **The sea**: not the imagery's colour. Shade it by real depth: coastal shallows keep a little of the imagery's texture toned teal, deep water goes to navy. Distances along the coast are measured in kilometres, so every zoom level shades alike.
- **Sun and shadows**: one directional sun about 20° high, a weak sky/ground hemisphere fill. Shadows are **baked** into textures (march toward the sun over the height grid, penumbra widening with distance to the occluder) and multiplied into the direct light; shadow maps shimmer when a camera flies over hundreds of kilometres.
- **The glowing layer**: additive ribbons, not tone-mapped, so only they trigger bloom. Width = the larger of a real width and a minimum in pixels (computed per vertex from the distance to the camera): routes stay 2–3 px from orbit, a lane or a road keeps its true width up close. One shader serves draw-on (reveal), a bright travelling head, flowing pulses, dashed boundaries and wakes or trails behind traffic.
- **Lines on land** (pipelines, borders): the glowing line sits on a dark casing in normal blending, the way charts print a cased line; on bright desert a glow alone washes out.
- **Traffic** (ships, trains, trucks, planes): flat warm-white glyphs with a short fading wake or trail, scaled to stay about the same size on screen at any height; offset a little inside their lane so they never sit on the bright centre line.
- **Data pillars**: stacked slabs, one slab per unit, each with a lit rim; they grow slab by slab where the quantity belongs. A comparison stands side by side, on the same scale, on open ground or water, seen square-on.
- **The cross-section**: cut the map along a meaningful line (the narrowest point, a border, a river); the camera side of the terrain is swept away in about a second and a wall shows the profile: water at real depth times a stated factor (×100–200), a bright surface line, a faint contour every 25 m, a warm sea-floor line and finely striated rock below.
- **The globe**: the same imagery on a sphere (a whole-Earth mosaic plus the regional imagery laid over its own area), a thin Fresnel rim of atmosphere, a dark star field, the night side in shadow. During a dissolve the globe camera is computed from the map camera (latitude, longitude, height, north up) so the two line up.
- **Post**: physical depth of field with the focus on the subject and the aperture proportional to distance (it deepens smoothly as the camera descends), bloom on the glowing layer, a warm grade and vignette, 2× supersampling.
- **2D overlay** for all type and measurements, positioned every frame through one world → screen function.

## 3. Colour logic

- Neutral ground: the place's own colours, warmed. Fahaan accents in the overlay: yellow `#FFD45C` (the word being spoken, key terms, the sun), sky blue `#4189DD` (pins, wet months), mint/teal from the icon. No colour ramps over the terrain.
- **Amber is data** (routes, lanes, the main quantity). **Cool white is boundaries** (lane edges, limits). **Warm white is what moves and what measures** (traffic, rulers, the measured line). A **second data hue** (a teal) appears only when a quantity is compared against the main one; a range is the same hue one step lighter.
- Type on land is dark brown ink, type on water pale sea blue, type on dark shadowed mountains warm white. No outlines, no drop shadows.
- The sea's navy and the night side of the globe are the only large dark areas.

Example (our demo): deep sea #0E2230, shallows #1F5A5C, sand highlight #E8D2A6, data amber #FFA63D / core #FFC36B, boundaries #D9E6EE, traffic #F4E6CF, rulers and the measured line #F6EEE0, land ink #2B2119, sea type #BCDBE6, comparison teal #2FA3B0 / range #8FD6DE.

## 4. Type & subtitles

- **Montserrat** (OFL) for everything: map labels 800 with wide tracking (≈ 0.1 em), 26–36 px, white with a soft dark shadow; key terms and the subject in **Fahaan yellow `#FFD45C`**.
- **Labels sit on the map** where the thing is, through one world → screen function; a pin (white dot with a blue core, a leader up) names the place.
- **Karaoke captions** (every spoken film): the whole line on screen, Montserrat ExtraBold 62 px, centred, ≤ 4 lines, white with a dark stroke and shadow on a soft dark gradient floor; the word being spoken turns yellow with a small pop; words still to come at 82 % white. Word times from the voice audio.
- **Explainer cards** may open over the map for a mechanism the terrain cannot show (a rounded card, thin white rim, a simple side-view diagram, Montserrat labels), never for more than one beat.
- **Sources**: one small line under the captions for the whole film (imagery licence, terrain source, the vertical exaggeration, "Jaantus fudud" for schematic parts).
- **The calendar strip** (when time of year matters): twelve month slabs in a row just above the captions, dry months as low sand blocks and wet months as blue stacks, season names over them in small tracked caps, a yellow ring and marker on the current month that moves with the story. It arrives with a paper slide and stays as long as the year is the subject.
- **The Fahaan end card** (every film): the map pulls back under a dark gradient, the Fahaan icon pops in at the centre with "FAHAAN" in widely tracked Montserrat 800 under it, the call to action as the last karaoke line, held ≥ 2 s.

## 5. Motion quality

- The camera never stops dead: distance interpolates in log space, keys are monotone cubic, holds keep a slow drift.
- The glowing layer arrives by being drawn: lines grow from their source, a lane ignites with a bright head running along its real course, pulses flow in the direction of travel, pillars grow slab by slab on the beat.
- Depth of field, fog and bloom change continuously with height; nothing pops.
- Traffic moves at a time-lapse speed that reads (a few km per film second), all in its lanes.
- **Frame rate and grain**: 24 fps; mux grain 1, a light film grain.

## 6. Camera grammar

| Move | What it expresses | Can serve |
|---|---|---|
| Push in from space | finding the place | an opening |
| Dive and level out (log distance, pitch from ~80° to ~45°) | arriving | a region to its key point |
| Near-locked oblique | reading a measurement | a width, a name, a verdict |
| Orbit + crane down to the cut | looking under the surface | a cross-section |
| Low tracking shot along a line | travelling it | a lane, a river, a road |
| Crane up around a quantity | weight, scale | a pillar growing |
| Big pull-out over the whole region | context, alternatives | routes around, other places |
| Square-on side view | an honest comparison | quantities on one scale |
| Pull back to the globe | consequence | an ending |

Transitions: dissolves through the atmosphere (globe ↔ map, with the cameras matched), the cut that opens the ground, one rhythmic hard cut at most, everything else continuous. At key moments the subject fills a third of the frame; subtitles bottom left; sources in a corner.

## 7. Sound palette

- **No music and no pitched sound, ever**: no instruments, bells, chimes, dings, drums, risers or tonal motifs.
- **Sparse non-musical effects** on transitions and reveals, synthesised from filtered noise and transients: whoosh (camera moves), swipe (a stream or line drawn), soft pop (a card, a cloud, the icon), click (a pin, a calendar cell), paper slide (a strip arriving), a low tearing sweep (a cut through the ground).
- **Beds**, very low and noise-based, only where the picture shows the thing: thin high air from altitude, wind, rain hiss, sea wash, a muffled undersea hush inside a cross-section.
- **Silence**: a near-silence before the turn; the first sound after it is one of the important ones.
- **Mix**: the voice compressed and on top, effects ducked under it, −14 LUFS, true peak ≤ −1 dB.
- **Voice**: Somali, Azure `so-SO-MuuseNeural` (the channel voice), short lines; each specialist term said, then explained.

## 8. Native moves

- **The dive from orbit.** One push from the globe into the place, a dissolve through the atmosphere where the globe and the map share one camera. *Fits content like:* any place that matters to the world; a city in a country; a reef in an ocean.
- **Flows converge.** Points light up and their routes grow and pour into one line. *Fits content like:* commuters into a city centre; tributaries into a river; roads into a pass.
- **A line ignites along its true course.** A bright head runs along the real geometry and leaves the line, its boundaries and its traffic behind. *Fits content like:* a rail line; a border; a pipeline; a migration route.
- **Cut the map open.** Sweep away one side of the terrain along a line and show the profile underneath. *Fits content like:* the depth of a lake; a river valley; a tunnel under a mountain; an aquifer.
- **Fly the line.** A low tracking shot along it, a ruler across it. *Fits content like:* a bridge's span; a canal; a runway; a front line.
- **Quantities on the ground.** A pillar grows where the quantity belongs, and its alternatives grow beside it on the same scale. *Fits content like:* a river's yearly discharge; a dam's output; harvests by region.
- **Back to the world.** Pull out to the globe, the data layer still glowing. *Fits content like:* where things go next; who depends on this place.

Our demo opens on *the dive from orbit*, uses *cut the map open* and *quantities on the ground* as its turns and ends *back to the world*. A new film opens and ends another way: a close, low shot that climbs to reveal the region, a single glowing point on a dark region, an ending on a last quantity held over the place, or the cross-section closing back into the map.

## 9. Pitfalls of the medium

- **Licences**: Sentinel-2 cloudless by EOX is CC BY 4.0 only for the 2016 release (later releases are CC BY-NC-SA); AWS Terrain Tiles (SRTM, GMTED, ETOPO1, GEBCO) are free with attribution; OSM data is ODbL (credit and share-alike for the database): name the terms to the user before using it. Not usable: Google Earth/Maps, Bing, Esri World Imagery, Mapbox Satellite, Maxar, Planet, news photos, AI-generated imagery as ground. Log every download (URL, date) and put the credit line in the picture.
- **Facts**: every number on screen and in the narration needs a named source and a stated basis (whose estimate, which year, what is counted); when sources disagree, show both and say whose is whose. Keep them in `FACTS.md`. Schematic things (routes, simplified pipelines) are labelled as such on screen.
- **Resolution**: z10 terrain is ~150 m per cell; very close flights look soft, small islands are missing (mark them with a dot, do not invent them). Fetch finer data only for the area the camera will really approach.
- **Mercator vs sphere**: the flat map is Web Mercator, the globe is a sphere; matching a dissolve needs the camera converted, not hand-placed, and the dissolve kept short (≈ 0.8 s).
- **Shimmer**: no real-time shadow maps over large flights; no lines under ~2 px; no thin dashes from orbit (fade dashes out with distance).
- **Sun glint**: a camera that looks toward a low sun over water gets a large specular blob that blooms; keep the sea's roughness high enough, or look away from the sun.
- **Glow close to the lens**: a pillar or a lane right in front of the camera blooms into a blob; start growth after the camera has risen, or lower bloom with distance.
- **Comparisons**: a small quantity in a pale colour on bright terrain disappears; use a solid contrasting hue, the same scale, a clean background and number labels as large as the main one, and hold ≥ 2.5 s.
- **Borders and place names**: imagery and terrain carry no borders; draw none unless the film is about them. Labels and any border data follow DIRECTOR.md §13.
- **Ribbons are double-sided**: a flat ribbon whose side vector flips loses its faces to back-face culling.

## 10. Engine

- `demo/main.js`: the whole Fahaan demo on one timeline: terrain mesh with baked shadows and the wetness shader (greening and drying the land by season), the ribbon shader (belt, winds, monsoon, dashed equator), cloud sprites and rain, the subsolar sun, the cross-section wall, the camera track (`CAM` keys, `setViewOffset` to place the subject in 15–62 % of the frame), and the 2D overlay: pins, labels, the explainer card, the season calendar strip, karaoke captions, source line, end card.
- `demo/icon.js`: the Fahaan icon, drawn in code (`drawIcon`); `demo/brand/` renders it as a PNG.
- `demo/post.js`: depth of field, bloom, vignette (from the base demo).
- `demo/tools/`: `fetch_map.py` (terrain and imagery tiles for a bounding box), `prep_map.py` (height grid, graded albedo, depth-shaded sea, water mask, baked shadows), `timeline.py` (scene times from the voice lengths), `words.py` (karaoke word timings from the audio), `fonts.sh`.
- `demo/tts_azure.py` (Muuse through the user's Azure key), `demo/mix.py` (voice plus noise-only effects, −14 LUFS).
- Then the base's techniques: `$LIB/styles/map-explainer/demo/` (globe, ships, pillars, two levels of detail).
- **Extra packages**: none; the data tools use numpy, SciPy, Pillow and soxr from the library's venv.

## 11. Variation space

The agent decides the place, the question, the data layers and their order, the camera path, the exaggeration factors and whether there is narration.

- **Structures**: a funnel (world → region → point → back out); a journey along one line (a river from source to sea); two places compared on one scale; a before/after on the same terrain.
- **Openings**: the globe; a close, low shot that climbs to reveal the region; a single glowing point on a dark region.
- **Endings**: back to the globe; a last quantity held over the place; the cross-section closing back into the map.

---

How our demo was made (story, shots, score, end card, build): [DEMO.md](DEMO.md). Read it after your treatment exists.

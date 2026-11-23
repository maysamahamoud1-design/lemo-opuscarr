#!/bin/sh
# One command: voice timing → captions → events → mix → picture → mux. Run from anywhere.
# Re-voicing needs the Azure key as a network secret: RATE=+6% .venv/bin/python <this folder>/tts_azure.py <this folder>/lines.json <this folder>/voices
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; export LIB
cd "$LIB"
sh "$HERE/tools/fonts.sh"
python3 "$HERE/tools/timeline.py"
.venv/bin/python "$HERE/tools/words.py"
python3 -c "import json;W=json.load(open('$HERE/voices/words.json'));open('$HERE/voices/words.js','w').write('window.WORDS = '+json.dumps(W,ensure_ascii=False)+';\n')"
python3 "$HERE/tools/srt.py"
python3 "$HERE/tools/splice.py" "$HERE/../waayo-vitamin-d/engine-film.js"
node core/render/events.mjs "$HERE" --size 1080x1920
.venv/bin/python "$HERE/mix.py"
node core/render/video.mjs "$HERE" --size 1080x1920 --fps 24 --workers ${WORKERS:-3} --out "$HERE/out/video.mp4"
ffmpeg -y -loglevel error -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$HERE/waayo-beeyo.mp4"
echo "$HERE/waayo-beeyo.mp4"

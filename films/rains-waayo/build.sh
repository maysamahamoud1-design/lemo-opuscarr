#!/bin/sh
# One command: timings → captions → film.js → events → mix → picture → mux. Run from anywhere.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; export LIB
cd "$LIB"
sh "$HERE/tools/fonts.sh"
python3 "$HERE/tools/timeline.py"
.venv/bin/python "$HERE/tools/words.py"
python3 -c "import json;W=json.load(open('$HERE/voices/words.json'));open('$HERE/voices/words.js','w').write('window.WORDS = '+json.dumps(W,ensure_ascii=False)+';\n')"
python3 "$HERE/tools/srt.py"
node core/render/events.mjs "$HERE" --size 1080x1920
.venv/bin/python "$HERE/mix.py"
node core/render/video.mjs "$HERE" --size 1080x1920 --fps 24 --workers ${WORKERS:-3} --out "$HERE/out/video.mp4"
ffmpeg -y -loglevel error -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$HERE/fahaan-waayo-xilli-roobaad.mp4"
echo "$HERE/fahaan-waayo-xilli-roobaad.mp4"

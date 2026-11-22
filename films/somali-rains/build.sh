#!/bin/sh
# One command: data → assets → events → mix → picture → mux. Run from anywhere.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; export LIB
cd "$LIB"
[ -f "$HERE/fonts/Montserrat.ttf" ] || sh "$HERE/tools/fonts.sh"
[ -f "$HERE/assets/meta.json" ] || { .venv/bin/python -I "$HERE/tools/fetch_map.py" "$HERE"; .venv/bin/python -I "$HERE/tools/prep_map.py" "$HERE"; }
python3 "$HERE/tools/timeline.py"
.venv/bin/python "$HERE/tools/words.py"
node core/render/events.mjs "$HERE"
.venv/bin/python "$HERE/mix.py"
node core/render/video.mjs "$HERE" --size 1080x1920 --fps 24 --workers ${WORKERS:-3} --out "$HERE/out/video.mp4"
ffmpeg -y -loglevel error -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$HERE/fahaan-labada-xilli-roobaad.mp4"
echo "$HERE/fahaan-labada-xilli-roobaad.mp4"

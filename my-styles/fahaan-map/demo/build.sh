#!/bin/sh
# Fahaan Map demo: rebuild the film from this folder. Nothing is written inside demo/.
# usage: LIB=/path/to/lemo-opuscar OUT=/some/folder sh build.sh      (FPS=24 WORKERS=3 by default)
LIB=${LIB:-/home/user/lemo-opuscarr}; export LIB
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${OUT:-$HOME/fahaan-map-build}; mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
W="$OUT/work"; rm -rf "$W"; mkdir -p "$W"; cp -R "$HERE/." "$W/"; rm -f "$W/build.sh"
cd "$LIB"
[ -f "$W/fonts/Montserrat.ttf" ] || sh "$W/tools/fonts.sh"
[ -f "$W/assets/meta.json" ] || { .venv/bin/python -I "$W/tools/fetch_map.py" "$W"; .venv/bin/python -I "$W/tools/prep_map.py" "$W"; }
# voices/ holds Muuse's lines; to re-voice, put your Azure key in the environment's network secrets and run: python3 "$W/tts_azure.py"
python3 "$W/tools/timeline.py"
.venv/bin/python "$W/tools/words.py"
node core/render/events.mjs "$W"
.venv/bin/python "$W/mix.py"
node core/render/video.mjs "$W" --size 1080x1920 --fps ${FPS:-24} --workers ${WORKERS:-3} --out "$W/out/video.mp4"
ffmpeg -y -loglevel error -i "$W/out/video.mp4" -i "$W/out/mix.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/test.mp4"
echo "$OUT/test.mp4"

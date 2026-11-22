#!/bin/sh
# Waayo Pictogram demo: rebuild the film from this folder. Nothing is written inside demo/.
# usage: LIB=/path/to/lemo-opuscar OUT=/some/folder sh build.sh
LIB=${LIB:-/home/user/lemo-opuscarr}; export LIB
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${OUT:-$HOME/waayo-pictogram-build}; mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
W="$OUT/work"; rm -rf "$W"; mkdir -p "$W"; cp -R "$HERE/." "$W/"; rm -f "$W/build.sh"
cd "$LIB"
sh "$W/tools/fonts.sh"
# voices/ holds Muuse's lines; to re-voice, put the Azure key in the environment's network secrets and run:
#   RATE=+6% .venv/bin/python "$W/tts_azure.py" "$W/lines.json" "$W/voices"
python3 "$W/tools/timeline.py"
.venv/bin/python "$W/tools/words.py"
python3 -c "import json;W=json.load(open('$W/voices/words.json'));open('$W/voices/words.js','w').write('window.WORDS = '+json.dumps(W,ensure_ascii=False)+';\n')"
python3 "$W/tools/srt.py"
node core/render/events.mjs "$W" --size 1080x1920
.venv/bin/python "$W/mix.py"
node core/render/video.mjs "$W" --size 1080x1920 --fps 24 --workers ${WORKERS:-3} --out "$W/out/video.mp4"
ffmpeg -y -loglevel error -i "$W/out/video.mp4" -i "$W/out/mix.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/test.mp4"
cp "$W/subtitles_so.srt" "$OUT/"
echo "$OUT/test.mp4"

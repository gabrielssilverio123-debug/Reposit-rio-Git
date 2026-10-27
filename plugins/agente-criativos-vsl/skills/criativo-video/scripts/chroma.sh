#!/usr/bin/env bash
# Tela verde: turn a presenter filmed on a green (or blue) screen into a transparent .webm
# for the TelaVerde component. HeyGen avatars can skip this: create_video_from_avatar with
# outputFormat "webm" already returns a transparent video.
# Usage: chroma.sh <in.mp4> <out.webm> [key color, default 0x00d639] [similarity 0.16] [blend 0.08]
set -euo pipefail
IN="$1"; OUT="$2"; KEY="${3:-0x00d639}"; SIM="${4:-0.16}"; BLEND="${5:-0.08}"
ffmpeg -loglevel error -y -i "$IN" \
  -vf "chromakey=$KEY:$SIM:$BLEND,despill=type=green:mix=0.6:expand=0.1,format=yuva420p" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 24 -row-mt 1 -auto-alt-ref 0 -c:a libopus "$OUT"
echo "wrote $OUT (transparent VP9)"

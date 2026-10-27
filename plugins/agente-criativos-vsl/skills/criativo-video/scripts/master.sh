#!/usr/bin/env bash
# Two-pass loudness master for social video: -14 LUFS, true peak <= -1.6 dBTP, video stream copied.
# Usage: master.sh <video.mp4> <audio source (same video, or a separate wav)> <output.mp4>
set -euo pipefail
VIDEO="$1"; AUDIO="$2"; OUT="$3"
FILTER="highpass=f=60,loudnorm=I=-14:TP=-1.6:LRA=11"
J=$(ffmpeg -hide_banner -i "$AUDIO" -af "$FILTER:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
read -r I TP LRA TH OFF <<< "$(echo "$J" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")"
ffmpeg -loglevel error -y -i "$VIDEO" -i "$AUDIO" \
  -filter_complex "[1:a]$FILTER:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000[a]" \
  -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest "$OUT"
printf '%s: ' "$(basename "$OUT")"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A20 Summary | grep -E "I:|Peak:" | tr -s ' ' | tr '\n' ' '
echo

#!/usr/bin/env bash
# Baixa um vídeo de referência (YouTube, TikTok, Instagram, Facebook, link direto) com yt-dlp
# e prepara o material para análise: MP4 até 1080p, áudio WAV 16 kHz e contact sheet.
# Uso: baixar.sh <url> [pasta-de-saida] [nome]
set -euo pipefail
URL="$1"; OUT="${2:-referencias}"; NOME="${3:-ref}"
mkdir -p "$OUT"
command -v yt-dlp >/dev/null || python3 -m pip install -q yt-dlp
yt-dlp --no-playlist --restrict-filenames --no-progress \
  -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/bv*[height<=1080]+ba/b" \
  --merge-output-format mp4 --write-info-json --write-auto-subs --sub-langs "es.*,pt.*,en.*" --convert-subs srt \
  -o "$OUT/$NOME.%(ext)s" "$URL"
V="$OUT/$NOME.mp4"
ffmpeg -nostdin -loglevel error -y -i "$V" -vn -ac 1 -ar 16000 "$OUT/$NOME.wav"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
STEP=$(python3 -c "print(max(0.5, float('$DUR')/24))")
ffmpeg -nostdin -loglevel error -y -i "$V" -vf "fps=1/$STEP,scale=240:-2,tile=8x3" -frames:v 1 "$OUT/$NOME.contact.jpg"
python3 - "$OUT/$NOME.info.json" <<'EOF'
import json, sys
d = json.load(open(sys.argv[1]))
campos = [d.get('title'), d.get('uploader'), f"{d['duration']} s" if d.get('duration') else None,
          f"{d['width']}x{d['height']}" if d.get('width') else None, d.get('webpage_url')]
print(' · '.join(str(c) for c in campos if c))
EOF
echo "Pronto: $V, $OUT/$NOME.wav, $OUT/$NOME.contact.jpg"

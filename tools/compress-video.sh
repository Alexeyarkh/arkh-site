#!/usr/bin/env bash
# Готовит видео для сайта: сжатый MP4 без звука + стоп-кадр JPG.
#
#   tools/compress-video.sh <исходник> <имя> [wide|vertical] [лимит_МБ]
#
#   tools/compress-video.sh ~/Downloads/backstage.mov hero              → assets/video/hero.mp4 + assets/img/hero.jpg
#   tools/compress-video.sh ~/Downloads/backstage.mov hero-mobile vertical 5
#
# wide     — до 1920 px по ширине (по умолчанию, лимит 10 МБ)
# vertical — кадрирование по центру в 9:16, 1080×1920 (лимит 5 МБ)
set -euo pipefail

src=${1:?"Укажите исходный файл"}
name=${2:?"Укажите имя результата, напр. hero"}
mode=${3:-wide}
root=$(cd "$(dirname "$0")/.." && pwd)
out="$root/assets/video/$name.mp4"
poster="$root/assets/img/$name.jpg"
mkdir -p "$root/assets/video" "$root/assets/img"

if [ "$mode" = vertical ]; then
  limit=${4:-5}
  vf="crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos,fps=30"
else
  limit=${4:-10}
  vf="scale='min(1920,iw)':-2:flags=lanczos,fps=30"
fi

encode() {
  ffmpeg -hide_banner -loglevel error -y -i "$src" -an -vf "$vf" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf "$1" \
    -movflags +faststart "$out"
}

for crf in 24 27 30 33; do
  encode "$crf"
  size=$(( $(stat -f%z "$out") / 1024 / 1024 ))
  echo "CRF $crf → ${size} МБ"
  [ "$size" -lt "$limit" ] && break
done

# Стоп-кадр с 1-й секунды (или с начала, если ролик короче)
ffmpeg -hide_banner -loglevel error -y -ss 1 -i "$out" -frames:v 1 -q:v 3 "$poster" 2>/dev/null \
  || ffmpeg -hide_banner -loglevel error -y -i "$out" -frames:v 1 -q:v 3 "$poster"

echo "Готово: ${out#$root/} и ${poster#$root/}"

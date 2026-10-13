#!/usr/bin/env bash
# Готовит видео для сайта: сжатый MP4 без звука + стоп-кадр JPG.
#
#   tools/compress-video.sh <исходник> <имя> [wide|vertical] [лимит_МБ]
#   POSTER_AT=2.5 tools/compress-video.sh …   — с какой секунды взять стоп-кадр (по умолчанию 1)
#   MAXW=1280 tools/compress-video.sh …      — максимальная ширина для wide (по умолчанию 1920)
#   MAXH=1280 tools/compress-video.sh …      — максимальная высота для vertical (по умолчанию 1920)
#   AUDIO=1 tools/compress-video.sh …        — сохранить звук (AAC 128 кбит/с), по умолчанию без звука
#   Имя может содержать папку: works/dominos → assets/video/works/dominos.mp4
#
#   tools/compress-video.sh ~/Downloads/backstage.mov hero              → assets/video/hero.mp4 + assets/img/hero.jpg
#   tools/compress-video.sh ~/Downloads/backstage.mov hero-mobile vertical 5
#
# wide     — до 1920 px по ширине (по умолчанию, лимит 10 МБ)
# vertical — кадрирование по центру в 9:16 без увеличения, до 1080×1920 (лимит 5 МБ)
# Частота кадров сохраняется как в исходнике (25/30 к/с), звук удаляется.
set -euo pipefail

src=${1:?"Укажите исходный файл"}
name=${2:?"Укажите имя результата, напр. hero"}
mode=${3:-wide}
root=$(cd "$(dirname "$0")/.." && pwd)
out="$root/assets/video/$name.mp4"
poster="$root/assets/img/$name.jpg"
mkdir -p "$(dirname "$out")" "$(dirname "$poster")"

if [ "$mode" = vertical ]; then
  limit=${4:-5}
  vf="crop='trunc(min(iw,ih*9/16)/2)*2':'trunc(min(ih,iw*16/9)/2)*2',scale=-2:'min(${MAXH:-1920},ih)':flags=lanczos"
else
  limit=${4:-10}
  vf="scale='min(${MAXW:-1920},iw)':-2:flags=lanczos"
fi

if [ "${AUDIO:-0}" = 1 ] && ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$src" | grep -q .; then
  audio=(-map 0:a:0 -c:a aac -b:a 128k -ac 2)
else
  audio=(-an)
fi

encode() {
  ffmpeg -hide_banner -loglevel error -y -i "$src" -map 0:v:0 "${audio[@]}" -dn -write_tmcd 0 -vf "$vf" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf "$1" \
    -movflags +faststart "$out"
}

for crf in 24 27 30 33; do
  encode "$crf"
  size=$(( $(stat -f%z "$out") / 1024 / 1024 ))
  echo "CRF $crf → ${size} МБ"
  [ "$size" -lt "$limit" ] && break
done

# Стоп-кадр (или с начала, если ролик короче)
ffmpeg -hide_banner -loglevel error -y -ss "${POSTER_AT:-1}" -i "$out" -frames:v 1 -q:v 3 "$poster" 2>/dev/null \
  || ffmpeg -hide_banner -loglevel error -y -i "$out" -frames:v 1 -q:v 3 "$poster"

echo "Готово: ${out#$root/} и ${poster#$root/}"

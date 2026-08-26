#!/usr/bin/env bash
set -euo pipefail

# mp4-to-webp.sh — split MP4 into scrub-ready WebP frames
# Usage: ./scripts/mp4-to-webp.sh input.mp4 [outDir] [fps] [width] [quality]
# Example: ./scripts/mp4-to-webp.sh ./video.mp4 ./src/public/frames 24 1920 75
#
# Requires: ffmpeg with libwebp
# Output: frame_0000.webp ... frame_XXXX.webp + manifest.json

INPUT="${1:-}"
OUTDIR="${2:-./src/public/frames}"
FPS="${3:-24}"
WIDTH="${4:-1920}"
QUALITY="${5:-75}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: $0 <input.mp4> [outDir=./src/public/frames] [fps=24] [width=1920] [quality=75]"
  echo ""
  echo "Splits MP4 into WebP frames for scrub hero."
  echo "  input.mp4  — source video"
  echo "  outDir     — where to write frame_*.webp + manifest.json"
  echo "  fps        — frames per second to extract (24 = 60 frames for 2.5s)"
  echo "  width      — max width, height auto (1920 = 1080p)"
  echo "  quality    — webp q 0-100 (75 = ~40-60KB/frame)"
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "✗ Input not found: $INPUT"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "✗ ffmpeg not found. Install:"
  echo "  macOS:   brew install ffmpeg"
  echo "  Ubuntu:  sudo apt update && sudo apt install -y ffmpeg"
  echo "  Arch:    sudo pacman -S ffmpeg"
  exit 1
fi

# check libwebp
if ! ffmpeg -encoders 2>&1 | grep -q libwebp; then
  echo "✗ ffmpeg built without libwebp. Reinstall with libwebp support."
  exit 1
fi

mkdir -p "$OUTDIR"
rm -f "$OUTDIR"/frame_*.webp "$OUTDIR"/manifest.json

echo "→ Input:    $INPUT"
echo "→ Out:      $OUTDIR"
echo "→ fps=$FPS width=$WIDTH q=$QUALITY"
echo ""

# Get duration for info
DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT" 2>/dev/null || echo "?")
echo "→ Duration: ${DUR}s"

# Extract frames
# -vf fps + scale (lanczos), -q:v 0-100 for webp, -compression_level 4 (0-6), no loop
ffmpeg -hide_banner -loglevel info \
  -i "$INPUT" \
  -vf "fps=${FPS},scale=${WIDTH}:-2:flags=lanczos" \
  -c:v libwebp \
  -q:v "$QUALITY" \
  -compression_level 4 \
  -vsync 0 \
  -an \
  "$OUTDIR/frame_%04d.webp"

COUNT=$(ls -1 "$OUTDIR"/frame_*.webp 2>/dev/null | wc -l | tr -d ' ')
SIZE=$(du -sh "$OUTDIR" | cut -f1)
AVG=$(du -sk "$OUTDIR" | awk -v c="$COUNT" '{printf "%.0f", $1/c}')

# manifest for hero
FIRST=$(ls "$OUTDIR"/frame_*.webp 2>/dev/null | head -n 1)
W=0; H=0
if [[ -n "$FIRST" ]] && command -v ffprobe >/dev/null 2>&1; then
  W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$FIRST" 2>/dev/null || echo 0)
  H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$FIRST" 2>/dev/null || echo 0)
fi

cat > "$OUTDIR/manifest.json" <<JSON
{
  "source": "$(basename "$INPUT")",
  "frames": $COUNT,
  "fps": $FPS,
  "width": $WIDTH,
  "quality": $QUALITY,
  "size": "$SIZE",
  "avgKB": $AVG,
  "dimensions": { "width": $W, "height": $H },
  "pattern": "frame_%04d.webp"
}
JSON

echo ""
echo "✓ Done: $COUNT frames → $OUTDIR ($SIZE, ~${AVG}KB/frame)"
echo "  Preview: ls $OUTDIR | head"
echo "  Manifest: $OUTDIR/manifest.json"
echo ""
echo "  Usage in hero:"
echo "    import frames from './frames/manifest.json'"
echo "    const urls = Array.from({length: $COUNT}, (_,i) => \`/frames/frame_\${String(i).padStart(4,'0')}.webp\`)"

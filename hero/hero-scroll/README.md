# hero-scroll

Scrub hero — asset-first, scroll-driven. Built to ship to npm as `hero-scroll`.

- **Asset focus** — 90% image/canvas, <10% text. Minimal badge + frame counter. Poster fallback.
- **Scrub** — `height="300vh"` sticky container, scroll progress `0→1` maps to `frame_0000.webp` → `frame_XXXX.webp` on `<canvas>` (DPR-aware, `drawImage` cover)
- **No deps** — `react` + `tailwind` only (Radix-free). Canvas, not video, for frame-accurate scrub

## MP4 vs WebP frames — which for scrub?

**Use WebP frames for scrub, MP4 for autoplay.**

|  | MP4 (single file) | WebP frames (60×) |
|---|---|---|
| **Size** | `5s 1080p H.264 ~2-4MB` — one request, good compression | `60× webp q75 1920w ~40-60KB = 2.4-3.6MB total` — similar total, but 60 requests |
| **Scrub** | ❌ janky — `video.currentTime = progress*duration` seeks keyframes, not frame-accurate, needs whole file downloaded, decode stalls | ✅ instant — `canvas.drawImage(frames[i])` per scroll, no seeking, preload first 3 then lazy rest, `requestAnimationFrame` |
| **Control** | `timeupdate` ~250ms, no sub-frame | `scrollY` → `frameIndex` exact, 60fps |
| **Loading** | Must download 2-4MB before scrub works | Progressive — first frame ~50KB shows immediately, rest stream in, visible `loaded/total` |
| **NPM** | Heavy — 4MB binary in `dist` bloats package, not cacheable per frame | Light — `dist` only JS (12k) + `header.css`, frames live in consumer `public/frames` or CDN, not in npm |

**Verdict:** For hero *scrub* use **WebP frames**. For hero *autoplay loop* use **MP4/WebM** (`<video autoplay muted loop>`). WebP is ~30% smaller than JPEG at same quality, supports alpha, decodes fast. AVIF is ~20% smaller again but decode slower — WebP is sweet spot for 60fps scrub.

## Split MP4 → WebP frames

`src/public` is your hero assets (not published to npm — `files:["dist"]` keeps npm light).

```bash
# 1. Put your master in src/public/source.mp4 (or anywhere)
# 2. Run — outputs to src/public/frames + manifest.json

# bash
./scripts/mp4-to-webp.sh ./src/public/source.mp4 ./src/public/frames 24 1920 75

# node
node scripts/mp4-to-webp.mjs ./src/public/source.mp4 ./src/public/frames 24 1920 75

# outputs:
#   src/public/frames/frame_0000.webp
#   src/public/frames/frame_0001.webp
#   ...
#   src/public/frames/manifest.json
```

**Params:** `fps=24` → 60 frames for 2.5s, `width=1920` (height auto, lanczos), `quality=75` (40-60KB/frame). Adjust for mobile: `1280 70` is smaller.

Requires `ffmpeg` with `libwebp`:
```bash
brew install ffmpeg        # macOS
sudo apt install ffmpeg    # Ubuntu
```

No ffmpeg? Download demo frames from CDN and skip local split.

## Usage

```tsx
import { HeroScroll } from "hero-scroll"
import "hero-scroll/styles.css"

// frames as URLs — host in /public/frames or CDN
const frames = Array.from({ length: 60 }, (_, i) =>
  `/frames/frame_${String(i).padStart(4, "0")}.webp`
)

export default function Page() {
  return (
    <HeroScroll
      frames={frames}
      poster="/frames/poster.webp" // fallback while frames load
      height="300vh"                // scrub distance
      label="ACME — 001"
      sublabel="Scroll to scrub • 60 frames"
    />
  )
}
```

No `frames`? Falls back to single `poster` image with parallax.

## Scripts

- `scripts/mp4-to-webp.sh` — bash, `ffmpeg -vf "fps=...,scale=..." -c:v libwebp`
- `scripts/mp4-to-webp.mjs` — node wrapper, same ffmpeg call, writes `manifest.json`

Both default to `./src/public/frames` — your hero assets dir.

## Publish

```bash
npm run build # tsc + vite lib → dist/hero-scroll.es.js (12k) + hero-scroll.css
npm publish --access public
```

Consumer keeps frames in their `public/frames` or CDN, not in npm.

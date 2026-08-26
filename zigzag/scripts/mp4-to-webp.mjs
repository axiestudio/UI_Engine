#!/usr/bin/env node
// mp4-to-webp.mjs — Node wrapper for ffmpeg WebP frames, scrub-ready
// Usage: node scripts/mp4-to-webp.mjs input.mp4 [outDir] [fps] [width] [quality]
// Example: node scripts/mp4-to-webp.mjs ./video.mp4 ./src/public/frames 24 1920 75

import { spawn } from "node:child_process"
import { mkdirSync, readdirSync, statSync, writeFileSync, existsSync, rmSync } from "node:fs"
import { basename, resolve } from "node:path"

const [, , input, outDirArg, fpsArg, widthArg, qualityArg] = process.argv

if (!input) {
  console.log(`
mp4-to-webp — split MP4 into scrub-ready WebP frames

Usage: node scripts/mp4-to-webp.mjs <input.mp4> [outDir] [fps] [width] [quality]

  input.mp4  source video
  outDir     default ./src/public/frames
  fps        default 24
  width      default 1920
  quality    default 75 (0-100)

Example: node scripts/mp4-to-webp.mjs ./demo.mp4 ./src/public/frames 24 1280 75
`)
  process.exit(1)
}

const outDir = resolve(outDirArg || "./src/public/frames")
const fps = fpsArg || "24"
const width = widthArg || "1920"
const quality = qualityArg || "75"

if (!existsSync(input)) {
  console.error(`✗ Input not found: ${input}`)
  process.exit(1)
}

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: "inherit" })
    p.on("close", (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))))
    p.on("error", rej)
  })
}

async function main() {
  // check ffmpeg
  try {
    await run("ffmpeg", ["-version"])
  } catch {
    console.error(`✗ ffmpeg not found.
Install:
  macOS:   brew install ffmpeg
  Ubuntu:  sudo apt update && sudo apt install -y ffmpeg
  Arch:    sudo pacman -S ffmpeg`)
    process.exit(1)
  }

  mkdirSync(outDir, { recursive: true })
  // clean previous
  for (const f of readdirSync(outDir)) {
    if (f.startsWith("frame_") && f.endsWith(".webp")) rmSync(`${outDir}/${f}`)
    if (f === "manifest.json") rmSync(`${outDir}/${f}`)
  }

  console.log(`→ Input: ${input}`)
  console.log(`→ Out:   ${outDir}`)
  console.log(`→ fps=${fps} width=${width} q=${quality}\n`)

  const vf = `fps=${fps},scale=${width}:-2:flags=lanczos`
  const args = [
    "-hide_banner",
    "-loglevel",
    "info",
    "-i",
    input,
    "-vf",
    vf,
    "-c:v",
    "libwebp",
    "-q:v",
    quality,
    "-compression_level",
    "4",
    "-vsync",
    "0",
    "-an",
    `${outDir}/frame_%04d.webp`,
  ]

  await run("ffmpeg", args)

  const frames = readdirSync(outDir).filter((f) => f.startsWith("frame_") && f.endsWith(".webp"))
  const count = frames.length
  let total = 0
  for (const f of frames) total += statSync(`${outDir}/${f}`).size
  const avgKB = count ? Math.round(total / count / 1024) : 0
  const sizeMB = (total / 1024 / 1024).toFixed(2)

  const manifest = {
    source: basename(input),
    frames: count,
    fps: Number(fps),
    width: Number(width),
    quality: Number(quality),
    size: `${sizeMB}MB`,
    avgKB,
    pattern: "frame_%04d.webp",
  }
  writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2))

  console.log(`\n✓ Done: ${count} frames → ${outDir} (${sizeMB}MB, ~${avgKB}KB/frame)`)
  console.log(`  Manifest: ${outDir}/manifest.json`)
  console.log(`\n  Usage:`)
  console.log(`    const urls = Array.from({length:${count}}, (_,i) => \`/frames/frame_\${String(i).padStart(4,'0')}.webp\`)`)
  console.log(`    <HeroScroll frames={urls} />`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

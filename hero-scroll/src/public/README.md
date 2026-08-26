# src/public — hero assets

This is your hero asset source for `hero-scroll`. **Not published to npm** (`files:["dist"]`).

- Put master `source.mp4` here (e.g., product turntable, 3D render)
- Run `../scripts/mp4-to-webp.sh` to split into `frames/frame_*.webp`
- `frames/` is the scrub sequence consumed by `<HeroScroll frames={...} />`
- `poster.webp` optional fallback

Example:
```
src/public/
  source.mp4          ← your master (gitignored if large)
  frames/
    frame_0000.webp
    frame_0001.webp
    ...
    manifest.json
  poster.webp
```

Engine preview imports via `frames` prop (remote URLs or `/frames/...` if you copy to engine/public).

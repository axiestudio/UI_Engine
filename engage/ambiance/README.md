# ambiance — UI preset

**Job:** make the room felt through the screen. The decision to book is emotional before it is rational — ambiance carries the feeling that photos-in-a-grid can't.
**Emotion:** sensory calm. Unhurried, lived-in warmth. Never a real-estate slider.
**Signature move:** the diorama — anchor portrait plus two floating tiles drifting at *different* scroll speeds (parallax depth). Motion is spent entirely on depth; it rests as a calm horizontal strip under `lg` (the drifting layers would read as noise without the desktop canvas).

**Craft:**
- Type: one whisper line (display serif, `tracking-[-0.035em]`, leading 1.15) + lowercase mono kicker. Copy defaults to a tone-setting sentence — override `line`.
- Rhythm: full-bleed band; 5:4 anchor, side tiles 300/280px; no card chrome — the images are the borders.
- Texture: 5% radial-dot grain over the anchor; gradient caption veil on mobile.
- Motion: `useScroll` range "start end"→"end start", 42px slow / 75px fast (props `drift`), reduced-motion → static layered collage + fade-in only.
- Details: every image carries its alt; captions exist twice (visual ledger on desktop `sr-only` on tiles once).

**Provenance:** Watermelon `hero-4` (parallax craft base, vendored) · Motion-Primitives `in-view`. Vendored hero keeps upstream logo placeholder `src/assets/logo-icon.tsx` — override via `<Hero4 logo=…>`.

```tsx
<Ambiance
  kicker="stepping inside"
  line="low lamps, warm stone, the particular quiet of a place that has nothing to sell you in this minute"
  shots={[{ src: "/room.webp", alt: "Treatment room" }, { src: "/oils.webp", alt: "Oils" }, { src: "/halls.webp", alt: "Hall" }]}
/>
```
Build: `npm run build --workspace=ambiance`

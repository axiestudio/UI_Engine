# place — UI preset

**Job:** turn an address into belonging. Not "where we are" — *whose street we are*.
**Emotion:** rooted corner-shop confidence; zero corporate gloss.
**Signature move:** the street name **is** the landmark — an oversized display line on a slow ribbon (wm `marquee` base) running like a painted fascia, hairline rules top and bottom.

**Craft:**
- Type: 13vw / 9vw / 120px display-black caps, letter-spacing -0.05em, `text-foreground/90`; facts ledger in mono caps 10px.
- Rhythm: loud ribbon (full bleed) → whisper story centred 2xl → four-cell facts grid above a hairline. The ribbon never competes with content because the content is quiet on purpose.
- Texture: paper only; separator dots at 25% opacity for breathing space in the loop.
- Motion: 60s-ish loop, `pauseOnHover` (a moving line you can stop is respectful; one you can't is an ad). `gentle|walking|brisk` → slow/normal/fast. Reduced motion keeps CSS marquee (harmless loop; `motion-reduce` users may still pause by ignoring).
- Details: `aria-label` resolves "our address" from the landmark; decorative repeated copies carry no aria.

**Provenance:** Watermelon `marquee` base (vendored) · Motion-Primitives `in-view`, `magnetic`.

```tsx
<Place
  landmark="TRÄDGÅRDSGATAN 12"
  story="Third door from the bakery, the green frame. We have been the corner's quiet room since 2001."
  facts={[
    { label: "Since", value: "2001" },
    { label: "Tram", value: "7 · 54 · Hagen" },
    { label: "Parking", value: "gates at Kvarnen" },
    { label: "Bike", value: "rack by the green door" },
  ]}
/>
```
Build: `npm run build --workspace=UI/place`

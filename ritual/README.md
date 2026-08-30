# ritual — UI preset

**Job:** kill first-visit anxiety by showing the arc of the appointment — order + minutes. Predictability is the product.
**Emotion:** reassurance through clarity.
**Signature move:** **the rail draws itself.** A 1px line scales down with your scroll and each step's dot lights from ghost to ink exactly when the line arrives — the path is being made for you, in real time.

**Craft:**
- Type: ghost numerals — step `01…07` set 64px mono at 7% ink *behind* the title (watermark, not list bullets); right-aligned mono durations like a train timetable.
- Rhythm: 40px step separation, one hairline spine, `before/after` notes end the rail like a programme's last page.
- Texture: paper. The line *is* the structure.
- Motion: `useScroll`+spring on the spine (no per-card entrance — a moving deck under a static line kills the illusion; only the dots and line move). Reduced-motion: spine full height, dots lit.
- Details: dot lights at viewport centre band (`margin:"-25% 0px -45%"`); durations tabular-nums; `ol` semantics.

**Provenance:** Watermelon `stepper` (numbered craft base, exported `Stepper`) · Motion-Primitives `border-trail`, `in-view`.

```tsx
<Ritual
  steps={[
    { title: "Tea, shoes off", duration: "5 min", body: "The corner chair, not a clipboard." },
    { title: "We talk", duration: "10 min", body: "Where it hurts, what you want from the hour." },
    { title: "The table", duration: "60 min", body: "Lights low, blanket to the shoulders." },
    { title: "Water & the quiet corner", duration: "10 min", body: "No reception small-talk required." },
  ]}
  beforeNote="Arrive ten minutes early if you can."
  afterNote="Water today. Skip the gym tonight."
/>
```

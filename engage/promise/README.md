# promise — UI preset

**Job:** carry a vow. Convert the stranger's "what if it's bad?" into *this place has standards*.
**Emotion:** quiet strength — a signature at the bottom of a contract you'd actually sign.
**Signature move:** ink-drying words. The oath lands word-by-word through chained `TextEffect` runs, with `*emphasis*` segments underlined after settling. Reduced motion → full sentence with underlines, zero animation.

**Craft:**
- Type: oversized display serif (46px), leading 1.08, tracking -0.035em. No weight hierarchy — the emphasis *is* the hierarchy (underlined ink).
- Rhythm: kicker → 8 units of air → oath → rule-to-rule ledger of mono facts (`label … value` right-aligned, 11px) → a hand-drawn signature (inline SVG stroke) — paper, whitespace, zero cards.
- Texture: none deliberately. A promise competes with nothing.
- Details: `dl` semantics for facts (screen-reader label/value pairs), `aria-label="Our promise"`.

**Provenance:** Motion-Primitives `text-effect` (chained), `in-view`.

```tsx
<Promise
  statement="If you are not certain the tension moved, the *next session is on us*."
  facts={[
    { label: "Reply to every message", value: "< one business day" },
    { label: "First session", value: "longer, never shorter" },
  ]}
  signature={{ name: "Astrid Lindqvist", role: "founder & therapist, 24 years" }}
/>
```
Build: `npm run build --workspace=promise`

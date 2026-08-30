# quote-feature — UI preset

**Job:** one real sentence of praise, given the whole room. Walls scroll; this stops you.
**Emotion:** sincerity — and the pride of being able to show it.
**Signature move:** the quote mark as architecture. A ~300px display “ sits behind the type like a stone slab, and the sentence **drifts across its edge** as if it doesn't need permission. Beneath, the voices the quote was chosen from rotate on a slow mono TextLoop.

**Craft:**
- Type: 26→34px display-bold quote, leading 1.22; attribution mono 11px `tracking-[0.22em]` — loud thing says one thing, small thing names who.
- Rhythm: 96–128px vertical; the glyph overhangs the top edge to keep it architecture, not clip-art.
- Texture: none. The whitespace is the exhibit label.
- Motion: single InView breath; TextLoop 3.5s (first voice under reduced motion).
- Details: single voice → static attribution; `moreLink` hands off to the wall (`testimonials` preset).

**Provenance:** Watermelon `testimonials-2` (source of craft, exported verbatim `Testimonials2`) · Motion-Primitives `text-loop`, `in-view`.

```tsx
<QuoteFeature
  quote="I walked in with a knot in my shoulder. I walked out whistling."
  author="Priya S." role="eight years, one Saturday a month"
  alsoFrom={["Jonas B.", "Mara L.", "Elin H."]}
  moreLink={{ label: "Read 1,839 more", href: "/reviews" }}
/>
```

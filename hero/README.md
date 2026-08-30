# hero — UI preset

Launch hero: `split` (copy + visual) or `centered`. Blur-revealed title highlight, glow CTA ring (Motion-Primitives glow-effect), dot-grid texture, avatar + rating social proof row. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `avatar`, `separator`, `card`); Motion-Primitives `text-effect`, `in-view`, `spotlight`, `glow-effect`.

```tsx
<Hero
  eyebrow="New"
  title="Care that shows up."
  titleHighlight="Exactly when it should."
  subtitle="Book a certified therapist in under a minute."
  primaryAction={{ label: "Book a session", href: "/book" }}
  secondaryAction={{ label: "How it works", href: "#how" }}
  proof={{ avatars: [{ initials: "AL" }, { initials: "MK" }], rating: 4.9, ratingLabel: "from 1,800+ sessions" }}
  visual={<img src="/app.png" alt="App" className="rounded-2xl border shadow-2xl" />}
/>
```

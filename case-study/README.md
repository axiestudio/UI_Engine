# case-study — UI preset

Customer story: feature quote with brand line, author, tag chips, metric tiles row and optional image panel; spotlight hover on paper tone. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `card`, `separator`); Motion-Primitives `in-view`, `spotlight`.

```tsx
<CaseStudy
  eyebrow="Customer story"
  brand="Aurum Studio"
  quote="We replaced three tools and doubled rebookings in a quarter."
  author={{ name: "Astrid Lind", role: "Founder" }}
  metrics={[{ value: "2x", label: "Rebookings" }, { value: "-40%", label: "No-shows" }, { value: "4.9", label: "Rating" }]}
  cta={{ label: "Read the full story", href: "/customers/aurum" }}
/>
```

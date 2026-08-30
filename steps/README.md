# steps — UI preset

How-it-works process section: numbered step cards connected by a horizontal line, oversized outlined display numbers, optional icon chips. Tone `paper` (bordered cards) or `ink` (dark band). Staggered in-view reveal, blur-in title, respects reduce-motion consumers.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `card`); Motion-Primitives `in-view`, `border-trail`, `text-effect`.

```tsx
<Steps
  eyebrow="Process"
  title="How it works"
  items={[{ icon: CalendarCheck, title: "Book online", description: "Pick a slot in under a minute." }, { icon: Sparkles, title: "We prepare", description: "Your session is set up before you arrive." }]}
/>
```

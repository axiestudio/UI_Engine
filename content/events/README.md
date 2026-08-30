# events — UI preset

Events & webinars: date-block cards (day + month + note), featured card gets an animated border trail, meta rows (time / format / host), register CTAs. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `card`, `separator`); Motion-Primitives `in-view`, `border-trail`.

```tsx
<Events
  events={[
    { day: "12", month: "SEP", dateNote: "Thu · 15:00 CET", title: "Live Q&A: booking flows", featured: true, meta: [{ label: "Format", value: "Webinar" }], href: "/events/qa" },
    { day: "03", month: "OCT", title: "Workshop: intake forms" },
  ]}
/>
```

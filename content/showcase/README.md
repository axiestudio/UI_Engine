# showcase — UI preset

App screenshot showcase: browser-chrome framed hero shot (traffic lights, address bar), thumbnail switcher buttons, spotlight hover, optional caption per frame. `ink` (default) or `paper`.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `card`); Motion-Primitives `in-view`, `spotlight`, `border-trail`.

```tsx
<Showcase
  eyebrow="Product tour"
  title="See it in action"
  shots={[
    { src: "/shots/dashboard.png", alt: "Dashboard", label: "Dashboard" },
    { src: "/shots/reports.png", alt: "Reports", label: "Reports", caption: "Weekly digests, zero config." },
  ]}
/>
```

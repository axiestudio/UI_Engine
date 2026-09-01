# drawer — UI preset

Slide-in side drawer with token-styled trigger, header, stacked action rows and an optional sticky footer. Built on **Vaul** (Radix Dialog semantics) — drag-to-close included.

**Provenance:** Watermelon UI `drawer` (Vaul-based); Motion-Primitives `in-view`.

```tsx
<Drawer
  title="Menu"
  description="Everything you need"
  items={[
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing", primary: true },
    { label: "Blog", href: "/blog" },
  ]}
  footer="Book now"
  onOpenChange={(open) => console.log(open)}
/>
```

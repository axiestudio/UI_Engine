# compare — UI preset

Feature comparison table: your product as the highlighted column (shaded + "This product" badge) against alternatives; cells accept `true` (check), `false` (cross), `"partial"` (minus) or a string; CTA row at the bottom. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`table`, `button`, `badge`, `card`); Motion-Primitives `in-view`.

```tsx
<Compare
  products={[
    { name: "Ours", highlight: true, cta: { label: "Start free", href: "/signup" } },
    { name: "Other A" },
    { name: "Other B" },
  ]}
  features={[
    { feature: "Real-time booking", values: [true, false, true] },
    { feature: "Custom domain", values: [true, "Add-on", false] },
  ]}
/>
```

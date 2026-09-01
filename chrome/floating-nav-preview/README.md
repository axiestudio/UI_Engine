# floating-nav-preview — UI preset

Floating page-turner nav: a set of page cards that open from a floating trigger, positioned by **Floating UI** (middleware: auto-placement + shift), with spring transitions via `motion/react`.

**Provenance:** Floating UI `@floating-ui/react`; Motion-Primitives `in-view`.

```tsx
<FloatingNavPreview
  brand="CLIENT"
  pages={[
    { label: "Home", href: "/" },
    { label: "Work", href: "/work" },
    { label: "Journal", href: "/journal" },
  ]}
/>
```

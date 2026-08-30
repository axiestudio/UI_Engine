# careers — UI preset

Careers board: job rows with location/type meta, department badges, arrow hover affordance; groups rows by department when present. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `card`); Motion-Primitives `in-view`.

```tsx
<Careers
  jobs={[
    { title: "Senior Frontend Engineer", department: "Engineering", location: "Remote (EU)", type: "Full-time", href: "/careers/frontend" },
    { title: "Product Designer", department: "Design", location: "Stockholm", type: "Full-time", href: "/careers/designer" },
  ]}
/>
```

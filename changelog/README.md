# changelog — UI preset

Product changelog feed: versioned releases with date column, typed change rows (New / Improved / Fixed / Breaking / Note with icons), "Latest" badge with animated border trail, optional subscribe CTA. Tone `paper` or `ink`. Entries stagger in on scroll.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `card`); Motion-Primitives `in-view`, `border-trail`, `scroll-progress`.

```tsx
<Changelog
  releases={[
    { version: "v2.4.0", date: "Aug 28, 2026", title: "Faster bookings", changes: [
      { type: "feature", text: "Recurring appointments." },
      { type: "fix", text: "Timezone drift on weekly slots." },
    ]},
  ]}
  subscribe={{ label: "Subscribe to updates", href: "/rss.xml" }}
/>
```

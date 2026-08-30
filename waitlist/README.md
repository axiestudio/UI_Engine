# waitlist — UI preset

Coming-soon waitlist: full-viewport (or section) centered launch page with pulsing "Launching soon" chip, oversized display headline with blur reveal, glow CTA email capture → inline success state, optional signup counter, dot-grid texture. `ink` (default) or `paper`.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `input`); Motion-Primitives `text-effect`, `in-view`, `glow-effect`.

```tsx
<Waitlist
  title="Something good"
  titleHighlight="is coming soon."
  count={1841}
  onSubmit={async (email) => joinWaitlist(email)}
/>
```
